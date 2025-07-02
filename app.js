if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

const userRouter = require("./routes/user.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

app.engine("ejs", ejsMate);

const DB_URL = process.env.ATLASDB_URL;

main()
	.then((res) => console.log("Connection Successfull"))
	.catch((err) => console.log(err));

async function main() {
	mongoose.connect(DB_URL);
}

const store = MongoStore.create({
	mongoUrl: DB_URL,
	crypto: {
		secret: process.env.SECRET,
	},
	touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
	console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
	store,
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
	},
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = req.user;
	next();
});

app.get("/", (req, res) => {
	res.redirect("/listings");
});

// Uses router for listings and review requests
app.use("/", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// 404 Route
app.all("/*splat", (req, res, next) => {
	throw new ExpressError(404, "Page not Found");
});

// Error handling Middleware
app.use((err, req, res, next) => {
	let { status = 500, message = "Something went wrong!" } = err;
	res.status(status).render("error.ejs", { err });
});

app.listen(8080, () => {
	console.log("Server Started on port 8080");
});
