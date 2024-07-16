const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userCtrl = {
    register: async (req, res) => {
        console.log("Register controller called");
        try {
            const { name, email, password } = req.body;

            const user = await User.findOne({ email });
            if (user) {
                console.log("Email already registered");
                return res.status(400).json({ msg: "Email Already Registered" });
            }

            if (password.length < 6) {
                console.log("Password too short");
                return res.status(400).json({ msg: "Password must be at least 6 characters long" });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: passwordHash });
            await newUser.save();

            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });

            res.json({ accessToken });
        } catch (err) {
            console.error("Error in register controller:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

    refreshtoken: async (req, res) => {
        console.log("Refresh Token controller called");
        try {
            const rfToken = req.cookies.refreshtoken;
            if (!rfToken) {
                console.log("No refresh token found");
                return res.status(400).json({ msg: "Please login or register" });
            }

            jwt.verify(rfToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.log("Invalid token");
                    return res.status(400).json({ msg: "Invalid token, please login or register" });
                }

                const accessToken = createAccessToken({ id: user.id });
                res.json({ user, accessToken });
            });
        } catch (err) {
            console.error("Error in refresh token controller:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        console.log("Login controller called");
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                console.log("User does not exist");
                return res.status(400).json({ msg: "User does not exist" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("Incorrect password");
                return res.status(400).json({ msg: "Incorrect password" });
            }

            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = createRefreshToken({ id: user._id });

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });

            res.json({ msg: "Login success", accessToken });
        } catch (err) {
            console.error("Error in login controller:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

    logout: async (req, res) => {
        console.log("Logout controller called");
        try {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' });
            return res.json({ msg: "Logged out successfully" });
        } catch (err) {
            console.error("Error in logout controller:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

    getUser: async (req, res) => {
        console.log("Get User controller called");
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(400).json({ msg: "User not found" });
            }
            res.json(user);
        } catch (err) {
            console.error("Error in get user controller:", err);
            return res.status(400).json({ msg: err.message });
        }
    }
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = userCtrl;
