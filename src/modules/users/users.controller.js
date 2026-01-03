import { users } from "../../mock-db/users.js";
import { User } from "./users.model.js";

export const getUsers1 = (req, res) => {
    res.status(200).json(users);
};

export const deleteUser1 = (req, res) => {

    const userId = req.params.id;


    const userIndex = users.findIndex((user) => user.id === userId);


    if (userIndex !== -1)
    {
      users.splice(userIndex, 1);

      res.status(200).send(`User with ID ${userId} deleted successfully!`);
    } else{
      res.status(404).send("User not found!");
    }
};

export const createUser1 = (req, res) => {

  const {name, email} = req.body;

  const newUser = {
    id: String(users.length + 1),
    name: name,
    email: email,
  };

  users.push(newUser);

  res.status(201).json(newUser);
};

export const getUser2 = async (req, res, next) => {
  const { id } = req.params;

  try {

    const doc = await User.findById(id).select("-password");

    if (!doc)
    {
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

export const getUsers2 = async (req, res, next) => {

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

export const deleteUser2 = async (req, res, next) => {

    const { id } = req.params;

    try {

      const deleted = await User.findByIdAndDelete(id);

      if (!deleted)
      {
        const error = new Error("User not found");
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

export const createUser2 = async (req, res, next) => {

  const { username, email, password, role} = req.body;

  if (!username || !email || !password || !role)
  {
    const error = new Error("username, email, password, and role are required");
    error.name = "ValidationError";
    error.status = 400;
    return next(error);
  }

  try {
    const doc = await User.create({username, email, password, role});
    const safe = doc.toObject();
    delete safe.password;

    return res.status(201).json({
      success: true,
      data: safe
    });
  } catch (error) {
    if (error.code === 11000)
    {
      error.status = 409;
      error.name = "DuplicateKeyError";
      error.massage = "Email already in use";
    }
    
    error.status = 500;
    error.name = error.name || "DatabaseError";
    error.massage = error.massage || "Failed to create a user";

    return next(error);
  }
};

export const updateUser2 = async (req, res, next) => {
  
  const { id } = req.params;
  const body = req.body;

  try {
    const updated = await User.findByIdAndUpdate(id, body);

    if (!updated)
    {
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

    if (error.code === 11000)
    {
      return next(error);
    }

    return next(error);
  }
};