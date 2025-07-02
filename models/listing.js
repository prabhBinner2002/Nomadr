const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js");
const User = require("./user.js");

let listingSchema = new Schema({
	title: {
		type: String,
		required: [true, "Title is required for a listing"],
	},
	description: {
		type: String,
	},
	image: {
		url: String,
		filename: String,
	},
	price: {
		type: Number,
	},
	location: {
		type: String,
	},
	country: {
		type: String,
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review",
		},
	],
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	geometry: {
		type: {
			type: String,
			enum: ["Point"],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	category: {
		type: String,
		enum: [
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
		],
		index: true,
		required: true,
	},
});

listingSchema.post("findOneAndDelete", async (listing) => {
	if (listing) {
		await Review.deleteMany({ _id: { $in: listing.reviews } });
	}
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
