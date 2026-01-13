import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, loginUser, logoutUser, stayLoggedIn, updateUser } from "../../modules/users/users.controller.js";
import { authUser } from "../../middlewares/auth.js";

export const router = Router();

router.get("/:id", getUser);

router.get("/", getUsers);

router.post("/", authUser, createUser);

router.delete("/:id", authUser, deleteUser);

router.patch("/:id", authUser, updateUser);

router.post("/auth/cookie/login", loginUser);

router.post("/auth/cookie/logout", logoutUser);

router.get("/auth/cookie/me", authUser, stayLoggedIn);