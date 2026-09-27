import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FacultyDashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [onLeaveStudents, setOnLeaveStudents] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [view, setView] = useState('today'); // 'today', 'history', 'qr'
  const [activeQrToken, setActiveQrToken] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTodayAttendance();
    fetchOnLeaveToday();
    fetchAllHistory();
    fetchActiveQrToken();
  }, []);

  const fetchOnLeaveToday = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/on-leave-today', {
        headers: { 'x-auth-token': token }
      });
      setOnLeaveStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveQrToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/active-qr', {
        headers: { 'x-auth-token': token }
      });
      setActiveQrToken(res.data.token);
    } catch (err) {
      console.error(err);
    }
  };

  const generateNewQrToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/attendance/generate-qr', {}, {
        headers: { 'x-auth-token': token }
      });
      setActiveQrToken(res.data.token);
      alert('New QR Code generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate new QR Code.');
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/today', {
        headers: { 'x-auth-token': token }
      });
      setTodayAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/all-history', {
        headers: { 'x-auth-token': token }
      });
      setAllHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending attendance?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://smart-geolocation-attendance-system.onrender.com/api/attendance/${id}`, {
        headers: { 'x-auth-token': token }
      });
      alert('Attendance record deleted.');
      fetchTodayAttendance();
      fetchAllHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleApproveFinal = async () => {
    if (!window.confirm('Are you sure? Once approved, attendance CANNOT be changed.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/attendance/approve-today', {}, {
        headers: { 'x-auth-token': token }
      });
      alert(res.data.message);
      fetchTodayAttendance();
      fetchAllHistory();
    } catch (err) {
      alert('Failed to approve attendance.');
    }
  };
  const handleGrantEmergency = async (studentId, studentName) => {
    const today = new Date().toISOString().split('T')[0];
    const confirmLeave = window.confirm(`Grant Emergency Leave for ${studentName} for today (${today})?`);
    if (!confirmLeave) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`https://smart-geolocation-attendance-system.onrender.com/api/attendance/grant-emergency`, 
        { studentId, date: today }, 
        { headers: { 'x-auth-token': token } }
      );
      alert(res.data.message);
      // Update local state to show it was granted without reloading
      setTodayAttendance(prev => prev.map(record => {
        if (record.studentId?._id === studentId) {
          return {
            ...record,
            studentId: {
              ...record.studentId,
              emergencyLeaves: [...(record.studentId.emergencyLeaves || []), today]
            }
          };
        }
        return record;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grant emergency leave');
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Apollo Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm border border-gray-100 p-1" />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Apollo Institute of <br className="hidden sm:block"/>Engineering and Technology</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <h2 className="text-sm font-bold text-gray-800">Faculty: {user.name}</h2>
              <p className="text-xs text-brand-600 font-semibold">{user.subjectCode} - {user.subject}</p>
            </div>
            <button onClick={logout} className="btn-danger text-sm whitespace-nowrap shadow-sm">Logout</button>
          </div>
        </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setView('history')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'history' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm text-center">Attendance History</span>
          </button>
          <button onClick={() => setView('today')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'today' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            <span className="text-sm text-center">Today's Approvals</span>
          </button>
          <button onClick={() => setView('qr')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'qr' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>
            <span className="text-sm text-center">Live QR Code</span>
          </button>
        </div>

        {view === 'qr' && (
          <div className="card text-center flex flex-col items-center py-10 border-4 border-blue-50 bg-gradient-to-b from-white to-blue-50">
            <h3 className="text-2xl font-black text-gray-800 mb-2">Lecture Attendance QR</h3>
            <p className="text-gray-500 mb-4 max-w-md">Click the button below to generate a new unique QR code for today's lecture. Keep this projected on the screen.</p>
            
            <button onClick={generateNewQrToken} className="btn-primary mb-8 text-lg px-6 py-2 shadow-md">
              Generate New QR Code for Today
            </button>

            {activeQrToken ? (
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 inline-block mb-6">
                <QRCodeSVG 
                  value={activeQrToken} 
                  size={256} 
                  level={"H"}
                  includeMargin={true}
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-10 rounded-2xl border-2 border-dashed border-gray-300 inline-block mb-6 text-gray-500">
                No QR Code generated yet.
              </div>
            )}
          </div>
        )}

        {view === 'today' && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Today's Live Attendance</h3>
                <p className="text-sm text-gray-500">Review pending attendances. Delete invalid ones, then click "Final Approve All".</p>
              </div>
              <button 
                onClick={handleApproveFinal} 
                disabled={!todayAttendance.some(r => !r.approved)}
                className={`whitespace-nowrap shadow-md flex items-center gap-1.5 ${!todayAttendance.some(r => !r.approved) ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-success'}`}>
                <CheckCircle size={18} /> Final Approve All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium rounded-tl-lg">Photo</th>
                    <th className="p-3 border-b font-medium">Name</th>
                    <th className="p-3 border-b font-medium">Enrollment No</th>
                    <th className="p-3 border-b font-medium">Status</th>
                    <th className="p-3 border-b font-medium rounded-tr-lg text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todayAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        {record.studentId?.photo ? (
                          <img src={record.studentId.photo} alt="Student" className="w-10 h-10 object-cover rounded-full border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">No Pic</div>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.name}</td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.enrollmentNumber}</td>
                      <td className="p-3 text-sm">
                        {record.approved 
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span> 
                          : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>}
                      </td>
                      <td className="p-3 text-sm text-center flex flex-col gap-2 items-center justify-center">
                        {!record.approved && (
                          <button onClick={() => handleDelete(record._id)} className="text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition w-full">Remove</button>
                        )}
                        {(() => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          const hasLeave = record.studentId?.emergencyLeaves && record.studentId.emergencyLeaves.includes(todayStr);
                          return (
                            <button 
                              onClick={() => !hasLeave && handleGrantEmergency(record.studentId?._id, record.studentId?.name)} 
                              disabled={hasLeave}
                              className={hasLeave
                                ? "bg-gray-100 text-gray-400 px-2 py-1 rounded-lg font-medium text-xs w-full cursor-not-allowed"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200 px-2 py-1 rounded-lg font-medium text-xs transition w-full"
                              }
                            >
                              {hasLeave ? "Granted" : "Emergency"}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {todayAttendance.length === 0 && <p className="text-center py-6 text-gray-500">No students present today.</p>}
            </div>

            {/* Students on Official Leave Today Table */}
            {onLeaveStudents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Students on Official Leave Today</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-50 text-blue-800 text-sm">
                        <th className="p-3 border-b font-medium rounded-tl-lg">Enrollment No</th>
                        <th className="p-3 border-b font-medium">Name</th>
                        <th className="p-3 border-b font-medium text-center rounded-tr-lg">Leave Letter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {onLeaveStudents.map((stu) => (
                        <tr key={stu._id} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-sm font-bold text-gray-700">{stu.enrollmentNumber}</td>
                          <td className="p-3 text-sm text-gray-700">{stu.name}</td>
                          <td className="p-3 text-sm text-center">
                            {stu.document && (
                              <button 
                                onClick={() => {
                                  const win = window.open();
                                  win.document.write(`<iframe src="${stu.document}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                }}
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium text-xs transition whitespace-nowrap"
                              >
                                View HOD Letter
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="card space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Past Attendance History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium rounded-tl-lg">Date / Time</th>
                    <th className="p-3 border-b font-medium">Name</th>
                    <th className="p-3 border-b font-medium">Enrollment No</th>
                    <th className="p-3 border-b font-medium">Distance</th>
                    <th className="p-3 border-b font-medium rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-700">
                        <div className="font-semibold">{new Date(record.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.name}</td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.enrollmentNumber}</td>
                      <td className="p-3 text-sm text-gray-500">{record.distance}m</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Approved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allHistory.length === 0 && <p className="text-center py-6 text-gray-500">No past attendance records found.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FacultyDashboard;
