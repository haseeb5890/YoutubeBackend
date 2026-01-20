import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteLocalFile } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { request } from "node:http";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(`Error generating access token`, 500);
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  // get user data from req.body

  const { email, password, fullName, username } = req.body || {};
  console.log(email);

  //validate data, eg email, password not empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(`All fields are required`, 400);
  }

  // check if user already exists in DB
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    if (req.files?.avatar?.[0]?.path)
      deleteLocalFile(req.files?.avatar?.[0]?.path);
    if (req.files?.coverImage?.[0]?.path)
      deleteLocalFile(req.files?.coverImage?.[0]?.path);
    throw new ApiError(
      `User with email ${email} or username ${username} already exists`,
      400,
    );
  }
  //check avatar and cover images
  const avatarLocalPath = req.files?.avatar?.[0]?.path || null;

  //   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    if (req.files?.avatar?.[0]?.path)
      deleteLocalFile(req.files?.avatar?.[0]?.path);
    if (req.files?.coverImage?.[0]?.path)
      deleteLocalFile(req.files?.coverImage?.[0]?.path);
    throw new ApiError(`Avatar image is required`, 400);
  }
  console.log(avatarLocalPath, coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(`Error uploading avatar image`, 500);
  }

  // create a user object
  const user = await User.create({
    fullName,
    username,
    email,
    avatar: avatar.url,
    password,
    coverImage: coverImage ? coverImage.url : "",
  });

  // remove password from user object before sending response
  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    deleteLocalFile(req.files?.avatar[0]?.path);
    deleteLocalFile(coverImageLocalPath);
    throw new ApiError(`Error creating the user`, 500);
  }

  // return response with success message
  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));

  //save in db
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  if (!email && !username) {
    throw new ApiError(`Email or Username is required`, 400);
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(`User does not exist`, 400);
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(`Invalid credentials`, 400);
  }
  const tokens = await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
    // sameSite: "None",
  };
  return res
    .status(200)
    .cookie("accessToken", tokens.accessToken, options)
    .cookie("refreshToken", tokens.refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", { user, tokens }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Clear the cookies

  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: null },
    { new: true },
  );
  const options = {
    httpOnly: true,
    secure: true,
    // sameSite: "None",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!refreshToken) {
    throw new ApiError("Refresh token is missing", 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);

    if (!user) {
      throw new ApiError("Invalid refresh token", 401);
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError("Refresh token does not match or expired", 401);
    }

    const tokens = await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
      // sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", { tokens }),
      );
  } catch (error) {
    throw new ApiError(error || "Invalid refresh token", 401);
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
