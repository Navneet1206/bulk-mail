// backend/controllers/emailController.js
const User = require('../models/User');
const nodemailer = require('nodemailer');
const fs = require('fs');
const validator = require('validator');
const { checkPlanLimits } = require('../utils/planChecker');


const templates = [
  { id: 1, name: 'Basic 1', html: '<h1>{{subject}}</h1><p>{{message}}</p>', type: 'basic' },
  { id: 2, name: 'Basic 2', html: '<h2>{{subject}}</h2><div>{{message}}</div>', type: 'basic' },
  // Add 3 more basic templates
  { id: 6, name: 'Premium 1', html: '<img src="cid:logo" /><h1>{{subject}}</h1><p>{{message}}</p>', type: 'premium' },
  // Add 4 more premium templates
];


exports.getTemplates = async (req, res) => {
  const user = await User.findById(req.user.id).populate('plan');
  const availableTemplates = templates.filter(t => t.type === 'basic' || (t.type === 'premium' && user.plan.templateAccess === 'premium'));
  res.json(availableTemplates.map(t => ({ id: t.id, name: t.name })));
};

exports.sendEmails = async (req, res) => {
  const { senderEmail, appPassword, templateId, subject, message } = req.body;
  const file = req.files.file[0];
  const logo = req.files.logo ? req.files.logo[0] : null;
  const user = await User.findById(req.user.id).populate('plan');

const emailLog = new EmailLog({
  userId: user._id,
  emailsSent: numberOfEmails,
  templateUsed: templateId,
});
await emailLog.save();
checkPlanLimits(user, numberOfEmails);

  // Reset daily count
  const today = new Date().setHours(0, 0, 0, 0);
  if (user.lastResetDate < today) {
    user.emailsSentToday = 0;
    user.lastResetDate = today;
    await user.save();
  }

  // Parse file
  const emails = fs.readFileSync(file.path, 'utf8').split('\n').map(line => line.trim()).filter(email => validator.isEmail(email));
  const numberOfEmails = emails.length;

  // Check limits
  if (user.plan.name === 'Free' && numberOfEmails > 5) return res.status(400).json({ message: 'Max 5 emails per upload for Free plan' });
  const remainingEmails = user.plan.dailyEmailLimit - user.emailsSentToday;
  if (numberOfEmails > remainingEmails) return res.status(400).json({ message: 'Exceeds daily email limit' });

  // Get and validate template
  const template = templates.find(t => t.id == templateId);
  if (!template || (template.type === 'premium' && user.plan.templateAccess !== 'premium')) return res.status(403).json({ message: 'Invalid template or access denied' });

  // Prepare email
  let html = template.html.replace('{{subject}}', subject).replace('{{message}}', message);
  if (template.type === 'premium' && logo) html = html.replace('{{logo}}', 'cid:logo');

  // Send emails
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: senderEmail, pass: appPassword } });
  for (const email of emails) {
    const mailOptions = { from: senderEmail, to: email, subject, html };
    if (template.type === 'premium' && logo) mailOptions.attachments = [{ filename: 'logo.png', path: logo.path, cid: 'logo' }];
    await transporter.sendMail(mailOptions);
  }

  // Update count and clean up
  user.emailsSentToday += numberOfEmails;
  await user.save();
  fs.unlinkSync(file.path);
  if (logo) fs.unlinkSync(logo.path);

  res.json({ message: 'Emails sent successfully' });
};