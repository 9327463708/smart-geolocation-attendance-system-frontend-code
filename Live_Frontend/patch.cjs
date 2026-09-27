const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleForgotPassword
content = content.replace(/const handleForgotPassword = async.*?finally \{\s*setLoading\(false\);\s*\}\s*\};/s, `const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { enrollmentNumber: forgotEnrollment });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };`);

// Replace form
content = content.replace(/<form onSubmit=\{handleForgotPassword\}.*?<\/form>/s, `<form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
              <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={forgotEnrollment} onChange={(e) => setForgotEnrollment(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
              {loading ? 'Sending...' : 'Send Password to Email'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
            </div>
          </form>`);

// Remove forgotMobile state if exists
content = content.replace(/\s*const \[forgotMobile, setForgotMobile\] = useState\(''\);/, '');

fs.writeFileSync(file, content);
