const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update handleForgotPassword to not use newPassword anymore
content = content.replace(
  /const handleForgotPassword = async \(e\) => {[\s\S]*?try {[\s\S]*?const res = await axios\.post\('http:\/\/localhost:5000\/api\/auth\/forgot-password', \{[\s\S]*?\}?\);/,
  `const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { 
        enrollmentNumber: forgotEnrollment
      });`
);

// We need to update the UI where they enter enrollment number to show two buttons.
const newSendOtpForm = `
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                  <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={forgotEnrollment} onChange={(e) => setForgotEnrollment(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-3 mt-6">
                  <button type="button" onClick={handleForgotPassword} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center bg-gray-800 hover:bg-gray-900">
                    {loading ? 'Sending...' : 'Get Old Password on Email'}
                  </button>
                  <div className="text-center text-xs text-gray-500 font-bold">- OR -</div>
                  <button type="button" onClick={handleSendOtp} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center">
                    {loading ? 'Sending OTP...' : 'Set New Password (via OTP)'}
                  </button>
                </div>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
                </div>
              </form>
`;

content = content.replace(
  /<form onSubmit=\{handleSendOtp\} className="space-y-4">[\s\S]*?<\/form>/,
  newSendOtpForm
);

fs.writeFileSync(file, content);
