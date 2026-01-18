import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../db/connectDB.js";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log(
      "Database connection established, you can start the server now.",
    );
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
