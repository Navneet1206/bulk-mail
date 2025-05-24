const checkPlanLimits = (user, numberOfEmails) => {
  const today = new Date().setHours(0, 0, 0, 0);
  if (user.lastResetDate < today) {
    user.emailsSentToday = 0;
    user.lastResetDate = today;
  }

  if (user.plan.name === 'Free' && numberOfEmails > 5) {
    throw new Error('Max 5 emails per upload for Free plan');
  }

  const remainingEmails = user.plan.dailyEmailLimit - user.emailsSentToday;
  if (numberOfEmails > remainingEmails) {
    throw new Error('Exceeds daily email limit');
  }
};

module.exports = { checkPlanLimits };