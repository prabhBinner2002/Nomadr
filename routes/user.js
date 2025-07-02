const expresss = require("express");
const router = expresss.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router
	.route("/signup")
	.get(wrapAsync(userController.renderSignUpForm))
	.post(wrapAsync(userController.signUp));

router
	.route("/login")
	.get(userController.renderlogInForm)
	.post(
		saveRedirectUrl,
		passport.authenticate("local", {
			failureRedirect: "/login",
			failureFlash: true,
		}),
		userController.logIn,
	);

router.get("/logout", userController.logOut);

module.exports = router;
