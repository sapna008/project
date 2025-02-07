import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import StudentDashboard from './components/StudentDashboard';
import ParticlesComponent from './components/Particle';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Quiz from './components/Quiz';

function App() {
  return (
    <Router>
      <ParticlesComponent id="particles" className="absolute inset-0 z-0" />
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/student-dashboard/*" element={<StudentDashboard />} />
        <Route path="/quiz/:category" element={<Quiz />} />
      </Routes>
    </Router>
    
  );
}

export default App;