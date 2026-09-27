const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add forgotNewPassword to state
if (!content.includes('const [forgotNewPassword, setForgotNewPassword] = useState')) {
  content = content.replace('const [forgotEnrollment, setForgotEnrollment] = useState(\'\');', 'const [forgotEnrollment, setForgotEnrollment] = useState(\'\');\n  const [forgotNewPassword, setForgotNewPassword] = useState(\'\');');
}

// 2. Modify handleForgotPassword to send newPassword
content = content.replace(/axios\.post\('http:\/\/localhost:5000\/api\/auth\/forgot-password', \{[\s\n]*enrollmentNumber: forgotEnrollment[\s\n]*\}\);/, `axios.post('http://localhost:5000/api/auth/forgot-password', { 
        enrollmentNumber: forgotEnrollment,
        newPassword: forgotNewPassword
      });`);
      
// Clear it on success
content = content.replace(/setMsg\(res\.data\.message\);/, 'setMsg(res.data.message);\n      setForgotNewPassword(\'\');');

// 3. Modify the Forgot Password form
const newForgotForm = `
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrollment Number</label>
                <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={forgotEnrollment} onChange={(e) => setForgotEnrollment(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password (Optional)</label>
                <input type="password" placeholder="Leave blank to keep old password" className="input-field" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full flex justify-center items-center">
                {loading ? 'Sending...' : 'Send Password to Email'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setShowForgot(false)} className="text-sm font-medium text-teal-600 hover:text-teal-700">Back to Login</button>
              </div>
            </form>
`;

content = content.replace(/<form onSubmit=\{handleForgotPassword\} className="space-y-4">[\s\S]*?<\/form>/, newForgotForm);

// 4. Remove the separate Change Password button from the login form
content = content.replace(/<div className="flex flex-col items-end gap-1">[\s\S]*?<\/div>/, `<button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">
                      Forgot / Change Password?
                    </button>`);

// 5. Remove the Change Password rendering block if exists
content = content.replace(/\) : showChangePassword \? \([\s\S]*?\) : showForgot \? \(/, ') : showForgot ? (');

fs.writeFileSync(file, content);
