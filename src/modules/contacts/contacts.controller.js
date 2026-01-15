import { Contact } from "./contacts.model.js";

export const getContact = async (req, res, next) => {

    const { id } = req.params;

    try {
        
        const contactDoc = await Contact.findById(id);

        if (!contactDoc)
        {
            const error = new Error("Contact not found");
            return next(error);
        }

        return res.status(200).json({
            success: true,
            data: contactDoc,
        });
    } catch (error) {
        
        error.status = 500;
        error.name = error.name || "DatabaseError";
        error.message = error.message || "Failed to get a contact";
        return next(error);
    }
};

export const getContacts =  async (req, res, next) => {

    try {
        
        const datas = await Contact.find();

        return res.status(200).json({
            
            success: true,
            data: datas,
        });
    } catch (error) {
        
        return next(error);
    }
};

export const createContact = async (req, res, next) => {
    
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message)
    {
        const error = new Error("name, email, subject, and message from user are required");
        error.name = "ValidationError";
        error.status = 400;
        return next(error);
    }

    try {
        
        const contactDoc = await Contact.create({name, email, subject, message});

        return res.status(201).json({
            success: true,
            data: contactDoc,
        });
    } catch (error) {
        
        return next(error);
    }
};

export const deleteContact = async (req, res, next) => {

    const { id } = req.params;

    try {
        
        const deleted = await Contact.findByIdAndDelete(id);

        if (!deleted)
        {
            const error = new Error("Contact not found!");
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