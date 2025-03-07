import User from "../models/user.models.js";
import { validationResult } from "express-validator";
import * as userService from "../services/user.service.js";
import redis from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Create new user
    const newUser = await userService.CreateUser({ email, password });

    // Generate token
    const token = newUser.generateToken();

    delete newUser._doc.password;

    // Respond with the user and token
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Incorrect Email or Password" });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate token
    const token = user.generateToken();

    delete user._doc.password;

    // Respond with the user and token
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await userService.getUserProfileService({ id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    // Blacklist token
    const token = req.headers.authorization.split(" ")[1];
    await redis.set(token, "logout", "EX", 60 * 60 * 24);
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    const users = await userService.getAllUsersService({ userId });
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}
