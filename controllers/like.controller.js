import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const existingLike = await Like.findOne({ likedBy: userId, video: videoId });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully"));
  }
  const newLike = await Like.create({ likedBy: userId, video: videoId });
  return res
    .status(200)
    .json(new ApiResponse(200, "Video liked successfully", newLike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const existingLike = await Like.findOne({
    likedBy: userId,
    comment: commentId,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully"));
  }
  const newLike = await Like.create({ likedBy: userId, comment: commentId });
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully", newLike));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  //TODO: toggle like on tweet
  const userId = req.user?._id;
  const existingLike = await Like.findOne({ likedBy: userId, tweet: tweetId });
  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet unliked successfully"));
  }
  const newLike = await Like.create({ likedBy: userId, tweet: tweetId });
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked successfully", newLike));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;
  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $ne: null },
  }).populate("video");
  res
    .status(200)
    .json(
      new ApiResponse(200, "Liked videos retrieved successfully", likedVideos),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
