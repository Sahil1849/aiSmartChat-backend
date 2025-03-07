import User from "../models/user.models.js";

export const CreateUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  // Use the static `hashPassword` method from the User model
  const hashedPassword = await User.hashPassword(password);

  // Create a new user instance
  const newUser = new User({ email, password: hashedPassword });

  // Save the user to the database
  return newUser.save();
};

export const getAllUsersService = async ({ userId }) => {

  const users = await User.find({ _id: { $ne: userId } });
  return users;
};

export const getUserProfileService = async ({ id }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}