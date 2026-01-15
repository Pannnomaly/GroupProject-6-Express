import { Router } from "express";
import { createRoom, getRoom, getRooms, deleteRoom, updateRoom } from "../../modules/rooms/rooms.controller.js";
// import { authUser } from "../../middlewares/auth.js";

export const router = Router();

router.post("/", createRoom);

router.get("/:roomNumber", getRoom);
router.get("/", getRooms);
router.delete("/:roomNumber", deleteRoom);
router.patch("/:roomNumber", updateRoom);