import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { router as roomsRoutes } from "./rooms.routes.js";
import { router as contactsRoutes } from "./contacts.routes.js";
import { router as bookingsRoutes } from "./bookings.routes.js";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/rooms", roomsRoutes);
router.use("/contacts", contactsRoutes);
router.use("/bookings", bookingsRoutes);