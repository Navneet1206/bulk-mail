// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-4">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Plan:</strong> {user.plan.name} (Daily Limit: {user.plan.dailyEmailLimit})</p>
        <p><strong>Emails Sent Today:</strong> {user.emailsSentToday}</p>
      </div>
      <button onClick={() => navigate('/send-email')} className="mr-2 bg-blue-500 text-white p-2">Send Emails</button>
      <button onClick={() => navigate('/plans')} className="bg-green-500 text-white p-2">Manage Plans</button>
    </div>
  );
};

export default Dashboard;