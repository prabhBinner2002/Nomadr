const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./Schema.js");
const { reviewSchema } = require("./Schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectUrl = req.originalUrl;
		req.flash("error", "You must be logged in to create a listing");
		return res.redirect("/login");
	}
	next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
	if (req.session.redirectUrl) {
		res.locals.redirectUrl = req.session.redirectUrl;
	}
	next();
};

module.exports.isOwner = async (req, res, next) => {
	let { id } = req.params;
	let listing = await Listing.findById(id);
	if (!listing.owner._id.equals(res.locals.currentUser._id)) {
		req.flash(
			"error",
			"You do not have persmission to edit this listings.",
		);
		return res.redirect(`/listings/${id}`);
	}
	next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	let { id, reviewId } = req.params;
	let review = await Review.findById(reviewId);
	if (!review.author.equals(res.locals.currentUser._id)) {
		req.flash(
			"error",
			"You do not have the permission to delete this review.",
		);
		return res.redirect(`/listings/${id}`);
	}
	next();
};

// Server-Side Validaton using JOI
module.exports.validateListing = (req, res, next) => {
	let { error } = listingSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};

// Server-Side Validaton using JOI
module.exports.validateReview = (req, res, next) => {
	let { error } = reviewSchema.validate(req.body);
	if (error) {
		let errMsg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(400, errMsg);
	} else {
		next();
	}
};
