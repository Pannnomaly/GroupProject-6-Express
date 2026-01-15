import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { router as roomsRoutes } from "./rooms.routes.js";


export const router = Router();

router.use("/users", usersRoutes);
router.use("/rooms", roomsRoutes);