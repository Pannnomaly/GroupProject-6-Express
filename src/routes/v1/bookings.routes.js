import { Router } from "express";
import { createBooking, getBookings } from "../../modules/bookings/bookings.controller.js";

export const router = Router();

router.post("/", createBooking);
router.get("/", getBookings);