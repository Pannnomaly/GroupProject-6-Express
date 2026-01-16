import { Booking } from "./bookings.model.js";

export const createBooking = async (req, res, next) => {
  try {
    const {
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      pricing
    } = req.body;

    const booking = new Booking({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      pricing
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      data: savedBooking
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return next(error);
  }
};