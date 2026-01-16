import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {

    let token = req.cookies.accessToken;

    if (!token)
    {
        return res.status(401).json({
            success: false,
            code: "NO_TOKEN",
            message: "Access denied. No token!",
        });
    }

    try {
        const decededToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            _id: decededToken.userId,
            // userRole: decededToken.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};