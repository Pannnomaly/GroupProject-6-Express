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

// Logic สร้างเลขการจองและคำนวณคืนอัตโนมัติ
bookingSchema.pre("validate", function () {
  // guard ก่อน (กันพัง)
  if (!this.checkInDate || !this.checkOutDate) return;

  const checkIn = new Date(this.checkInDate);
  const checkOut = new Date(this.checkOutDate);

  // สร้าง confirmation number เฉพาะตอน create
  if (this.isNew && !this.confirmationNumber) {
    const timestamp = Date.now().toString().slice(-6);
    this.confirmationNumber = `BK-${timestamp}`;
  }

  // คำนวณจำนวนคืน
  this.nights = Math.ceil(
    (checkOut - checkIn) / (1000 * 60 * 60 * 24)
  );
});

export const Booking = mongoose.model("Booking", bookingSchema);