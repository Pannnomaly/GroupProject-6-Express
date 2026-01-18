import mongoose from "mongoose";


const roomSchema = new mongoose.Schema(
    {
        roomNumber: { type: Number, required: true, unique: true },
        type: { type: String, enum: ['Single', 'Double', 'Suite'], required: true },
        status: {
            type: String,
            enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'],
            default: 'Available'
        },
        floor: { type: Number, required: true },
        roomRate: { type: Number, required: true },
        imagelink: {type: String, require: true, trim: true},
        currentGuest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        notes: { type: String, trim: true }
    },
    { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);