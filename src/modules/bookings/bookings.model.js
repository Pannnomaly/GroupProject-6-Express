import mongoose from "mongoose";


const BOOKING_TO_ROOM_STATUS = {
  pending: "Reserved",
  confirmed: "Reserved",
  checked_in: "Occupied",
  checked_out: "Available",
  cancelled: "Available",
};

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

// Pre-Validate: จัดการเรื่องวันที่ ราคา และเลขใบจอง
bookingSchema.pre("validate", async function () {
  if (!this.checkInDate || !this.checkOutDate || !this.roomId) return next();

  try {
    // ดึงข้อมูลห้องพักเพื่อเอา roomRate ล่าสุดจาก Database
    const Room = mongoose.model("Room");
    const room = await Room.findById(this.roomId);
    if (!room) throw new Error("Room not found");

    // เช็คว่าห้องว่างไหม (เฉพาะตอนสร้างใหม่)
    if (this.isNew && (room.status === 'Cleaning' || room.status === 'Maintenance')) {
      throw new Error(`Room is currently under ${room.status}`);
    }

    // ล็อคราคาจากตาราง Room
    this.pricing.roomRate = room.roomRate;

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    if (checkOut <= checkIn) {
      throw new Error("Check-out date must be at least one day after check-in date.");
    };

    // คำนวณ Nights & Total
    this.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    this.pricing.totalAmount = this.pricing.roomRate * this.nights;

    // เลขใบจอง
    if (this.isNew && !this.confirmationNumber) {
      const timestamp = Date.now().toString().slice(-6);
      this.confirmationNumber = `BK-${timestamp}`;
    }

  } catch (error) {
    throw error;
  }
});

// Post-Save: อัปเดตสถานะห้องให้สัมพันธ์กัน
bookingSchema.post("save", async function (doc) {
  try {
    // ดึง Model Room มาใช้งาน
    const Room = mongoose.model("Room");

    const matchStatus = BOOKING_TO_ROOM_STATUS[doc.status] || "Available";

    await Room.findByIdAndUpdate(doc.roomId, {
      status: matchStatus,
      // ถ้าสถานะเป็น Available ให้ล้างชื่อแขกออก (null)
      currentGuest: matchStatus === "Available" ? null : doc.userId
    });

    console.log(`Updated Room ${doc.roomId} status to: ${newRoomStatus}`);
  } catch (err) {
    console.error("Error in bookingSchema.post('save'):", err);
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);