import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "../models/listing.js";

dotenv.config();

const MONGO_URL =
	process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlustPractice";

(async function syncIndexes() {
	try {
		await mongoose.connect(MONGO_URL, {
			autoIndex: false,
		});
		console.log("Connected to DB");

		await Listing.syncIndexes();
		console.log("Indexes synced");

		mongoose.connection.close();
	} catch (err) {
		console.error("Failed to sync indexes:", err);
		process.exit(1);
	}
})();
