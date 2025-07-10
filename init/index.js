import mongoose from "mongoose";
import initData from "./data.js";
import Listing from "../models/listing.js";
import dotenv from "dotenv";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";

dotenv.config();

const mapToken = process.env.MAP_TOKEN;
if (!mapToken) {
	throw new Error("MAP_TOKEN not found in environment variables");
}

const MONGO_URL = process.env.ATLASDB_URL;

const categories = [
	"Beachfront",
	"Cabins",
	"Tiny homes",
	"Amazing views",
	"OMG!",
	"Treehouses",
	"Design",
	"Lakefront",
	"A-frames",
	"Camping",
];

const defaultOwnerId = "686472c91b9f6d06ae4868ed";

async function main() {
	try {
		await mongoose.connect(MONGO_URL);
		console.log("MongoDB connected");

		const geocodingClient = mbxGeocoding({ accessToken: mapToken });
		const listingsWithGeo = [];

		for (const listing of initData.data) {
			const fullLocation = `${listing.location}, ${listing.country}`;

			try {
				const response = await geocodingClient
					.forwardGeocode({
						query: fullLocation,
						limit: 1,
					})
					.send();

				const geometry = response.body.features?.[0]?.geometry;

				if (!geometry) {
					console.warn("No geo result for:", fullLocation);
					continue;
				}

				listingsWithGeo.push({
					...listing,
					category:
						categories[
							Math.floor(Math.random() * categories.length)
						],
					geometry,
					owner: defaultOwnerId,
				});
			} catch (err) {
				console.error(
					"Geocoding failed for:",
					fullLocation,
					"-",
					err.message,
				);
			}
		}

		await Listing.deleteMany({});
		await Listing.insertMany(listingsWithGeo);

		console.log(
			`Seeded ${listingsWithGeo.length} listings with geo + categories!`,
		);
	} catch (err) {
		console.error("❌ Error connecting or seeding:", err);
	} finally {
		await mongoose.connection.close();
	}
}

main();
