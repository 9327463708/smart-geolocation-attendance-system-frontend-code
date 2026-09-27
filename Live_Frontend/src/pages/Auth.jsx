import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [role, setRole] = useState(''); // 'student', 'faculty', 'admin'
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', enrollmentNumber: '', code: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpEnrollment, setCpEnrollment] = useState('');
  const [cpOldPassword, setCpOldPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');

  const handleChangePasswordPublic = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await axios.put('https://smart-geolocation-attendance-system.onrender.com/api/auth/change-password-public', { 
        enrollmentNumber: cpEnrollment,
        oldPassword: cpOldPassword,
        newPassword: cpNewPassword
      });
      setMsg(res.data.message);
      setForgotNewPassword('');
      setCpEnrollment('');
      setCpOldPassword('');
      setCpNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  const [forgotEnrollment, setForgotEnrollment] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    setLoadingType('otp');
    try {
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/send-otp', { enrollmentNumber: forgotEnrollment });
      setMsg(res.data.message);
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleChangePasswordOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s.])(?!.*[\s.]).{4,12}$/;
    if (!passwordRegex.test(forgotNewPassword)) {
      setError('Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots. Max 12 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put('https://smart-geolocation-attendance-system.onrender.com/api/auth/change-password-otp', { 
        enrollmentNumber: forgotEnrollment,
        otp: otp,
        newPassword: forgotNewPassword
      });
      setMsg(res.data.message);
      setTimeout(() => {
        setShowForgot(false);
        setShowOtpForm(false);
        setForgotEnrollment('');
        setOtp('');
        setForgotNewPassword('');
        setMsg('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/jpeg') {
        setError('Only .jpg and .jpeg photo formats are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 250 * 1024) {
        setError('Photo size should be less than 250KB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && role === 'student') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s.])(?!.*[\s.]).{4,12}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots. Max 12 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/login', {
          enrollmentNumber: role === 'faculty' ? formData.code : formData.enrollmentNumber,
          password: role === 'faculty' ? 'dummy' : formData.password,
          isFacultyLogin: role === 'faculty'
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (res.data.user.role === 'admin' || res.data.user.role === 'superadmin') {
          window.location.href = '/head-dashboard';
        } else if (res.data.user.role === 'faculty') {
          window.location.href = '/faculty-dashboard';
        } else {
          window.location.href = '/student-dashboard';
        }
      } else {
        const endpoint = role === 'faculty' ? 'register-faculty' : 'register';
        const res = await axios.post(`https://smart-geolocation-attendance-system.onrender.com/api/auth/${endpoint}`, formData);
        setMsg(res.data.message);
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    setLoadingType('old');
    try {
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/auth/forgot-password', { 
        enrollmentNumber: forgotEnrollment
      });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          <div className="md:w-1/2 bg-teal-900 p-10 text-white flex flex-col justify-between">
            <div className="flex flex-col items-start">
              <div className="bg-white p-3 rounded-2xl shadow-lg mb-6">
                <img src="/logo.jpg" alt="Apollo Institute Logo" className="w-20 h-20 object-contain rounded-xl" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Apollo Institute of Engineering and Technology</h1>
              <p className="text-teal-100 text-sm mt-4 font-medium">Smart Geolocation Attendance System</p>
            </div>
            
            <div className="mt-12 md:mt-0">
              <p className="text-sm font-medium text-teal-100">&copy; 2026 Apollo Institute. All Rights Reserved.</p>
            </div>
          </div>

          <div className="md:w-1/2 p-10 sm:p-14 bg-white flex flex-col justify-center text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
              <p className="text-gray-500">Please select your role to continue</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setRole('admin'); setMode('login'); }} className="btn-primary py-4 text-lg bg-gray-900 hover:bg-black">Admin (Head)</button>
              <button onClick={() => { setRole('faculty'); setMode('login'); }} className="btn-primary py-4 text-lg">Faculty</button>
              <button onClick={() => { setRole('student'); setMode('login'); }} className="btn-primary py-4 text-lg bg-blue-600 hover:bg-blue-700">Student</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 relative">
        
        <button onClick={() => { setRole(''); setMode('login'); setError(''); setMsg(''); setShowForgot(false); }} className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 font-semibold text-sm">
          &larr; Back
        </button>
        
        <div className="mt-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {role.charAt(0).toUpperCase() + role.slice(1)} {mode === 'login' ? 'Login' : 'Registration'}
          </h2>
          <p className="text-gray-500 text-sm">Enter your details to proceed.</p>
        </div>
        
        {role === 'student' && !showForgot && (
          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-8">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'login' ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${mode === 'register' ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">{error}</div>}
        {msg && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium mb-6 border border-green-200">{msg}</div>}
        
        
          {showChangePassword ? (
            <form onSubmit={handleChangePasswordPublic} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={cpEnrollment} onChange={(e) => setCpEnrollment(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Old Password</label>
                <input type="password" placeholder="Enter Old Password" className="input-field" value={cpOldPassword} onChange={(e) => setCpOldPassword(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <input type="password" placeholder="Enter New Password" className="input-field" value={cpNewPassword} onChange={(e) => setCpNewPassword(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <div className="text-center mt-4 flex justify-between">
                <button type="button" onClick={() => setShowChangePassword(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
              </div>
            </form>
          
                    ) : showForgot ? (
            showOtpForm ? (
              <form onSubmit={handleChangePasswordOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                  <input type="text" className="input-field bg-gray-100" value={forgotEnrollment} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter OTP</label>
                  <input type="text" placeholder="Enter 4-digit OTP" className="input-field text-center font-bold tracking-widest text-lg" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input type="password" placeholder="Enter New Password" className="input-field" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} required />
                  <p className="text-xs text-gray-500 mt-1">Must contain 1 uppercase, 1 lowercase, 1 number, 1 special char. No spaces/dots. Max 12 chars.</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                  {loading ? 'Processing...' : 'Change Password'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setShowOtpForm(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back</button>
                </div>
              </form>
            ) : (
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                  <input type="text" className="input-field bg-gray-100 cursor-not-allowed" value={forgotEnrollment} readOnly title="You cannot change the enrollment number here. Go back to login to change it." />
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={handleForgotPassword} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center bg-gray-800 hover:bg-gray-900">
                      {loading && loadingType === 'old' ? 'Sending...' : 'Get Old Password on Email'}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center leading-tight">Use this to receive your current password directly to your registered email.</p>
                  </div>
                  
                  <div className="text-center text-xs text-gray-400 font-black">- OR -</div>
                  
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={handleSendOtp} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center">
                      {loading && loadingType === 'otp' ? 'Sending OTP...' : 'Set New Password (via OTP)'}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center leading-tight">Use this to securely reset and create a brand new password via OTP verification.</p>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
                </div>
              </form>

            )
          ) : (
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Passport Size Photo</label>
                <input type="file" accept=".jpg,.jpeg,image/jpeg" className="input-field p-2" onChange={handlePhotoChange} required />
                <p className="text-xs text-gray-500 mt-1">Clear passport size photo required (Max 250KB, JPG/JPEG only).</p>
              </div>
            </>
          )}

          {(role === 'student' || role === 'admin') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {role === 'admin' ? "Admin Username" : "Enrollment Number"} <span className="text-red-500">*</span>
              </label>
              <input 
                name="enrollmentNumber" 
                type="text" 
                placeholder={role === 'admin' ? "admin" : "e.g. 210103100..."} 
                className="input-field" 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {mode === 'register' && role === 'student' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" className="input-field" onChange={handleChange} required />
            </div>
          )}

          {role === 'faculty' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Faculty Activation Code</label>
              <input name="code" type="text" placeholder="10-Digit Code" className="input-field tracking-widest font-mono text-center text-lg bg-teal-50 focus:ring-teal-500 border-teal-200" onChange={handleChange} required />
            </div>
          )}

          {(role === 'student' || role === 'admin') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                <span>Password</span>
                {mode === 'login' && role === 'student' && (
                  <button type="button" onClick={() => {
                      if (!formData.enrollmentNumber) {
                        setError('Please enter your Enrollment Number in the box above to reset or change your password.');
                        return;
                      }
                      setForgotEnrollment(formData.enrollmentNumber);
                      setShowForgot(true);
                    }} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">
                      Forgot / Change Password?
                    </button>
                )}
              </label>
              <input name="password" type="password" placeholder="••••••••" className="input-field" onChange={handleChange} required={mode === 'register' || !showForgot} />
              
              {mode === 'register' && role === 'student' && (
                <p className="text-xs text-gray-500 mt-1">Must contain 1 uppercase, 1 lowercase, 1 number, 1 special char. No spaces/dots. Max 12 chars.</p>
              )}
            </div>
          )}
          
          {mode === 'register' && role === 'student' && (
            <p className="font-bold text-sm text-red-600 mt-4 text-center">
              Note: students are requested to take a screenshot of this page
            </p>
          )}
          
          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full flex justify-center items-center">
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
