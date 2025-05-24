const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const parseEmails = require("../utils/parseEmails");
const { checkPlanLimits } = require("../utils/planChecker");

const templates = [
  {
    id: 1,
    name: "Basic 1",
    html: "<h1>{{subject}}</h1><p>{{message}}</p>",
    type: "basic",
  },
  {
    id: 2,
    name: "Basic 2",
    html: "<h2>{{subject}}</h2><div>{{message}}</div>",
    type: "basic",
  },
  {
    id: 3,
    name: "Basic 3",
    html: "<h3>{{subject}}</h3><p>{{message}}</p>",
    type: "basic",
  },
  {
    id: 4,
    name: "Basic 4",
    html: "<div><h1>{{subject}}</h1>{{message}}</div>",
    type: "basic",
  },
  {
    id: 5,
    name: "Basic 5",
    html: "<p>{{subject}} - {{message}}</p>",
    type: "basic",
  },
  {
    id: 6,
    name: "Premium 1",
    html: '<img src="cid:logo" /><h1>{{subject}}</h1><p>{{message}}</p>',
    type: "premium",
  },
  {
    id: 7,
    name: "Premium 2",
    html: '<img src="cid:logo" /><h2>{{subject}}</h2><div>{{message}}</div>',
    type: "premium",
  },
  {
    id: 8,
    name: "Premium 3",
    html: '<div><img src="cid:logo" />{{subject}} - {{message}}</div>',
    type: "premium",
  },
  {
    id: 9,
    name: "Premium 4",
    html: '<img src="cid:logo" /><p>{{subject}}</p><p>{{message}}</p>',
    type: "premium",
  },
  {
    id: 10,
    name: "Premium 5",
    html: '<img src="cid:logo" /><h3>{{subject}}</h3>{{message}}',
    type: "premium",
  },
];

exports.getTemplates = async (req, res) => {
  const user = await User.findById(req.user.id).populate("plan");
  const availableTemplates = templates.filter(
    (t) =>
      t.type === "basic" ||
      (t.type === "premium" && user.plan.templateAccess === "premium")
  );
  res.json(availableTemplates.map((t) => ({ id: t.id, name: t.name })));
};

exports.sendEmails = async (req, res) => {
  const { senderEmail, appPassword, templateId, subject, message } = req.body;
  const file = req.files.file[0];
  const logo = req.files.logo ? req.files.logo[0] : null;
  const user = await User.findById(req.user.id).populate("plan");

  // Parse emails from file
  const fileType = path.extname(file.originalname);
  const emails = await parseEmails(file.path, fileType);
  const numberOfEmails = emails.length;

  // Check plan limits
  try {
    checkPlanLimits(user, numberOfEmails);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  // Get and validate template
  const template = templates.find((t) => t.id == templateId);
  if (
    !template ||
    (template.type === "premium" && user.plan.templateAccess !== "premium")
  ) {
    return res
      .status(403)
      .json({ message: "Invalid template or access denied" });
  }

  // Prepare email
  let html = template.html
    .replace("{{subject}}", subject)
    .replace("{{message}}", message);
  if (template.type === "premium" && logo) {
    html = html.replace("{{logo}}", "cid:logo");
  }

  // Send emails
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: appPassword },
  });

  try {
    for (const email of emails) {
      const mailOptions = { from: senderEmail, to: email, subject, html };
      if (template.type === "premium" && logo) {
        mailOptions.attachments = [
          { filename: "logo.png", path: logo.path, cid: "logo" },
        ];
      }
      await transporter.sendMail(mailOptions);
    }

    // Update emails sent and log
    user.emailsSentToday += numberOfEmails;
    await user.save();

    const emailLog = new EmailLog({
      userId: user._id,
      emailsSent: numberOfEmails,
      templateUsed: templateId,
    });
    await emailLog.save();

    // Clean up
    fs.unlinkSync(file.path);
    if (logo) fs.unlinkSync(logo.path);

    res.json({ message: "Emails sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending emails", error: error.message });
  }
};
