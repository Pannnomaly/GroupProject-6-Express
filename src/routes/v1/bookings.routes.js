import { Router } from "express";
import {authUser} from "../../middlewares/auth.js";
import { createBooking, deleteBooking, getBooking, getBookings, getMyBookings, updateBooking } from "../../modules/bookings/bookings.controller.js";

export const router = Router();

router.get("/my-bookings", authUser, getMyBookings);

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:CNumber", getBooking);
router.delete("/:CNumber", authUser, deleteBooking);
router.patch("/:CNumber", updateBooking);