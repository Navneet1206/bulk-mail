const User = require('../models/User');
const OTP = require('../models/OTP');
const Plan = require('../models/Plan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/nodemailer');

exports.signup = async (req, res) => {
  const { name, email, password, businessType, numberOfEmployees, businessName, address } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpDoc = new OTP({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
  await otpDoc.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  res.status(200).json({ message: 'OTP sent to email', email });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, name, password, businessType, numberOfEmployees, businessName, address } = req.body;
  const otpDoc = await OTP.findOne({ email, otp });
  if (!otpDoc || otpDoc.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const freePlan = await Plan.findOne({ name: 'Free' });
  if (!freePlan) return res.status(500).json({ message: 'Free plan not found' });

  const user = new User({ name, email, password: hashedPassword, businessType, numberOfEmployees, businessName, address, plan: freePlan._id });
  await user.save();
  await OTP.deleteOne({ _id: otpDoc._id });

  res.status(201).json({ message: 'User created successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};