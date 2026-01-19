import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteLocalFile } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  // get user data from req.body

  const { email, password, fullName, username } = req.body || {};
  console.log(email);

  //validate data, eg email, password not empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    deleteLocalFile(req.files?.avatar[0]?.path);
    deleteLocalFile(req.files?.coverImage?.[0]?.path);
    throw new ApiError(`All fields are required`, 400);
  }

  // check if user already exists in DB
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    deleteLocalFile(req.files?.avatar[0]?.path);
    deleteLocalFile(req.files?.coverImage?.[0]?.path);
    throw new ApiError(
      `User with email ${email} or username ${username} already exists`,
      400,
    );
  }
  //check avatar and cover images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(`Avatar image is required`, 400);
  }
  console.log(avatarLocalPath, coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(`Error uploading avatar image`, 500);
  }

  const user = await User.create({
    fullName,
    username,
    email,
    avatar: avatar.url,
    password,
    coverImage: coverImage ? coverImage.url : "",
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    deleteLocalFile(req.files?.avatar[0]?.path);
    deleteLocalFile(req.files?.coverImage?.[0]?.path);
    throw new ApiError(`Error creating the user`, 500);
  }
  if (Error) {
    deleteLocalFile(req.files?.avatar[0]?.path);
    deleteLocalFile(req.files?.coverImage?.[0]?.path);
  }
  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));

  // create a user object
  // hash password
  // remove password from user object before sending response
  // return response with success message
  //save in db
});

export default registerUser;
