import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessType: '',
    numberOfEmployees: '',
    businessName: '',
    address: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { ...formData, otp });
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {!otpSent ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Signup</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              name="businessType"
              placeholder="Business Type"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="number"
              name="numberOfEmployees"
              placeholder="Number of Employees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
          </form>
          <p className="mt-4 text-center">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Verify OTP</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Signup;