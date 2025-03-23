import { ApiError, catchAsync } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import {deleteMediaFromCloudinary, uploadMedia} from  "../utils/cloudinary.js"

export const createUserAccount = catchAsync(async (req, res) => {
  //by this we don't need to use try catch block
  const { name, email, password, role = "student" } = req.body;

  //We will do validations globally in the middleware
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
  });
  await user.updateLastActive();
  generateToken(res, user, "Account Created Successfully");
});

export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid email or password", 401);
  }

  await user.updateLastActive();
  generateToken(res, user, `Welcome back ${user.name}`);
});

export const signOutUser = catchAsync(async (_, res) => {
  //sonetime when the request is not being used then we can use _ instead of req
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({
    success: true,
    message: "Signed out successfully",
  });
});

export const getCurrentUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.id).populate({
    path: "enrolledCourses.course",
    select: "title thumbnail description",
  });

  if (!user) throw new ApiError("User not found", 404);

  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
      totalEnrolledCourses : user.totalEnrolledCourses,
    },
  });
  
});


export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, email, bio } = req.body;
  const updateData = {
    name, 
    email: email?.toLowerCase(),
    bio,
  }

  if (req.file) {
    const avatarResult = await uploadMedia(req.file.path)
    updateData.avatar = avatarResult.secure_url

    //delete old avatar
    const user = await user.findById(req, id)
    if (user.avatar && user.avatar !== 'default-avatar.png') {
      await deleteMediaFromCloudinary(user.avatar)
    }
  }

  //update the user and get updated documents
  const updatedUser = await User.findByIdAndUpdate(
    req.id,
    updateData,
    {new: true, runValidators: true}
  )

  if(!updatedUser) throw new ApiError("User not found", 404)

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser
  });
});