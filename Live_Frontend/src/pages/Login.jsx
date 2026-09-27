import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const Login = () => {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/login', { enrollmentNumber, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'superadmin') {
        navigate('/head-dashboard');
      } else if (res.data.user.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/student-dashboard');
      }
      // Force reload to update auth state in App.js
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/forgot-password', { email: forgotEmail });
      setMsg(res.data.message);
      setShowForgot(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {msg && <p style={{ color: 'green', fontWeight: 'bold', background: '#dcfce7', padding: '10px', borderRadius: '5px' }}>{msg}</p>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Enrollment No (or 10-Digit Code for Faculty)" 
          value={enrollmentNumber} 
          onChange={(e) => setEnrollmentNumber(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <div style={{ textAlign: 'right' }}>
          <button type="button" onClick={() => setShowForgot(!showForgot)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>
            Forgot Password?
          </button>
        </div>
        <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
      </form>

      {showForgot && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h4>Retrieve Password via Email</h4>
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="email" 
              placeholder="Enter your Registered Email" 
              value={forgotEmail} 
              onChange={(e) => setForgotEmail(e.target.value)} 
              required 
            />
            <button type="submit" style={{ padding: '10px', background: 'orange', border: 'none', cursor: 'pointer', color: 'white' }}>
              Send Password to Email
            </button>
          </form>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#eef2ff', borderLeft: '4px solid #4f46e5', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#3730a3', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} /> Instructions:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4338ca', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><b>Students:</b> If this is your first time, you must FIRST click on 'Register' below and create your account.</li>
          <li><b>Faculty:</b> Directly login using the 10-Digit code provided by the Admin (as both ID and Password). No registration required.</li>
        </ul>
      </div>

      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
