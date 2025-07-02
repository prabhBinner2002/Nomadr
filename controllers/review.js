const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
	let { id } = req.params;
	let { review } = req.body;
	let newReview = new Review(review);
	newReview.author = req.user._id;
	let listing = await Listing.findById(id);
	listing.reviews.push(newReview);
	await newReview.save();
	await listing.save();
	req.flash("success", "Review submitted successfully.");
	res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
	let { id, reviewId } = req.params;
	let listing = await Listing.findByIdAndUpdate(
		id,
		{
			$pull: { reviews: reviewId },
		},
		{ new: true },
	);
	let review = await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Review deleted successfully.");
	res.redirect(`/listings/${id}`);
};
