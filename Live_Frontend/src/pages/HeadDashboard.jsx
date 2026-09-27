import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import TimetableManager from './TimetableManager';
import { FileText, Trash2, Users, ShieldCheck, UserPlus, List } from 'lucide-react';

const HeadDashboard = () => {
  const [students, setStudents] = useState([]);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Student Email Update State
  const [updateEnrollment, setUpdateEnrollment] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  // Long Leave State
  const [leaveData, setLeaveData] = useState({ enrollmentNumber: '', startDate: '', endDate: '' });
  const [leaveMsg, setLeaveMsg] = useState({ text: '', type: '' });

  const [users, setUsers] = useState([]); // for faculty and admin management
  const [facultyCodes, setFacultyCodes] = useState([]);
  const [view, setView] = useState('attendance'); // 'attendance', 'users', 'students'
  
  // PDF Report Filters
  const [reportBranch, setReportBranch] = useState('');
  const [reportSemester, setReportSemester] = useState('');
  const [reportBatch, setReportBatch] = useState('');
  
  // Student Search Filters
  const [searchName, setSearchName] = useState('');
  const [searchBranch, setSearchBranch] = useState('');
  const [searchSemester, setSearchSemester] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [newFaculty, setNewFaculty] = useState({ facultyName: '', subjectName: '', subjectCode: '' });
  const [newStudent, setNewStudent] = useState({ name: '', enrollmentNumber: '', email: '', mobileNumber: '', branch: '', semester: '', batch: '' });
  const [locationConfig, setLocationConfig] = useState({ latitude: '', longitude: '', radius: '' });
  
  // Allowed Enrollments State
  const [allowedEnrollments, setAllowedEnrollments] = useState([]);
  const [allowBranch, setAllowBranch] = useState('Computer Engineering');
  const [allowFullName, setAllowFullName] = useState('');
  const [allowEnrollmentNumber, setAllowEnrollmentNumber] = useState('');
  const [allowMobileNumber1, setAllowMobileNumber1] = useState('');
  const [allowMobileNumber2, setAllowMobileNumber2] = useState('');
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudents();
    fetchFacultyCodes();
    fetchLocationConfig();
    fetchHistory();
    fetchAllowedEnrollments();
  }, []);

  const fetchAllowedEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/admin/allow-enrollments', {
        headers: { 'x-auth-token': token }
      });
      setAllowedEnrollments(res.data);
    } catch (err) {
      console.error('Error fetching allowed enrollments', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/all-history', { headers: { 'x-auth-token': token } });
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleExportExcel = () => {
    if (history.length === 0) return alert('No data to export');
    const dataToExport = history.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      Subject: record.subjectName || 'N/A',
      Name: record.studentId?.name || 'Unknown',
      EnrollmentNo: record.studentId?.enrollmentNumber || 'Unknown',
      Status: 'Present'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance History");
    XLSX.writeFile(workbook, `College_Attendance_History.xlsx`);
  };

  const getBase64ImageFromUrl = async (imageUrl) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleExportPDF = async () => {
    if (!reportBranch || !reportSemester || !reportBatch) {
      return alert('Please select Branch, Semester, and Batch to generate the report.');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/attendance/summary-report', { headers: { 'x-auth-token': token } });
      let students = res.data;
      
      students = students.filter(s => s.branch === reportBranch && s.semester == reportSemester && s.batch === reportBatch);
      if (students.length === 0) return alert('No students found for this class.');

      const doc = new jsPDF();
      
      // Cover Page (First Page)
      // 1. Draw Page Borders
      doc.setDrawColor(0, 51, 102); // Dark blue border
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 190, 277); 
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 186, 273); 

      // 2. Add Logo
      try {
        const logoBase64 = await getBase64ImageFromUrl('/logo.jpg');
        if (logoBase64) {
          doc.addImage(logoBase64, 'JPEG', 85, 40, 40, 40);
        }
      } catch(e) {}

      // 3. College Name (Single line, smaller size to fit)
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text("APOLLO INSTITUTE OF ENGINEERING AND TECHNOLOGY", 105, 95, { align: "center" });
      
      // Divider Line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(20, 105, 190, 105);

      // 4. Report Title
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38); // Crimson red
      doc.text("ATTENDANCE SUMMARY REPORT", 105, 120, { align: "center" });

      // 5. Details Box
      doc.setDrawColor(0, 51, 102);
      doc.setFillColor(245, 247, 250); // Light blueish gray
      doc.setLineWidth(0.5);
      doc.roundedRect(45, 135, 120, 60, 5, 5, 'FD'); // Fill and border
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Branch:`, 60, 150);
      doc.setFont("helvetica", "normal");
      doc.text(`${reportBranch}`, 95, 150);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Semester:`, 60, 165);
      doc.setFont("helvetica", "normal");
      doc.text(`Sem ${reportSemester}`, 95, 165);

      doc.setFont("helvetica", "bold");
      doc.text(`Batch:`, 60, 180);
      doc.setFont("helvetica", "normal");
      doc.text(`Batch ${reportBatch}`, 95, 180);

      // 6. Generated Date Footer
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 270, { align: "center" });

      // Reset text color before next page
      doc.setTextColor(0, 0, 0);
      
      // Start Table on Second Page
      doc.addPage();
      
      const tableColumn = ["Sr No", "Enrollment No", "Full Name", "Photo", "Mobile", "Attendance", "Exam Status"];
      const tableRows = students.map((stu, index) => [
        index + 1,
        stu.enrollmentNumber || 'N/A',
        stu.name || 'Unknown',
        '', // Image placeholder
        stu.mobileNumber || 'N/A',
        '',  // Attendance placeholder
        ''   // Status placeholder
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 15,
        bodyStyles: { minCellHeight: 18, valign: 'middle' },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 3) {
            data.cell.text = [];
          }
          if (data.section === 'body' && data.column.index === 5) {
            data.cell.text = [];
          }
          if (data.section === 'body' && data.column.index === 6) {
            data.cell.text = [];
          }
        },
        didDrawCell: function (data) {
          if (data.section === 'body' && data.column.index === 3) {
             const base64Img = students[data.row.index]?.photo;
             if (base64Img && base64Img.startsWith('data:image')) {
                const format = base64Img.includes('png') ? 'PNG' : 'JPEG';
                try {
                  doc.addImage(base64Img, format, data.cell.x + 2, data.cell.y + 2, 14, 14);
                } catch(e) { console.error('Image add error', e); }
             } else {
                doc.setFontSize(8);
                doc.text("No Pic", data.cell.x + 2, data.cell.y + 10);
                doc.setFontSize(10);
             }
          }
          if (data.section === 'body' && data.column.index === 5) {
             const percentStr = students[data.row.index]?.attendancePercentage || '0.00';
             const percent = parseFloat(percentStr);
             const text = `${percentStr}%`;
             
             // Set color based on 75% rule
             if (percent >= 75) {
               doc.setTextColor(0, 128, 0); // Green
               doc.setDrawColor(0, 128, 0);
             } else {
               doc.setTextColor(200, 0, 0); // Red
               doc.setDrawColor(200, 0, 0);
             }

             doc.setFont("helvetica", "bold");
             const textWidth = doc.getTextWidth(text);
             const x = data.cell.x + 4;
             const y = data.cell.y + (data.cell.height / 2);
             // Draw Box
             doc.setLineWidth(0.5);
             doc.rect(x - 2, y - 5, textWidth + 4, 7);
             doc.text(text, x, y);
             
             // Reset back to normal for next drawing
             doc.setFont("helvetica", "normal");
             doc.setTextColor(0, 0, 0);
             doc.setDrawColor(0, 0, 0);
          }
          if (data.section === 'body' && data.column.index === 6) {
             const percent = parseFloat(students[data.row.index]?.attendancePercentage || '0');
             const isEligible = percent >= 75;
             const text = isEligible ? 'Eligible' : 'Not Eligible';
             
             if (isEligible) {
               doc.setTextColor(0, 128, 0); // Green
             } else {
               doc.setTextColor(200, 0, 0); // Red
             }
             doc.setFont("helvetica", "bold");
             doc.text(text, data.cell.x + 4, data.cell.y + (data.cell.height / 2));
             
             doc.setFont("helvetica", "normal");
             doc.setTextColor(0, 0, 0);
          }
        }
      });
      
      doc.save(`Attendance_Summary_${reportBranch}_Sem${reportSemester}_Batch${reportBatch}.pdf`);
    } catch(err) {
      console.error(err);
      alert('Failed to export PDF: ' + (err.response?.data?.message || err.message || err.toString()));
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/users', { headers: { 'x-auth-token': token } });
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFacultyCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/admin/faculty-codes', { headers: { 'x-auth-token': token } });
      setFacultyCodes(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLocationConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://smart-geolocation-attendance-system.onrender.com/api/admin/config/location', { headers: { 'x-auth-token': token } });
      if (res.data) setLocationConfig(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/admin/config/location', locationConfig, { headers: { 'x-auth-token': token } });
      alert('College Location updated successfully!');
      fetchLocationConfig();
    } catch (err) { alert('Failed to update location'); }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocationConfig({ ...locationConfig, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }, () => alert("Could not fetch location"));
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/admin/generate-faculty-code', newFaculty, { headers: { 'x-auth-token': token } });
      alert('Faculty Code generated successfully!');
      setNewFaculty({ facultyName: '', subjectName: '', subjectCode: '' });
      fetchFacultyCodes();
    } catch (err) { alert(err.response?.data?.message || 'Error generating code'); }
  };

  const handleDeleteCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty code?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://smart-geolocation-attendance-system.onrender.com/api/admin/faculty-codes/${id}`, { headers: { 'x-auth-token': token } });
      alert('Faculty Code deleted successfully!');
      fetchFacultyCodes();
    } catch (err) { alert('Failed to delete code'); }
  };

  const handleAddAllowedEnrollments = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/admin/allow-enrollments', 
        { 
          branch: allowBranch, 
          fullName: allowFullName,
          enrollmentNumber: allowEnrollmentNumber,
          mobileNumber1: allowMobileNumber1,
          mobileNumber2: allowMobileNumber2
        },
        { headers: { 'x-auth-token': token } }
      );
      alert(res.data.message);
      setAllowFullName('');
      setAllowEnrollmentNumber('');
      setAllowMobileNumber1('');
      setAllowMobileNumber2('');
      fetchAllowedEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding enrollment');
    }
  };

  const handleDeleteAllowedEnrollments = async (ids) => {
    if(!window.confirm(`Are you sure you want to delete ${ids.length} enrollments?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete('https://smart-geolocation-attendance-system.onrender.com/api/admin/allow-enrollments', {
        headers: { 'x-auth-token': token },
        data: { ids }
      });
      fetchAllowedEnrollments();
      setSelectedEnrollmentIds([]);
    } catch (err) {
      alert('Error deleting enrollments');
    }
  };

  const handleToggleSelectEnrollment = (id) => {
    setSelectedEnrollmentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/users/add', newStudent, { headers: { 'x-auth-token': token } });
      alert('Student added successfully!');
      setNewStudent({ name: '', enrollmentNumber: '', email: '', mobileNumber: '', branch: '', semester: '', batch: '' });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Error adding student'); }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to permanently delete the student: ${studentName}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://smart-geolocation-attendance-system.onrender.com/api/users/${studentId}`, { headers: { 'x-auth-token': token } });
        alert(`${studentName} has been deleted successfully.`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to update the email for Enrollment Number ${updateEnrollment}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`https://smart-geolocation-attendance-system.onrender.com/api/admin/student-email`, { enrollmentNumber: updateEnrollment, newEmail }, { headers: { 'x-auth-token': token } });
      setUpdateMsg({ text: res.data.message, type: 'success' });
      setUpdateEnrollment('');
      setNewEmail('');
      fetchUsers();
    } catch (err) { 
      setUpdateMsg({ text: err.response?.data?.message || 'Failed to update email', type: 'error' });
    }
  };

  const handleGrantLongLeave = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to grant official leave to ${leaveData.enrollmentNumber} from ${leaveData.startDate} to ${leaveData.endDate}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://smart-geolocation-attendance-system.onrender.com/api/attendance/grant-long-leave', leaveData, { headers: { 'x-auth-token': token } });
      setLeaveMsg({ text: res.data.message, type: 'success' });
      setLeaveData({ enrollmentNumber: '', startDate: '', endDate: '', document: '' });
      fetchStudents();
    } catch (err) {
      setLeaveMsg({ text: err.response?.data?.message || 'Failed to grant leave', type: 'error' });
    }
  };

  const handleGrantEmergency = async (studentId, studentName) => {
    const today = new Date().toISOString().split('T')[0];
    const confirmLeave = window.confirm(`Grant Emergency Leave for ${studentName} for today (${today})? This will bypass the strict full-day attendance rule for them today.`);
    if (!confirmLeave) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`https://smart-geolocation-attendance-system.onrender.com/api/attendance/grant-emergency`, 
        { studentId, date: today }, 
        { headers: { 'x-auth-token': token } }
      );
      alert(res.data.message);
      // Update local state to disable button
      setStudents(prev => prev.map(s => {
        if (s._id === studentId) {
          return { ...s, emergencyLeaves: [...(s.emergencyLeaves || []), today] };
        }
        return s;
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

  const filteredStudents = students.filter(stu => {
    const matchName = searchName === '' || stu.name.toLowerCase().includes(searchName.toLowerCase()) || stu.enrollmentNumber.includes(searchName);
    const matchBranch = searchBranch === '' || stu.branch === searchBranch;
    const matchSem = searchSemester === '' || stu.semester?.toString() === searchSemester;
    const matchBatch = searchBatch === '' || stu.batch === searchBatch;
    return matchName && matchBranch && matchSem && matchBatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Apollo Logo" className="w-14 h-14 object-contain rounded-xl shadow-sm border border-gray-100 p-1" />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Apollo Institute of <br className="hidden sm:block"/>Engineering and Technology</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <h2 className="text-sm font-bold text-gray-800">Super Admin Head</h2>
              <p className="text-xs text-gray-500">System Dashboard</p>
            </div>
            <button onClick={logout} className="btn-danger text-sm whitespace-nowrap shadow-sm">Logout</button>
          </div>
        </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setView('faculties')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'faculties' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              <span className="text-sm text-center">Faculty Codes</span>
            </button>
            <button onClick={() => setView('timetable')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'timetable' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              <span className="text-sm text-center">Timetable</span>
            </button>
            <button onClick={() => setView('location')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'location' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              <span className="text-sm text-center">College Location</span>
            </button>
            <button onClick={() => setView('students')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'students' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
              <span className="text-sm text-center">Students</span>
            </button>
            <button onClick={() => setView('enrollments')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'enrollments' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
              <span className="text-sm text-center">Enrollments</span>
            </button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${view === 'history' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              <span className="text-sm text-center">PDF Reports</span>
            </button>
          </div>



        {view === 'enrollments' && (
          <div className="card shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5 mb-6">
              <div className="p-3 bg-brand-50 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage Allowed Enrollments</h2>
                <p className="text-sm text-gray-500 mt-1">Pre-authorize student enrollment numbers for registration</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-800 text-lg">Add New Enrollments</h3>
              </div>
              <form onSubmit={handleAddAllowedEnrollments} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Branch</label>
                    <select 
                      value={allowBranch} 
                      onChange={e => setAllowBranch(e.target.value)} 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm transition-all outline-none"
                    >
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="AIDS">AIDS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={allowFullName} 
                      onChange={e => setAllowFullName(e.target.value)} 
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white shadow-sm outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment Number</label>
                    <input 
                      type="text"
                      value={allowEnrollmentNumber} 
                      onChange={e => setAllowEnrollmentNumber(e.target.value)} 
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white shadow-sm outline-none"
                      placeholder="e.g. 210103100000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number 1</label>
                    <input 
                      type="text"
                      value={allowMobileNumber1} 
                      onChange={e => setAllowMobileNumber1(e.target.value)} 
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white shadow-sm outline-none"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number 2 (Optional)</label>
                    <input 
                      type="text"
                      value={allowMobileNumber2} 
                      onChange={e => setAllowMobileNumber2(e.target.value)} 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white shadow-sm outline-none"
                      placeholder="e.g. 9876543211"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-brand-700 transition-all flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Add Enrollments
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-800">Existing Allowed Enrollments <span className="bg-brand-100 text-brand-700 py-0.5 px-2.5 rounded-full text-xs ml-2">{allowedEnrollments.length}</span></h3>
                </div>
                {selectedEnrollmentIds.length > 0 && (
                  <button onClick={() => handleDeleteAllowedEnrollments(selectedEnrollmentIds)} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedEnrollmentIds.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                      <th className="p-4 text-center w-16">
                        <input type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.checked) setSelectedEnrollmentIds(allowedEnrollments.map(ae => ae._id));
                            else setSelectedEnrollmentIds([]);
                          }} 
                          checked={allowedEnrollments.length > 0 && selectedEnrollmentIds.length === allowedEnrollments.length}
                        />
                      </th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Enrollment Number</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Full Name</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Branch</th>
                      <th className="p-4 font-semibold uppercase tracking-wider">Mobile(s)</th>
                      <th className="p-4 font-semibold text-right uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allowedEnrollments.map(ae => (
                      <tr key={ae._id} className={`hover:bg-brand-50/50 transition-colors ${selectedEnrollmentIds.includes(ae._id) ? 'bg-brand-50/30' : ''}`}>
                        <td className="p-4 text-center">
                          <input type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={selectedEnrollmentIds.includes(ae._id)} 
                            onChange={() => handleToggleSelectEnrollment(ae._id)}
                          />
                        </td>
                        <td className="p-4 font-medium text-gray-900">{ae.enrollmentNumber}</td>
                        <td className="p-4 text-gray-700">{ae.fullName}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {ae.branch}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700 text-sm">
                          <div>{ae.mobileNumber1}</div>
                          {ae.mobileNumber2 && <div>{ae.mobileNumber2}</div>}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteAllowedEnrollments([ae._id])} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allowedEnrollments.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <ShieldCheck className="w-12 h-12 text-gray-300" />
                            <p className="text-lg">No enrollments added yet</p>
                            <p className="text-sm text-gray-400">Pre-authorize enrollments above to let students register.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:justify-end md:items-center border-b pb-4 mb-4 gap-4">
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border">
                <span className="text-sm font-medium text-gray-700 ml-1">PDF Report:</span>
                <select value={reportBranch} onChange={e=>setReportBranch(e.target.value)} className="input-field py-1 text-sm min-w-[120px]">
                  <option value="">Select Branch</option>
                  <option value="Computer Engineering">Computer</option>
                  <option value="Information Technology">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                </select>
                <select value={reportSemester} onChange={e=>setReportSemester(e.target.value)} className="input-field py-1 text-sm min-w-[100px]">
                  <option value="">Select Sem</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
                <select value={reportBatch} onChange={e=>setReportBatch(e.target.value)} className="input-field py-1 text-sm min-w-[100px]">
                  <option value="">Select Batch</option>
                  <option value="A">Batch A</option>
                  <option value="B">Batch B</option>
                  <option value="C">Batch C</option>
                </select>
                <button onClick={handleExportPDF} className="btn-danger text-sm shadow-sm py-1.5 px-4 ml-2 flex items-center gap-1.5">
                  <FileText size={16} /> Download PDF
                </button>
              </div>
            </div>
            

          </div>
        )}

        {view === 'students' && (
          <div className="card space-y-8">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b pb-2 gap-4">
                <h3 className="text-lg font-bold text-gray-800">Registered Students List</h3>
                
                {/* Search Filters */}
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="text" 
                    placeholder="Search Name/Enrollment..." 
                    value={searchName} 
                    onChange={e => setSearchName(e.target.value)} 
                    className="input-field py-1.5 text-sm w-full md:w-auto"
                  />
                  <select value={searchBranch} onChange={e=>setSearchBranch(e.target.value)} className="input-field py-1.5 text-sm w-full md:w-auto min-w-[120px]">
                    <option value="">All Branches</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AIDS">AIDS</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                  <select value={searchSemester} onChange={e=>setSearchSemester(e.target.value)} className="input-field py-1.5 text-sm w-full md:w-auto min-w-[100px]">
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                  <select value={searchBatch} onChange={e=>setSearchBatch(e.target.value)} className="input-field py-1.5 text-sm w-full md:w-auto min-w-[100px]">
                    <option value="">All Batches</option>
                    <option value="A">Batch A</option>
                    <option value="B">Batch B</option>
                    <option value="C">Batch C</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                      <th className="p-3 border-b font-medium rounded-tl-lg">Sr No</th>
                      <th className="p-3 border-b font-medium">Branch</th>
                      <th className="p-3 border-b font-medium">Sem</th>
                      <th className="p-3 border-b font-medium">Batch</th>
                      <th className="p-3 border-b font-medium">Enrollment No</th>
                      <th className="p-3 border-b font-medium">Name</th>
                      <th className="p-3 border-b font-medium">Mobile No</th>
                      <th className="p-3 border-b font-medium">Email</th>
                      <th className="p-3 border-b font-medium rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((stu, index) => (
                      <tr key={stu._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="p-3 text-sm text-gray-700">{stu.branch}</td>
                        <td className="p-3 text-sm text-gray-700">Sem {stu.semester}</td>
                        <td className="p-3 text-sm text-gray-700">{stu.batch || 'N/A'}</td>
                        <td className="p-3 text-sm font-bold text-gray-700">{stu.enrollmentNumber}</td>
                        <td className="p-3 text-sm text-gray-700">{stu.name}</td>
                        <td className="p-3 text-sm text-gray-700">{stu.mobileNumber || 'N/A'}</td>
                        <td className="p-3 text-sm text-gray-500">{stu.email}</td>
                        <td className="p-3 text-sm text-center flex flex-col gap-2">
                          {(() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            const hasLeave = stu.emergencyLeaves && stu.emergencyLeaves.includes(todayStr);
                            return (
                              <button 
                                onClick={() => !hasLeave && handleGrantEmergency(stu._id, stu.name)} 
                                disabled={hasLeave}
                                className={hasLeave
                                  ? "bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap cursor-not-allowed"
                                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-medium text-xs transition whitespace-nowrap"
                                }
                              >
                                {hasLeave ? "Granted" : "Emergency Leave"}
                              </button>
                            );
                          })()}
                          {stu.officialLeaves && stu.officialLeaves.length > 0 && (
                            <button 
                              onClick={() => {
                                // For simplicity right now we can open the latest document in a new tab
                                const latest = stu.officialLeaves[stu.officialLeaves.length - 1];
                                const win = window.open();
                                win.document.write(`<iframe src="${latest.document}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium text-xs transition whitespace-nowrap"
                            >
                              View Official Leaves ({stu.officialLeaves.length})
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && <p className="text-center py-6 text-gray-500">No students found matching the criteria.</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Update Student Email</h3>
              <p className="text-sm text-gray-500 mb-6">If a student has lost access to their registered email, enter their enrollment number and a new email address. This will preserve their attendance records.</p>
            
            {updateMsg.text && (
              <div className={`p-4 rounded-xl text-sm font-medium mb-6 border ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
                <input 
                  type="text" 
                  required 
                  value={updateEnrollment} 
                  onChange={e => setUpdateEnrollment(e.target.value)} 
                  className="input-field" 
                  placeholder="e.g. 210103100..." 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  className="input-field" 
                  placeholder="e.g. newemail@example.com" 
                />
              </div>
              
              <button type="submit" className="btn-success w-full mt-2">Update Email Address</button>
            </form>
            </div>
            
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Grant Official Long Leave (HOD Approved)</h3>
              <p className="text-sm text-gray-500 mb-6">If a student has submitted an official application signed by the HOD for multiple days of leave (1 day, 1 week, etc.), select the date range below. Their attendance will be granted +1.5% for these days automatically.</p>
            
              {leaveMsg.text && (
                <div className={`p-4 rounded-xl text-sm font-medium mb-6 border ${leaveMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {leaveMsg.text}
                </div>
              )}

              <form onSubmit={handleGrantLongLeave} className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
                  <input 
                    type="text" 
                    required 
                    value={leaveData.enrollmentNumber} 
                    onChange={e => setLeaveData({...leaveData, enrollmentNumber: e.target.value})} 
                    className="input-field" 
                    placeholder="e.g. 210103100..." 
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={leaveData.startDate} 
                      onChange={e => setLeaveData({...leaveData, startDate: e.target.value})} 
                      className="input-field" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={leaveData.endDate} 
                      onChange={e => setLeaveData({...leaveData, endDate: e.target.value})} 
                      className="input-field" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Approved Letter (Image/PDF)</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    required
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert('File size must be less than 2MB');
                          e.target.value = '';
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLeaveData({...leaveData, document: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>
                
                <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-600 transition w-full mt-2">Approve Official Leave</button>
              </form>
            </div>

          </div>
        )}

        {view === 'timetable' && <TimetableManager />}

        {view === 'location' && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Configure GPS Attendance Bounds</h3>
            <p className="text-sm text-gray-500 mb-6">Set the center coordinate (latitude, longitude) and radius (in meters) for valid attendance marking.</p>
            
            <form onSubmit={handleUpdateLocation} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" step="any" required value={locationConfig.latitude} onChange={e => setLocationConfig({...locationConfig, latitude: e.target.value})} className="input-field" placeholder="e.g. 23.0225" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" step="any" required value={locationConfig.longitude} onChange={e => setLocationConfig({...locationConfig, longitude: e.target.value})} className="input-field" placeholder="e.g. 72.5714" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (Meters)</label>
                <input type="number" required value={locationConfig.radius} onChange={e => setLocationConfig({...locationConfig, radius: e.target.value})} className="input-field" placeholder="e.g. 100" />
              </div>
              
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={handleGetCurrentLocation} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-gray-300 transition">Get My Location</button>
                <button type="submit" className="flex-1 btn-success">Save Location</button>
              </div>
            </form>
          </div>
        )}

        {view === 'faculties' && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Generate 10-Digit Code for New Faculty</h3>
            <form onSubmit={handleGenerateCode} className="flex flex-wrap gap-4 mb-8">
              <input type="text" placeholder="Faculty Name" required value={newFaculty.facultyName} onChange={e => setNewFaculty({...newFaculty, facultyName: e.target.value})} className="input-field flex-1 min-w-[200px]" />
              <input type="text" placeholder="Subject Name (e.g. Web Prog.)" required value={newFaculty.subjectName} onChange={e => setNewFaculty({...newFaculty, subjectName: e.target.value})} className="input-field flex-1 min-w-[200px]" />
              <input type="text" placeholder="Subject Code (e.g. 3170702)" required value={newFaculty.subjectCode} onChange={e => setNewFaculty({...newFaculty, subjectCode: e.target.value})} className="input-field flex-1 min-w-[200px]" />
              <button type="submit" className="btn-success">Generate Code</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium rounded-tl-lg">10-Digit Code</th>
                    <th className="p-3 border-b font-medium">Faculty Name</th>
                    <th className="p-3 border-b font-medium">Subject</th>
                    <th className="p-3 border-b font-medium">Code</th>
                    <th className="p-3 border-b font-medium">Status</th>
                    <th className="p-3 border-b font-medium rounded-tr-lg text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facultyCodes.map((fc) => (
                    <tr key={fc._id} className="hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-blue-600 font-bold">{fc.code}</td>
                      <td className="p-3 text-sm text-gray-700">{fc.facultyName}</td>
                      <td className="p-3 text-sm text-gray-700">{fc.subjectName}</td>
                      <td className="p-3 text-sm text-gray-700">{fc.subjectCode}</td>
                      <td className="p-3 text-sm">
                        {fc.isUsed 
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Registered</span> 
                          : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>}
                      </td>
                      <td className="p-3 text-sm text-center">
                        <button onClick={() => handleDeleteCode(fc._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {facultyCodes.length === 0 && <p className="text-center py-4 text-gray-500">No codes generated yet.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HeadDashboard;
