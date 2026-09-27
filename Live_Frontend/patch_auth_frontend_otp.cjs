const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

const otpStateInsert = `
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { enrollmentNumber: forgotEnrollment });
      setMsg(res.data.message);
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/change-password-otp', { 
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
`;

content = content.replace(/const \[forgotNewPassword, setForgotNewPassword\] = useState\(''\);/, "const [forgotNewPassword, setForgotNewPassword] = useState('');\n" + otpStateInsert);

const forgotFormHtml = `
            {showOtpForm ? (
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
                </div>
                <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                  {loading ? 'Processing...' : 'Change Password'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setShowOtpForm(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                  <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={forgotEnrollment} onChange={(e) => setForgotEnrollment(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
                </div>
              </form>
            )}
`;

content = content.replace(/<form onSubmit=\{handleForgotPassword\} className=\"space-y-4\">[\s\S]*?<\/form>/, forgotFormHtml);

fs.writeFileSync(file, content);
