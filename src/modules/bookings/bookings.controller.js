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

    const savedBooking = await Booking.create({userId, roomId, checkInDate, checkOutDate, pricing});

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

export const deleteBooking = async (req, res, next) => {
  const { CNumber } = req.params;

  try {
    const deleted = await Booking.findOneAndDelete({ confirmationNumber: CNumber });

    if (!deleted) {
      const error = new Error("A booking not found!");
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

export const updateBooking = async (req, res, next) => {
  const { CNumber } = req.params;
  const body = req.body;

  console.log("confirmnumber:", CNumber);
  console.log(body);

  try {

    // ถ้ามีการส่ง checkInDate หรือ checkOutDate มา ให้คำนวณ nights ใหม่
    if (body.checkInDate || body.checkOutDate) {
      // ดึงข้อมูลเก่ามาตั้งต้นก่อนกรณีส่งมาแค่อย่างเดียว
      const currentBooking = await Booking.findOne({ confirmationNumber: CNumber });
      if (!currentBooking) {
        const error = new Error("A Booking not found");
        return next(error);
      }

      const checkIn = new Date(body.checkInDate || currentBooking.checkInDate);
      const checkOut = new Date(body.checkOutDate || currentBooking.checkOutDate);

      // เช็คว่าวันเช็คเอาท์ต้องไม่ก่อนหรือเท่ากับวันเช็คอิน
      if (checkOut <= checkIn) {
        const error = new Error("Check-out date must be after check-in date");
        error.status = 400;
        return next(error);
      };

      // คำนวณจำนวนคืนใหม่ใส่เข้าไปใน body ก่อนอัปเดต
      body.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    const updated = await Booking.findOneAndUpdate(
          { confirmationNumber: CNumber },
          body,
          { new: true, runValidators: true } // ส่งข้อมูลใหม่ พร้อม validate update data กับ schema ของ room
      );

    if (!updated)
    {
      const error = new Error("A Booking not found");
      return next(error);
    }

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