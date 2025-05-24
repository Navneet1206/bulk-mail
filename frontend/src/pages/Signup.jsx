// frontend/src/pages/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', businessType: '', numberOfEmployees: '', businessName: '', address: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setOtpSent(true);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { ...formData, otp });
      window.location.href = '/login';
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {!otpSent ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Signup</h2>
          <div onSubmit={handleSignup}>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="text" name="businessType" placeholder="Business Type" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="number" name="numberOfEmployees" placeholder="Number of Employees" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="text" name="businessName" placeholder="Business Name" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <input type="text" name="address" placeholder="Address" onChange={handleChange} className="w-full mb-2 p-2 border" />
            <button onClick={handleSignup} className="w-full bg-blue-500 text-white p-2">Sign Up</button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
          <div onSubmit={handleVerifyOtp}>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full mb-2 p-2 border" />
            <button onClick={handleVerifyOtp} className="w-full bg-blue-500 text-white p-2">Verify OTP</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;