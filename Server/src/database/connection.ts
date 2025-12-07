import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default async function connect() {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        await mongoose.connect(uri); // use `uri`

        console.log(" Connected to the database");
    } catch (error) {
        console.error(" Database connection error:", error);
        process.exit(1); // Exit the application on failure
    }
}
