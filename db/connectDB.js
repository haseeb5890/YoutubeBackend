import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    console.log(connectionInstance.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
export default connectDB;
