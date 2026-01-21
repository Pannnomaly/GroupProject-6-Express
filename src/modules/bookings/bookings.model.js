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
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequest: { type: String },
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
  if (!this.checkInDate || !this.checkOutDate || !this.roomId) return;

  try {
    // ดึงข้อมูลห้องพักเพื่อเอา roomRate ล่าสุดจาก Database
    const Room = mongoose.model("Room");
    const room = await Room.findById(this.roomId);

    // เจอเลขห้องหรือไม่?
    if (!room) {
      // ถ้าหาห้องไม่เจอ ให้ Log เตือนไว้แต่ไม่ต้อง Throw Error เพื่อให้ Save/Patch ผ่าน
      console.warn(`[Warning] Room ID ${this.roomId} not found for Booking ${this.confirmationNumber}. Skipping validation.`);

      // คำนวณเฉพาะส่วนที่ไม่ต้องพึ่งข้อมูลจากตาราง Room
      const checkIn = new Date(this.checkInDate);
      const checkOut = new Date(this.checkOutDate);
      if (checkOut > checkIn) {
        this.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      }

      // ใส่ค่า Default ให้ pricing เพื่อไม่ให้พังเวลา Validate (เพราะ schema กำหนด required: true)
      if (!this.pricing.roomRate) this.pricing.roomRate = 0;
      if (!this.pricing.totalAmount) this.pricing.totalAmount = 0;

      return; // จบการทำงานของ Hook นี้ทันที
    } else {
      // เช็คว่าห้องว่างไหม (เฉพาะตอนสร้างใหม่)
      if (this.isNew && room.status !== "Available") {
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

    // หาความสัมพันธ์ของสถานะ (ใช้ Object ที่คุณประกาศไว้ข้างบน)
    const matchStatus = BOOKING_TO_ROOM_STATUS[doc.status] || "Available";

    // ประกาศตัวแปร guestData ไว้เก็บ _id
    let guestData;

    if (doc.status === "checked_out" || doc.status === "cancelled") {
      // ถ้าเช็คเอาท์ หรือ ยกเลิก ให้ล้างชื่อแขกออกทันที
      guestData = null;
    } else {
      // ถ้าเป็น pending, confirmed หรือ checked_in ให้ใส่ userId ไว้เลย
      // เพื่อให้ Admin ดูได้ว่าใครเป็นเจ้าของดีลนี้/ใครพักอยู่
      guestData = doc.userId;
    }

    // อัปเดตข้อมูลไปยัง Room
    await Room.findByIdAndUpdate(doc.roomId, {
      status: matchStatus,
      currentGuest: guestData
    });

    console.log(`[Room Update] ID: ${doc.roomId} | Status: ${matchStatus} | Guest: ${guestData}`);
  } catch (err) {
    console.error("Error in bookingSchema.post('save'):", err);
  }
});

// Post-DeleteBooking: อัพเดทสถานะ Room เมื่อ ลบ booking
bookingSchema.post("findOneAndDelete", async function (doc) {
  // doc คือข้อมูลการจองที่เพิ่งถูกลบไป
  if (doc) {
    try {
      const Room = mongoose.model("Room");

      // อัปเดตสถานะห้องกลับเป็น Available และล้างชื่อแขกออก
      await Room.findByIdAndUpdate(doc.roomId, {
        status: "Available",
        currentGuest: null
      });

      console.log(`Booking Deleted: Room ID ${doc.roomId} is now Available.`);
    } catch (error) {
      console.error("Error updating room status after delete:", error);
    }
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);