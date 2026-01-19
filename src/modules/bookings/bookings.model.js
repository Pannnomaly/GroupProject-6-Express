import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    confirmationNumber: { type: String, required: true, unique: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    nights: { type: Number, required: true },
    pricing: {
        roomRate: { type: Number, required: true },
        totalAmount: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });

// check ก่อน save
bookingSchema.pre("validate", async function () {
  if (!this.checkInDate || !this.checkOutDate || !this.roomId) return next();

  try {
    // ดึงข้อมูลห้องพักเพื่อเอา roomRate ล่าสุดจาก Database
    const Room = mongoose.model("Room");
    const room = await Room.findById(this.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // กำหนด roomRate ให้ตรงกับราคาของห้องนั้นๆ (ป้องกันการส่งราคาปลอมมาจากหน้าบ้าน)
    this.pricing.roomRate = room.roomRate;

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    if (checkOut <= checkIn) {
      throw new Error("Check-out date must be at least one day after check-in date.");
    }

    // คำนวณจำนวนคืนและราครวม
    this.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    this.pricing.totalAmount = this.pricing.roomRate * this.nights;

    // Logic สร้างเลขการจอง
    if (this.isNew && !this.confirmationNumber) {
      const timestamp = Date.now().toString().slice(-6);
      this.confirmationNumber = `BK-${timestamp}`;
    }

  } catch (error) {
    throw error;
  }
});

// หลังจากบันทึกรายการจองสำเร็จ
bookingSchema.post("save", async function (doc) {
  try {
    // ดึง Model Room มาใช้งาน
    const Room = mongoose.model("Room");

    // เมื่อมีการจองสำเร็จ (Status เป็น pending หรือ confirmed)
    // ให้เปลี่ยนสถานะห้องเป็น 'Reserved' และใส่ ID ของ User ใน currentGuest
    await Room.findByIdAndUpdate(doc.roomId, {
      status: "Reserved",
      currentGuest: doc.userId
    });
  } catch (error) {
    console.error("Failed to update room status:", error);
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);