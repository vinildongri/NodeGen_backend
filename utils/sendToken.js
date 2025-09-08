export default (user, statusCode, res) => {
    // Create token
    const token = user.getJwtToken();

    // Options for Cookie
    const options = {
        expires: new Date (
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure:false,
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
