import User from "../models/user.js";

export const renderRegister = (req, res) => {
	res.render("users/register");
};

export const register = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash("success", "Welcome to MuralMaDrs!");
			res.redirect("/murals");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("register");
	}
};

export const renderLogin = (req, res) => {
	res.render("users/login");
};

export const login = (req, res) => {
	req.flash("success", "Welcome back!");
	const redirectUrl = req.session.returnTo || "/murals";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

export const logout = (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		req.flash("success", "Goodbye!");
		res.redirect("/murals");
	});
};
