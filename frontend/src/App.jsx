import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import SendEmail from './pages/SendEmail';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setUser(res.data)).catch(() => localStorage.removeItem('token'));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Bulk Email Service</h1>
        <div>
          {token ? (
            <>
              <span className="mr-4">Welcome, {user?.name}</span>
              <button onClick={() => navigate('/dashboard')} className="mr-4 hover:underline">Dashboard</button>
              <button onClick={() => navigate('/plans')} className="mr-4 hover:underline">Plans</button>
              <button onClick={() => navigate('/send-email')} className="mr-4 hover:underline">Send Email</button>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="mr-4 hover:underline">Login</button>
              <button onClick={() => navigate('/signup')} className="hover:underline">Signup</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/send-email" element={<ProtectedRoute><SendEmail /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;