import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { router as apiRoutes } from "./routes/index.js";
import { centralizedError, notFoundError } from "./middlewares/errorHandling.js";

export const app = express();

app.use(express.json());

app.set("trust proxy", 1);

app.use(helmet());

const corsOptions = {
    origin: [
        "http://localhost:5173",
            "http://localhost:5174",
                "http://localhost:5175",     
    ],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use("/api", apiRoutes);

app.use(notFoundError);
app.use(centralizedError);