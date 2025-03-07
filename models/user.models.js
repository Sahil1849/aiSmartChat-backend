import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [5, "Email must be at least 5 characters long"],
    maxLength: [50, "Email must be at most 50 characters long"],
  },
  password: {
    type: String,
    required: true,
    minLength: [3, "Password must be at least 3 characters long"],
    select: false,
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ email: this.email, id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24hr",
  });
};

const User = mongoose.model("user", userSchema);
export default User;