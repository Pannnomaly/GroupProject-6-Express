import { Room } from "./rooms.model.js";

export const createRoom = async (req, res, next) => {
  const {roomnumber, type, floor, price, imagelink} = req.body;

  if (!roomnumber || !type || !floor || !price || !imagelink)
    {
      const error = new Error("Your inputs are not met with the requirements");
      error.status = 400;
      return next(error);
    }

  try {

    const doc = await Room.create({roomnumber, type, floor, price, imagelink});

    return res.status(201).json({
      success: true,
      data: doc,
    });

  } catch (error) {
      if (error.code === 11000)
      {
        const conflictError = new Error("Room number already in use"); // สร้าง Error ใหม่แทนการแก้ตัวเดิม
        conflictError.status = 409;
        return next(conflictError);
      }

      error.status = 500;
      error.message = error.message || "Failed to create a room data";
      return next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomnumber: 1 });

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return next(error);
  }
};

export const getRoom = async (req, res, next) => {
  const { roomNumber } = req.params;

    try {
      const doc = await Room.findOne({ roomnumber: roomNumber });

      if (!doc)
      {
        const error = new Error("Room not found");
        return next(error);
      }

      return res.status(200).json({
        success: true,
        data: doc,
      });
  } catch (error) {
    error.status = 500;
    error.message = error.message || "Failed to get a room data";
    return next(error);
  }
}

export const deleteRoom = async (req, res, next) => {

    const { roomNumber } = req.params;

    try {
      const deleted = await Room.findOneAndDelete({ roomnumber: roomNumber });

      if (!deleted)
      {
          const error = new Error("Room not found!");
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

export const updateRoom = async (req, res, next) => {

    const { roomNumber } = req.params;
    const body = req.body;

    try {
      const updated = await Room.findOneAndUpdate(
            { roomnumber: roomNumber },
            body,
            { new: true, runValidators: true } // ส่งข้อมูลใหม่ พร้อม validate update data กับ schema ของ room
        );

      if (!updated)
      {
        const error = new Error("Room not found");
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