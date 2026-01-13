import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, loginUser, logoutUser, updateUser } from "../../modules/users/users.controller.js";

export const router = Router();

router.get("/:id", getUser);

router.get("/", getUsers);

router.post("/", createUser);

router.delete("/:id", deleteUser);

router.patch("/:id", updateUser);

router.post("/auth/cookie/login", loginUser);

router.post("/auth/cookie/logout", logoutUser);