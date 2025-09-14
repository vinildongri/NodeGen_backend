import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/user.js";
import sendToken from "../utils/sendToken.js";
import {  getResetPasswordTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";


// Register User => /api/v1/register
export const registerUser = catchAsyncErrors(async(req, res, next) => {
    const {name, email, password } = req.body;

    const user = await User.create({
        name, email, password
    });

    sendToken(user, 201, res);
});



// Login User => /api/v1/login
export const loginUser = catchAsyncErrors(async(req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new ErrorHandler("please enter email & password", 401));
    }

    // Find User in DataBase
    const user = await User.findOne({ email }).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Checking if Password is correct 
    const isPasswordMatched =  await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});



// Logout User => /api/v1/logout
export const logout = catchAsyncErrors(async(req, res, next) => {
    res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: true,  
        sameSite: 'none',
        path: "/",      
    });

    res.status(200).json({
        message: "Logged Out",
    });
});



// Forgot Password => /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    // Find user in the DataBase
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new ErrorHandler("user not found with this Email", 401));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save();

    // Create Reset password Url
    const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`;

    const message = getResetPasswordTemplate(user?.name, resetUrl);

    try{
        await sendEmail({
            email: user.email,
            subject: "NoteGen Password Recovery",
            message,
        });

        res.status(200).json({
            message: `Email sent to ${user.email}`,
        });
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }

});



// Reset Password => /api/v1/password/reset:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Hash the Url Token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt : Date.now() },
    });

    if(!user){
        return next(new ErrorHandler("Password Reset Token id Invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    // Set new Password 
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
});



// Update Password => /api/v1/password/update
export const updatePassword = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req?.user?._id).select("+password");
  
    // Check previous Passsword
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("old Password is Incorrect", 400));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true,
    });
});


// Get Current User Profile =>/api/v1/me
export const getUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req?.user?._id);

    res.status(200).json({
        user,
    });
});

// Update User Profile =>/api/v1/me/update
export const updateProfile = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate( req.user._id, newUserData, { new: true, });

    res.status(200).json({
        user,
    });
});


// Get All Users - Admin => /api/v1/admin/users
export const allUsers = catchAsyncErrors(async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        users,
    });
});

// Get User Details - Admin => /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`Uaer not found with this id: ${req.params.id} `, 404));
    }

    res.status(200).json({
        user,
    });
});


// Update User Details =>/api/v1/me/admin/users:id
export const updateDetails = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role, 
    };

    const user = await User.findByIdAndUpdate( req.user._id, newUserData, { new: true, });

    res.status(200).json({
        user,
    });
});


// Delete User - ADMIN => /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`Uaer not found with this id: ${req.params.id} `, 404));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
    });
});