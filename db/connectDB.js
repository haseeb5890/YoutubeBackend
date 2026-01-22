import mongoose from "mongoose";
import dotenv from "dotenv";

// dotenv.config();

const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4, // force IPv4 (important!)
    });
    console.log("Connected to MongoDB now");
    console.log(connectionInstance.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
export default connectDB;
