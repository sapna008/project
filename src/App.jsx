import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import StudentDashboard from './components/StudentDashboard';
import ParticlesComponent from './components/Particle';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Quiz from './components/Quiz';
import QuizGame from './components/QuizGame';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';

// Wrapper component to handle navbar visibility
function AppContent() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {location.pathname === '/' && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <ParticlesComponent id="particles" className="absolute inset-0 z-0" theme={theme} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/student-dashboard/*" element={<StudentDashboard />} />
        <Route path="/quiz/:category" element={<Quiz />} />
        <Route path="/quiz-game/:quizId" element={<QuizGame />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;