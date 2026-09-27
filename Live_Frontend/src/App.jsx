import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import HeadDashboard from './pages/HeadDashboard';

function App() {
  // Simple check for auth (In a real app, use Context/Redux)
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" />} />
          <Route path="/register" element={<Navigate to="/auth" />} />
          
          <Route 
            path="/student-dashboard" 
            element={isAuthenticated && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/faculty-dashboard" 
            element={isAuthenticated && user.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/head-dashboard" 
            element={isAuthenticated && user.role === 'superadmin' ? <HeadDashboard /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to={isAuthenticated ? (user.role === 'superadmin' ? "/head-dashboard" : (user.role === 'faculty' ? "/faculty-dashboard" : "/student-dashboard")) : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
