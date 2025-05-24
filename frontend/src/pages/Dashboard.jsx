import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!user) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="bg-white shadow rounded p-6 mb-4">
        <p className="mb-2"><strong>Name:</strong> {user.name}</p>
        <p className="mb-2"><strong>Email:</strong> {user.email}</p>
        <p className="mb-2"><strong>Plan:</strong> {user.plan.name} (Daily Limit: {user.plan.dailyEmailLimit})</p>
        <p className="mb-2"><strong>Emails Sent Today:</strong> {user.emailsSentToday}</p>
      </div>
      <div className="flex space-x-4">
        <button onClick={() => navigate('/send-email')} className="bg-blue-500 text-white p-2 rounded">Send Emails</button>
        <button onClick={() => navigate('/plans')} className="bg-green-500 text-white p-2 rounded">Manage Plans</button>
      </div>
    </div>
  );
};

export default Dashboard;