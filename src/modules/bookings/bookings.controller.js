import { Booking } from "./bookings.model.js";

export const createBooking = async (req, res, next) => {
  try {
    const {
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      firstname,
      lastname,
      email,
      phone,
      specialRequest
    } = req.body;

    const savedBooking = await Booking.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      firstname,
      lastname,
      email,
      phone,
      specialRequest,
      // pricing: {} // Will be calculated by the pre-validate hook
    });

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

export const getBooking = async (req, res, next) => {
  const { CNumber } = req.params;

    try {
      const doc = await Booking.findOne({ confirmationNumber: CNumber });

      if (!doc) {
        const error = new Error("A booking not found");
        return next(error);
      }

      return res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      error.status = 500;
      error.message = error.message || "Failed to get a Booking";
      return next(error);
    }
};

export const getMyBookings = async (req, res, next) => {

  try {
    const { userId } = req.body;
    const bookings = await Booking.find(userId)
      .populate({
        path: "userId",
        select: "firstname lastname email role"
      })
      .populate({
        path: "roomId",
        select: "roomNumber type floor roomRate status"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};


export const deleteBooking = async (req, res, next) => {
  const { CNumber } = req.params;

  try {
    const deleted = await Booking.findOneAndDelete({ confirmationNumber: CNumber });

    if (!deleted) {
      const error = new Error("A booking not found!");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "Deleted successfully and update room status to Available",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  const { CNumber } = req.params;
  const body = req.body;


  try {

    // ค้นหาเอกสารการจองเดิม (ยังไม่ต้องอัปเดต)
    const booking = await Booking.findOne({ confirmationNumber: CNumber });

    if (!booking) {
      const error = new Error("A Booking not found");
      error.status = 404;
      return next(error);
    }

    // นำข้อมูลจาก body เข้าไปทับใน booking object
    Object.assign(booking, body);

    // เรียกใช้ .save()
    // ขั้นตอนนี้จะกระตุ้น pre("validate") เพื่อคำนวณราคาใหม่
    // และกระตุ้น post("save") เพื่อเปลี่ยนสถานะห้องพักในตาราง Room
    const updated = await booking.save();

    return res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (error) {
    if (error.code === 11000)
    {
      return next(error);
    }

    return next(error);
  }
};