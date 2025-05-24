const User = require("../models/User");
const OTP = require("../models/OTP");
const Plan = require("../models/Plan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

exports.signup = async (req, res) => {
  const {
    name,
    email,
    password,
    businessType,
    numberOfEmployees,
    businessName,
    address,
  } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpDoc = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await otpDoc.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Signup",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      });
    } catch (emailError) {
      await OTP.deleteOne({ _id: otpDoc._id });
      console.error("Failed to send OTP email:", emailError);
      let errorMessage = "Failed to send OTP email";
      if (emailError.code === "EAUTH") {
        errorMessage =
          "Invalid email credentials. Please check EMAIL_USER and EMAIL_PASS.";
      } else if (emailError.code === "ENOTFOUND") {
        errorMessage =
          "Unable to connect to SMTP server. Check your network or SMTP settings.";
      }
      return res
        .status(500)
        .json({ message: errorMessage, error: emailError.message });
    }

    res.status(200).json({ message: "OTP sent to email", email });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const {
    email,
    otp,
    name,
    password,
    businessType,
    numberOfEmployees,
    businessName,
    address,
  } = req.body;
  try {
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const freePlan = await Plan.findOne({ name: "Free" });
    if (!freePlan) {
      return res.status(500).json({ message: "Free plan not found" });
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      businessType,
      numberOfEmployees,
      businessName,
      address,
      plan: freePlan._id,
    });
    await user.save();
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
