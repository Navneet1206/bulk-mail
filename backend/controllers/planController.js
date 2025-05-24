// backend/controllers/planController.js
const User = require('../models/User');
const Plan = require('../models/Plan');

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  const { planId } = req.body;
  try {
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const user = await User.findById(req.user.id);
    user.plan = plan._id;
    await user.save();

    res.json({ message: 'Plan updated successfully', plan });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};