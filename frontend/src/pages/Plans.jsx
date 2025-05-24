import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/plan', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setPlans(res.data))
      .catch(err => setError('Failed to load plans'));
  }, []);

  const handleUpgrade = async (planId) => {
    try {
      await axios.post('http://localhost:5000/api/plan/update', { planId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Plan updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update plan');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan._id} className="bg-white shadow rounded p-4">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="mb-1">Daily Limit: {plan.dailyEmailLimit}</p>
            <p className="mb-1">Max Upload: {plan.maxEmailsPerUpload === -1 ? 'Unlimited' : plan.maxEmailsPerUpload}</p>
            <p className="mb-1">Templates: {plan.templateAccess}</p>
            <p className="mb-2">Price: ${plan.price}</p>
            <button
              onClick={() => handleUpgrade(plan._id)}
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;