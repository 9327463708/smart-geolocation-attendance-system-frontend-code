import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Inbox, CheckCircle, AlertCircle, QrCode } from 'lucide-react';

const StudentDashboard = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ percentage: '0.00', present: 0, total: 0 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState('A');
  const [profile, setProfile] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [qrToken, setQrToken] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
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
      const res = await axios.put('https://smart-geolocation-attendance-system.onrender.com/api/users/change-password', 
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

  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [showSetupModal, setShowSetupModal] = useState(!sessionStorage.getItem('academicSetupDone'));
  const [setupBranch, setSetupBranch] = useState(user.branch || 'Computer Engineering');
  const [setupSemester, setSetupSemester] = useState(user.semester || 1);
  const [setupBatch, setSetupBatch] = useState(user.batch || 'A');

  useEffect(() => {
    fetchHistory();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/users/me', { headers: { 'x-auth-token': token } });
      setProfile(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
      scanner.render(
        (result) => {
          scanner.clear();
          setQrToken(result);
          setShowScanner(false);
          setMessage('QR Code Scanned Successfully! Now checking location...');
          handleMarkAttendance(result);
        },
        (err) => {
          // ignore scan errors
        }
      );

      return () => {
        scanner.clear().catch(e => console.log('Scanner cleared'));
      };
    }
  }, [showScanner]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/my-history', {
        headers: { 'x-auth-token': token }
      });
      // The new backend route returns { history, stats }
      setHistory(res.data.history || res.data);
      if (res.data.stats) {
        setStats({
          percentage: res.data.stats.attendancePercentage,
          present: res.data.stats.presentDays,
          total: res.data.stats.totalWorkingDays
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = (scannedToken) => {
    const tokenToUse = scannedToken || qrToken;
    if (!tokenToUse) {
      setMessage('Please scan the QR code first.');
      return;
    }
    
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const token = localStorage.getItem('token');
          
          const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/attendance/mark', 
            { latitude, longitude, batch, qrToken: tokenToUse },
            { headers: { 'x-auth-token': token } }
          );

          setMessage(res.data.message);
          fetchHistory(); // Refresh history
        } catch (err) {
          setMessage(err.response?.data?.message || 'Failed to mark attendance.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage('Error fetching location. Please allow location access.');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('https://smart-geolocation-attendance-system.onrender.com/api/users/academic-profile', 
        { branch: setupBranch, semester: setupSemester, batch: setupBatch },
        { headers: { 'x-auth-token': token } }
      );
      
      const updatedUser = { ...user, branch: setupBranch, semester: setupSemester, batch: setupBatch };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('academicSetupDone', 'true');
      setBatch(setupBatch); // Update the dropdown in the dashboard too
      setShowSetupModal(false);
      window.location.reload(); // Reload to refresh history and profile properly
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (showSetupModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <form onSubmit={handleSetupSubmit} className="bg-white p-8 rounded-3xl max-w-md w-full shadow-lg border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h2>
          <p className="text-gray-500 mb-6">Please confirm your academic details to continue.</p>
          
          <div className="text-left space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Branch</label>
              <select value={setupBranch} onChange={e => setSetupBranch(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50">
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="AIDS">AIDS</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Semester</label>
              <select value={setupSemester} onChange={e => setSetupSemester(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-gray-50">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Batch</label>
              <select value={setupBatch} onChange={e => setSetupBatch(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50">
                <option value="A">Batch A</option>
                <option value="B">Batch B</option>
                <option value="C">Batch C</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            Continue to Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Apollo Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm border border-gray-100 p-1" />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Apollo Institute of <br className="hidden sm:block"/>Engineering and Technology</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPhotoModal(true)} className="hidden md:flex items-center gap-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors focus:outline-none">
              {user.photo ? (
                <img src={user.photo} alt="Profile" className="w-9 h-9 rounded-full object-cover shadow-sm border border-white" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left pr-2">
                <h2 className="text-sm font-bold text-gray-800 leading-tight">{user.name}</h2>
                <p className="text-[11px] font-medium text-gray-500 leading-tight">{user.enrollmentNumber}</p>
              </div>
            </button>
            
            <button onClick={() => setShowPasswordModal(true)} className="btn-secondary text-sm whitespace-nowrap shadow-sm mr-2">Change Password</button>
            <button onClick={logout} className="btn-danger text-sm whitespace-nowrap shadow-sm">Logout</button>

          </div>
        </div>

        {/* Stats & Mark Attendance Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Stats Card */}
          <div className="card flex flex-col justify-center items-center bg-white border-l-4 border-blue-500 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-600 mb-2">Overall Attendance</h3>
            <div className={`text-5xl font-black mb-2 ${parseFloat(stats.percentage) >= 75 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.percentage}%
            </div>
            <div className="mb-4">
              {parseFloat(stats.percentage) >= 75 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                  <CheckCircle className="w-4 h-4 mr-2" /> Exam Eligible
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-200">
                  <AlertCircle className="w-4 h-4 mr-2" /> Not Eligible for Exam
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-4">
              Present {stats.present} out of {stats.total} days
            </p>
            
          </div>

          {/* Mark Attendance Card */}
          <div className="card text-center border border-blue-100 bg-gradient-to-b from-white to-blue-50">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mark Today's Attendance</h3>
            <p className="text-gray-500 mb-4 text-sm">Ensure you are inside the college premises and allow location access.</p>
            
            

            
            {showScanner ? (
              <div className="mb-4">
                <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-blue-200"></div>
                <button onClick={() => setShowScanner(false)} className="mt-4 btn-danger text-sm">Cancel Scanning</button>
              </div>
            ) : (
              <button 
                onClick={() => { setMessage(''); setShowScanner(true); }} 
                disabled={loading}
                className={`px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-transform transform flex items-center justify-center gap-2 mx-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'}`}
              >
                {loading ? 'Processing...' : <><QrCode size={20} /> Scan QR & Mark Present</>}
              </button>
            )}
            
            {message && (
              <div className={`mt-4 block px-4 py-2 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
          </div>
        </div>



        
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
                  <div className={`mt-3 p-3 text-sm rounded-lg ${passMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {passMessage.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}


        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPhotoModal(false)}>
            <div className="bg-white p-6 rounded-3xl max-w-sm w-full flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b w-full text-center pb-2">Student Profile</h3>
              
                <div className="relative block mt-4">
                  {user.photo ? (
                    <img src={user.photo} alt="Student Profile" className="w-48 h-48 object-cover rounded-2xl shadow-md border-4 border-gray-50 mb-4" />
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500 text-6xl font-bold mb-4">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-xl text-gray-900">{user.name}</h4>
                <p className="text-gray-500 font-medium mb-6">{user.enrollmentNumber}</p>
                
                <div className="flex gap-3 w-full mb-4">
                  <button 
                    onClick={() => document.getElementById('photo-upload').click()} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-colors"
                  >
                    Change Photo
                  </button>
                  <button 
                    onClick={() => setShowPhotoModal(false)} 
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    No Change
                  </button>
                </div>

                <input 
                  id="photo-upload"
                  type="file" 
                  accept=".jpg,.jpeg,image/jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 250 * 1024) {
                        alert('Photo size should be less than 250KB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/users/photo', 
                            { photoBase64: reader.result }, 
                            { headers: { 'x-auth-token': token } }
                          );
                          
                          // Update local storage and state
                          const updatedUser = { ...user, photo: reader.result };
                          localStorage.setItem('user', JSON.stringify(updatedUser));
                          window.location.reload(); // Refresh to reflect everywhere
                        } catch (err) {
                          alert(err.response?.data?.message || 'Error updating photo');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
