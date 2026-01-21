import mongoose from "mongoose";


const roomSchema = new mongoose.Schema(
    {
        roomNumber: { type: Number, required: true, unique: true },
        type: { type: String, enum: ['Single', 'Double', 'Twin'], required: true },
        status: {
            type: String,
            enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'],
            default: 'Available'
        },
        floor: { type: Number, required: true },
        roomRate: { type: Number, required: true },
        imagelink: {type: String, require: true, trim: true},
        currentGuest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        notes: { type: String, trim: true },
        size: {type: String, trim: true},
        additional1: {type: String, trim: true},
        additional2: {type: String, trim: true},
        additional3: {type: String, trim: true},
    },
    { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);