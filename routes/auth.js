const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const sendEmail = require("../utils/email");

const router = express.Router();

// Register User// Register User
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({ firstName, lastName, email, password: hashedPassword, role });

        // Generate JWT token
        const token = generateToken(user);

        // Set secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        // Send welcome email
        try {
            await sendEmail({
                email: user.email,
                subject: "Welcome to KlosetStore!",
                message: `Hello ${firstName},\n\nWelcome to our KlosetStore! We are excited to have you.\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nThe Team`
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
        }

        res.status(201).json({ success: true, message: "User registered successfully", token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Set secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        res.json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Send Password Reset Link
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate Secure Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Store hashed token in DB
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Construct Reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send Email
        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset",
                message: `Click the link to reset password: ${resetUrl}`,
            });

            res.json({ success: true, message: "Password reset email sent" });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            res.status(500).json({ success: false, message: "Error sending email" });
        }
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "New password is required" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Hash new password before saving
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
