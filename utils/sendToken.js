export default (user, statusCode, res) => {
    // Create token
    const token = user.getJwtToken();

    // Options for Cookie
    const isProd = process.env.NODE_ENV === "PRODUCTION";
    
    const options = {
        expires: new Date (
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: isProd,      
        sameSite: isProd ? 'none' : 'lax',
        path: "/",
        // domain: isProd ? new URL(process.env.FRONTEND_URL).hostname : undefined
    }

    res.status(statusCode).cookie("token", token, options).json({
        token,
        user,
    });
};

// res.cookie("token", token, {
//   httpOnly: true,
//   secure: true, // use false only for localhost http
//   sameSite: "None", 
// });
// res.json({ message: "Login successful" });
