import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filePath); // Remove the local file after successful upload
    return result;
  } catch (error) {
    fs.unlinkSync(filePath); // Remove the local file in case of error
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
const deleteLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting local file:", err);
    }
  });
};

export { uploadOnCloudinary, deleteLocalFile };
