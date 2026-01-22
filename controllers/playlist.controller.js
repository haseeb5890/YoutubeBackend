import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;
  const newPlaylist = new Playlist({ name, description, owner });
  await newPlaylist.save();
  res
    .status(201)
    .json(new ApiResponse(200, "Playlist created successfully", newPlaylist));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const playlists = await Playlist.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        // gets video not only with the id but all details
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
  ]);
  if (!playlists) {
    throw new ApiError(404, "Playlists not found for this user");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "User playlists fetched successfully", playlists),
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "-password -refreshToken -email");
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (playlist.videos.includes(videoId)) {
      throw new ApiError(400, "Video already in playlist");
    }
    playlist.videos.push(videoId); // .push to add in the array
    await playlist.save();
  } catch (error) {
    throw new ApiError(500, "Operation failed while adding video to playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  const videoIndex = playlist.videos.indexOf(videoId);
  if (videoIndex === -1) {
    throw new ApiError(404, "Video not found in playlist");
  }
  playlist.videos.splice(videoIndex, 1); // remove video from array
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video removed from playlist successfully",
        playlist,
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", null));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: { name, description } },
    { new: true },
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  returnres
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
