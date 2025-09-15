import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import ejsMate from 'ejs-mate';
import session from 'express-session';
import connectFlash from 'connect-flash';
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
  .then(() => console.log("Database connected successfully"))
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

const app = express();
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));

// Session configuration
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret, // Ensure consistent encryption
  },
});

store.on("error", (e) => console.error("SESSION STORE ERROR", e));
store.on("create", (sid) => console.log("Session created with ID:", sid));

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  next();
});

// Flash middleware
app.use(connectFlash());
app.use((req, res, next) => {
  console.log('Flash middleware initialized, req.flash:', typeof req.flash);
  next();
});

// Helmet middleware
app.use(helmet());

// Helmet CSP configuration
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
        "https://res.cloudinary.com/dhrh9dlim/",
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserializing user:', user);
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Set res.locals for templates
app.use((req, res, next) => {
  try {
    console.log('Middleware: Setting res.locals.currentUser', req.user || null);
    res.locals.currentUser = req.user || null;
    res.locals.success = req.flash ? req.flash("success") : [];
    res.locals.error = req.flash ? req.flash("error") : [];
    next();
  } catch (err) {
    console.error('res.locals middleware error:', err);
    res.locals.currentUser = null;
    res.locals.success = [];
    res.locals.error = [];
    next();
  }
});

// Routes
app.get("/", (req, res) => {
  console.log('Home route: res.locals:', res.locals);
  res.render("home");
});

app.get('/test-flash', (req, res) => {
  console.log('Testing flash, req.flash:', typeof req.flash);
  req.flash('success', 'Test success message!');
  req.flash('error', 'Test error message!');
  res.redirect('/');
});

app.get('/debug-user', (req, res) => {
  res.json({ user: req.user || null, session: req.session });
});

app.use("/", userRoutes);
app.use("/murals", muralRoutes);
app.use("/murals/:id/reviews", reviewRoutes);

// Error handling
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  console.error('Middleware error:', err);
  const { statusCode = 500 } = err;
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