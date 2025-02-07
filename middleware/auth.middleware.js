import jwt from "jsonwebtoken";
import redis from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(token);

    if (isBlacklisted) {
      res.cookie("token", "");
      return res.status(401).json({ message: "Unauthorized-black Listed" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized user" });
  }
};
