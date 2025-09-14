import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Check if User is Authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const { token } = req.cookies;

    // console.log({cookies:req.cookies});
    

    if(!token){
        return next(new ErrorHandler("Login first to access to NoteGen", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    next();
});


// Authorize User Roles
export const authorizeRole = ( ... roles ) => {
    return (req, res, next) => {
        if( !roles.includes(req.user.role)) {
            return next (new ErrorHandler(`Role (${req.user.role}) is not allowed to access this Resource`, 403));
        }

        next();
    };
};