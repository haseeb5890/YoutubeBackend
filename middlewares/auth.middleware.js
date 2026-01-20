import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError("Access token is missing", 401);
    }
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken",
    );

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(error || "Invalid access token", 401);
  }
});
