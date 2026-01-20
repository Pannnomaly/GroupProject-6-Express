import { Router } from "express";
import { createBooking, deleteBooking, getBooking, getBookings, getMyBookings, updateBooking } from "../../modules/bookings/bookings.controller.js";

export const router = Router();

router.get("/my-bookings", getMyBookings);

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:CNumber", getBooking);
router.delete("/:CNumber", deleteBooking);
router.patch("/:CNumber", updateBooking);