import { app } from "./app.js";
import { connectDB } from "./config/mongodb.js";

const PORT = process.env.PORT || 3000;

try {

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}!`);
    });
} catch (error) {
    console.error("Startup failed!", error);
    process.exit(1);
}