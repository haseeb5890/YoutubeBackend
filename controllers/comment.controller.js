import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comment = await Comment.create({
    content: content,
    video: mongoose.Types.ObjectId(videoId),
    owner: mongoose.Types.ObjectId(req.user._id),
  });

  res.status(201).json(new ApiResponse(true, "Comment added", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  comment.content = content;
  await comment.save();

  res.status(200).json(new ApiResponse(200, "Comment updated", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json(new ApiResponse(200, "Comment deleted", comment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
