import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Example route
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser); // to be implemented

router.route("/logout").post(verifyJWT, logoutUser); // to be implemented

router.route("/refresh-token").post(refreshAccessToken); // to be implemented

export default router;
