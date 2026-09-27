import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const Register = () => {
  const [roleType, setRoleType] = useState('student'); // 'student' or 'faculty'
  
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    password: '',
    branch: '',
    semester: '',
    batch: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/register', formData);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ marginTop: '10px', marginBottom: '20px', padding: '15px', background: '#fffbeb', borderLeft: '4px solid #d97706', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} /> Instructions:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><b>Students:</b> You must create your account here using your Enrollment Number before you can login and mark attendance.</li>
        </ul>
      </div>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
        <input name="enrollmentNumber" type="text" placeholder="Enrollment Number" onChange={handleChange} required />
        
        <select name="branch" onChange={handleChange} required style={{ padding: '8px' }}>
          <option value="" disabled selected>Select Branch</option>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Information Technology">Information Technology</option>
          <option value="AIDS">AIDS</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
        </select>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select name="semester" onChange={handleChange} required style={{ padding: '8px', flex: 1 }}>
            <option value="" disabled selected>Select Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          <select name="batch" onChange={handleChange} required style={{ padding: '8px', flex: 1 }}>
            <option value="" disabled selected>Select Batch</option>
            <option value="A">Batch A</option>
            <option value="B">Batch B</option>
            <option value="C">Batch C</option>
          </select>
        </div>

        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        
        <button type="submit" style={{ padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
          Register as Student
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
