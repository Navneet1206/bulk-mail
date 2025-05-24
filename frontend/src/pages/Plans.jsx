// frontend/src/pages/Plans.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Plans = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/plan', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setPlans(res.data));
  }, []);

  const handleUpgrade = async (planId) => {
    try {
      await axios.post('http://localhost:5000/api/plan/update', { planId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Plan updated successfully');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan._id} className="border p-4">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p>Daily Limit: {plan.dailyEmailLimit}</p>
            <p>Max Upload: {plan.maxEmailsPerUpload === -1 ? 'Unlimited' : plan.maxEmailsPerUpload}</p>
            <p>Templates: {plan.templateAccess}</p>
            <p>Price: ${plan.price}</p>
            <button onClick={() => handleUpgrade(plan._id)} className="mt-2 bg-blue-500 text-white p-2">Select Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;