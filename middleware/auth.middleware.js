import jwt from "jsonwebtoken";
import redis from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    // Check if Authorization header exists and is in the correct format
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token not found" });
    }

    // Check if token is blacklisted
    try {
      const isBlacklisted = await redis.get(token);
      if (isBlacklisted) {
        return res.status(401).json({ message: "Unauthorized - Token is blacklisted" });
      }
    } catch (redisError) {
      console.error("Redis error:", redisError);
      // Proceed without Redis check if Redis fails
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded user data to the request object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};