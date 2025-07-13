import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const isAuth=async(req,res,next)=>{
    try {
        const token = req.cookies.token; // Assuming the token is stored in cookies
        if (!token) {
            return res.status(400).json({ message: "token not found" });
        }

        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "is Auth error" });
    }
}
export default isAuth;