const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");

const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// Create Route
router.post(
	"/",
	isLoggedIn,
	validateReview,
	wrapAsync(reviewController.createReview),
);

// Delete Route
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	reviewController.destroyReview,
);

module.exports = router;
