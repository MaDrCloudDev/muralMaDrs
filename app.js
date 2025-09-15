import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import session from 'express-session';
import flash from 'connect-flash';
import ExpressError from './utils/ExpressError.js';
import methodOverride from 'method-override';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/user.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import userRoutes from './routes/users.js';
import muralRoutes from './routes/murals.js';
import reviewRoutes from './routes/reviews.js';
import MongoStore from 'connect-mongo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/mural-madrs";

mongoose.connect(dbUrl)
	.then(() => {
		console.log("Database connected successfully");
	})
	.catch((err) => {
		console.error("Database connection error:", err);
		process.exit(1);
	});

const app = express();
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
	mongoSanitize({
		replaceWith: "_",
	})
);

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 3600, // lazy session update
});

store.on("error", (e) => {
	console.error("SESSION STORE ERROR", e);
});

const sessionConfig = {
	store,
	name: "session",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com",
	"https://api.tiles.mapbox.com",
	"https://api.mapbox.com",
	"https://kit.fontawesome.com",
	"https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com",
	"https://stackpath.bootstrapcdn.com",
	"https://api.mapbox.com",
	"https://api.tiles.mapbox.com",
	"https://fonts.googleapis.com",
	"https://use.fontawesome.com",
];
const connectSrcUrls = [
	"https://api.mapbox.com",
	"https://*.tiles.mapbox.com",
	"https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			childSrc: ["blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dhrh9dlim/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://images.unsplash.com",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.currentUser = req.user || null;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.get("/", (req, res) => {
	res.render("home", { currentUser: req.user || null });
});

app.use("/", userRoutes);
app.use("/murals", muralRoutes);
app.use("/murals/:id/reviews", reviewRoutes);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	
	// Handle cases where err might be a string instead of an Error object
	if (typeof err === 'string') {
		const errorObj = new Error(err);
		errorObj.statusCode = statusCode;
		return res.status(statusCode).render("error", { err: errorObj });
	}
	
	if (!err.message) err.message = "Oh No, Something Went Wrong!";
	res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`🚀 Server running on port ${port}`);
	console.log(`🌐 Visit: http://localhost:${port}`);
});
