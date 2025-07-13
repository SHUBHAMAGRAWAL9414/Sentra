import User from "../models/user.model.js";
import genToken from "../config/token.js";
import bcrypt from "bcryptjs";
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hahshedPassword = await bcrypt.hash(password, 10);
    if (!hahshedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hahshedPassword,
    });

    const token = await genToken(user._id);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });
    return res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: `sign up error ${error}` });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "strict",
      secure: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Login error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: `Logout error ${error}` });
  }
};
