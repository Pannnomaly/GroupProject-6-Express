import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { router as apiRoutes } from "./routes/index.js";
import { limiter } from "./middlewares/rateLimiter.js";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const corsOptions = {
    origin: [
        "http://localhost:5173",
            "http://localhost:5174",
                "http://localhost:5175",
                    "https://group-project-6-react.vercel.app",  
    ],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(limiter);

app.use(express.json());

app.use(cookieParser());

app.use("/api", apiRoutes);

app.use((req, res, next) => {
    const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);

    error.name = error.name || "NotFoundError";
    error.status = error.status || 404;

    next(error);
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: err.stack,
    });
});