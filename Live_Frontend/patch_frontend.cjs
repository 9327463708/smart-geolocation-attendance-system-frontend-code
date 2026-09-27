const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const changePasswordState = `
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/change-password', 
        { oldPassword, newPassword }, 
        { headers: { 'x-auth-token': token } }
      );
      setPassMessage({ type: 'success', text: res.data.message });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMessage({ type: 'error', text: err.response?.data?.message || 'Error changing password' });
    } finally {
      setPassLoading(false);
    }
  };
`;

content = content.replace(/const \[showPhotoModal, setShowPhotoModal\] = useState\(false\);/, "const [showPhotoModal, setShowPhotoModal] = useState(false);" + changePasswordState);

const passwordModalHtml = `
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
            <div className="bg-white p-6 rounded-3xl max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Change Password</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Old Password</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="input-field" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="input-field" placeholder="Enter new password" />
                </div>
                <button type="submit" disabled={passLoading} className="btn-primary w-full flex justify-center py-2.5 mt-2">
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
                {passMessage && (
                  <div className={\`mt-3 p-3 text-sm rounded-lg \${passMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                    {passMessage.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
`;

content = content.replace(/\{\/\* Photo Modal \*\/\}/, passwordModalHtml + "\n\n        {/* Photo Modal */}");

const changePasswordButton = `
            <button onClick={() => setShowPasswordModal(true)} className="btn-secondary text-sm whitespace-nowrap shadow-sm mr-2">Change Password</button>
            <button onClick={logout} className="btn-danger text-sm whitespace-nowrap shadow-sm">Logout</button>
`;
content = content.replace(/<button onClick=\{logout\} className=\"btn-danger text-sm whitespace-nowrap shadow-sm\">Logout<\/button>/, changePasswordButton);

fs.writeFileSync(file, content);
