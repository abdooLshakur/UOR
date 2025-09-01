const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const User = require("../models/UserModel");

const SECRET_KEY = process.env.SECRET_KEY;

// REGISTER a donor or admin
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash: hashed,
      role: "donor",
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, gender, age } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      age,
      gender,
      passwordHash: hashed,
      role: "Admin",
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "3d" }
    );

    const safeUser = {
      id: user._id,
      fullName: user.fullName,
    };

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptionsToken = {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      ...(isProduction && { domain: "ummaofrasulullahcharityfoundation.com" }),
    };
    const cookieOptionsUser = {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      ...(isProduction && { domain: "ummaofrasulullahcharityfoundation.com" }),
    };

    res
      .cookie("token", token, cookieOptionsToken)
      .cookie("user", JSON.stringify(safeUser), cookieOptionsUser)
      .status(200)
      .json({ user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GET profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: "ummaofrasulullahcharityfoundation.com",
    path: "/",
  });

  res.clearCookie("user", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: "https://uor.onrender.com",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

const getDonorProfile = async (req, res) => {
  try {
    const { id } = req.user; 
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Donor Profile
const updateDonorProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { name, email, phoneNumber, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = name || user.fullName;
    user.email = email || user.email;
    user.phoneNumber = phone || user.phoneNumber;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const getAllDonors = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("fullName email role createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Request Reset Controller
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `https://www.uorcharity.org/reset-password?token=${token}&email=${email}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Umma of Rasulullah Charity" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your UOR Charity Account Password",
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #444;">UOR Charity - Password Reset Request</h2>
          <p>Dear ${user.first_name},</p>
          <p>We received a request to reset your password for your <strong>UOR Charity</strong> account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="padding: 10px 20px; background-color: #4B5563; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <p>— UOR Charity Team</p>
          <hr />
          <p style="font-size: 12px; color: #777;">For support, contact us at ${process.env.EMAIL_USER}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Reset link sent to your email",
      token,
      email,
    });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    // CorrecFerence to the environment variable
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Will throw if invalid/expired

    // Find the user by decoded ID and email
    const user = await Users.findOne({ _id: decoded.id, email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Reset token expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Remove the reset token and expiration date
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

const contactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Mail content
    const mailOptions = {
      from: `"${name}" <${email}>`,         
      to: process.env.EMAIL_USER,           
      subject: "New Message",
      html: `
        <h2>Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send the mail
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error in contactUs:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};



module.exports = {
  loginUser,
  registerUser,
  registerAdmin,
  getUserProfile,
  logoutUser,
  getDonorProfile,
  getAllDonors,
  resetPassword,
  requestPasswordReset,
  contactUs,
  updateDonorProfile,

};
