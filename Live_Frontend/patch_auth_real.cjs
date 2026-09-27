const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// Insert the state if not already there
if (!content.includes('setShowChangePassword')) {
  const stateInsert = `
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
      const res = await axios.put('http://localhost:5000/api/auth/change-password-public', { 
        enrollmentNumber: cpEnrollment,
        oldPassword: cpOldPassword,
        newPassword: cpNewPassword
      });
      setMsg(res.data.message);
      setCpEnrollment('');
      setCpOldPassword('');
      setCpNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    } finally {
      setLoading(false);
    }
  };
`;
  content = content.replace('const [showForgot, setShowForgot] = useState(false);', 'const [showForgot, setShowForgot] = useState(false);\n' + stateInsert);
}

// Add the 'Change Password' button near 'Forgot Password'
if (!content.includes('Change Password?')) {
  content = content.replace(
    '<button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">\n                    Forgot Password?\n                  </button>',
    `<div className="flex flex-col items-end gap-1">
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">
                      Forgot Password?
                    </button>
                    <button type="button" onClick={() => setShowChangePassword(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                      Change Password?
                    </button>
                  </div>`
  );
}

// Add the rendering block for showChangePassword
if (content.includes(') : showForgot ? (')) {
  const formHtml = `
          ) : showChangePassword ? (
            <form onSubmit={handleChangePasswordPublic} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={cpEnrollment} onChange={(e) => setCpEnrollment(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Old Password (જૂનો પાસવર્ડ)</label>
                <input type="password" placeholder="Enter Old Password" className="input-field" value={cpOldPassword} onChange={(e) => setCpOldPassword(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password (નવો પાસવર્ડ)</label>
                <input type="password" placeholder="Enter New Password" className="input-field" value={cpNewPassword} onChange={(e) => setCpNewPassword(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setShowChangePassword(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
              </div>
            </form>`;
  
  content = content.replace(') : showForgot ? (', formHtml + '\n          ) : showForgot ? (');
}

fs.writeFileSync(file, content);
