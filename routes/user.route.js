import express from "express";
import { authenticateUser, createUserAccount, getCurrentUserProfile, signOutUser, updateUserProfile } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
import { validateSignUp } from "../middlewares/validation.middleware.js";

const router = express.Router();

//these are all auth routes
router.post("/signup",validateSignUp, createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);

//profile routes
router.get('/profile', isAuthenticated ,getCurrentUserProfile)
router.patch('/profile',
    isAuthenticated,
    upload.single('avatar'),
    updateUserProfile)

export default router;
