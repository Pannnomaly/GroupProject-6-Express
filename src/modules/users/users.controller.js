import { User } from "./users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doc = await User.findById(id).select("-password");

    if (!doc) {
      const error = new Error("User not found");
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    error.status = 500;
    error.name = error.name || "DatabaseError";
    error.message = error.message || "Failed to get a user";
    return next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { firstname, lastname, email, password, role } = req.body;

  if (!firstname || !lastname || !email || !password || !role) {
    const error = new Error("firstrname, lastname, email, password, and role are required");
    error.name = "ValidationError";
    error.status = 400;
    return next(error);
  }

  try {
    const doc = await User.create({ firstname, lastname, email, password, role });

    const safe = doc.toObject();
    delete safe.password;

    return res.status(201).json({
      success: true,
      data: safe,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.name = "DuplicateKeyError";
      error.message = "Email already in use";
    }

    error.status = 500;
    error.name = error.name || "DatabaseError";
    error.message = error.message || "Failed to create a user";
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error("User not found!");
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const updated = await User.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      const error = new Error("User not found");
      return next(error);
    }

    const safe = updated.toObject();
    delete safe.password;

    return res.status(200).json({
      success: true,
      data: safe,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(error);
    }

    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password are required!",
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found!",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "invalid password!",
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "login successfully!",
      token: token,
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        imagelink: user.imagelink,
        detail: user.detail,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
};

export const stayLoggedIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        meesage: "Unauthenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
