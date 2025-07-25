const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
        .route("/")
        .get(wrapAsync(listingController.index))
        .post(
                isLoggedIn,
                upload.array("listing[images]"),
                validateListing,
                wrapAsync(listingController.createListing),
        );

router.get("/search", wrapAsync(listingController.search));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get("/filter", wrapAsync(listingController.filterListing));

router
	.route("/:id")
	.get(wrapAsync(listingController.showListing))
	.put(
		isLoggedIn,
		isOwner,
		upload.array("listing[images]"),
		validateListing,
		wrapAsync(listingController.updateListing),
	)
	.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get(
	"/:id/edit",
	isLoggedIn,
	isOwner,
	wrapAsync(listingController.renderEditForm),
);

module.exports = router;
