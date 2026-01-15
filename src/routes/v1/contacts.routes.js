import { Router } from "express";
import { createContact, deleteContact, getContact, getContacts } from "../../modules/contacts/contacts.controller.js";

export const router = Router();

router.get("/:id", getContact);

router.get("/", getContacts);

router.post("/", createContact);

router.delete("/:id", deleteContact);