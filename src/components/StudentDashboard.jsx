import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../firebase';
import { Trophy, BookOpen, Award, LogOut, Crown, History, User, CheckCircle, BarChart, Timer, Star } from 'lucide-react';
import Profile from './Profile';
import ProgressReport from './ProgressReport';
import VocabularyGame from './VocabluryGame';
import QuizGame from './QuizGame';
import Quiz from './Quiz';

function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch student data including profile and interests
      const studentRef = ref(database, `students/${user.uid}`);
      onValue(studentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudentData({ ...data, uid: user.uid });
        }
      });

      // Fetch leaderboard data
      const studentsRef = ref(database, 'students');
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const students = Object.values(data);
          const sortedStudents = students.sort((a, b) => b.points - a.points).slice(0, 5);
          setLeaderboard(sortedStudents);
        }
      });

      // Fetch active quizzes from your database
      const quizRef = ref(database, 'quizzes');
      onValue(quizRef, (snapshot) => {
        if (snapshot.exists()) {
          const quizzes = [];
          snapshot.forEach((child) => {
            quizzes.push({
              id: child.key,
              ...child.val()
            });
          });
          setActiveQuizzes(quizzes);
        }
      });
    });

    return () => unsubscribe();
  }, [navigate]);

  // Map user interests to quiz categories
  const interestToCategory = {
    'Web Development': 'Linux',
    'DevOps': 'DevOps',
    'Cloud Computing': 'Cloud',
    'Programming Languages': 'Code',
    'Linux': 'Linux',
    'Networking': 'Networking',
    'Cybersecurity': 'Linux',
    'Mobile Development': 'Code',
    'Data Science': 'Code',
    'Artificial Intelligence': 'Code'
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const QuizHistory = ({ history = [] }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Quiz History</h2>
        </div>
        <button
          onClick={() => setShowHistory(false)}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          Back to Quizzes
        </button>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {history.map((quiz, index) => (
          <div key={index} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">
                {new Date(quiz.date).toLocaleDateString()}
              </span>
              <span className="text-purple-400 font-bold">
                {quiz.points} points
              </span>
            </div>
            <div className="text-gray-300">
              Score: {quiz.score}/{quiz.totalQuestions}
              {quiz.category && <span className="ml-2 text-teal-400">• {quiz.category}</span>}
            </div>
          </div>
        )).reverse()}
      </div>
    </div>
  );

  const MainContent = () => {
    const userInterests = studentData?.profile?.interests || [];
    const completedQuizzes = studentData?.completedQuizzes || {};

    const availableQuizzes = userInterests
      .filter(interest => interestToCategory[interest])
      .map(interest => ({
        interest,
        category: interestToCategory[interest],
        completed: completedQuizzes[interestToCategory[interest]]?.length || 0,
        bestScore: completedQuizzes[interestToCategory[interest]]?.reduce((max, quiz) =>
          Math.max(max, (quiz.score / quiz.totalQuestions) * 100), 0) || 0
      }));

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-white">{studentData.points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-teal-400/10 rounded-lg">
                <BookOpen className="h-8 w-8 text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Quizzes Completed</p>
                <p className="text-2xl font-bold text-white">{studentData.quizzesCompleted || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-400/10 rounded-lg">
                <Award className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Current Level</p>
                <p className="text-2xl font-bold text-white">
                  {Math.floor((studentData.points || 0) / 100) + 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 sticky top-24">
              <div className="flex items-center mb-6">
                <Crown className="h-6 w-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              </div>
              <div className="space-y-4">
                {leaderboard.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <span className={`w-6 text-center font-bold ${index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-amber-600' :
                              'text-gray-400'
                        }`}>
                        #{index + 1}
                      </span>
                      <div className="relative">
                        <img
                          className="h-10 w-10 rounded-full ml-3 border-2 border-purple-500/20"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.name
                          )}&background=random`}
                          alt={student.name}
                        />
                        {index < 3 && (
                          <Crown className={`h-4 w-4 absolute -top-1 -right-1 ${index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                                'text-amber-600'
                            }`} />
                        )}
                      </div>
                      <span className="ml-3 text-white font-medium truncate max-w-[120px]">
                        {student.name}
                      </span>
                    </div>
                    <span className="text-teal-400 font-bold">{student.points || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Sections */}
          <div className="lg:col-span-2 space-y-8">
            {!showHistory ? (
              <>
                <VocabularyGame />

                {/* Live Quizzes Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Timer className="h-6 w-6 text-blue-400 mr-2" />
                      <h2 className="text-xl font-bold text-white">Live Quizzes</h2>
                    </div>
                    <button
                      onClick={() => setShowHistory(true)}
                      className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeQuizzes.map((quiz) => (
                      <div key={quiz.id} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/40 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-white truncate pr-2">{quiz.title}</h3>
                          <span className="bg-purple-500/20 text-purple-300 text-xs font-medium px-3 py-1 rounded-full">
                            {quiz.category}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4 text-sm line-clamp-3">{quiz.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center">
                            <Timer className="h-4 w-4 mr-2 text-blue-400" />
                            {quiz.timeLimit} minutes
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-yellow-400" />
                            {quiz.points} points
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/quiz-game/${quiz.id}`)}
                          className="w-full bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center font-medium"
                        >
                          Start Quiz
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Based on Interest Quizzes Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Star className="h-6 w-6 text-yellow-400 mr-2" />
                      <h2 className="text-xl font-bold text-white">Based on Interest Quizzes</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableQuizzes.map(({ interest, category, completed, bestScore }) => (
                      <div key={interest} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/40 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-white">{interest}</h3>
                          {completed > 0 && (
                            <div className="flex items-center text-sm text-green-400">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {bestScore.toFixed(0)}% Best
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4 text-sm">
                          Test your knowledge in {interest}! {completed > 0 ? `Completed ${completed} times.` : 'Not attempted yet.'}
                        </p>
                        <button
                          onClick={() => navigate(`/quiz/${category}`)}
                          className="w-full bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center font-medium"
                        >
                          {completed > 0 ? 'Retake Quiz' : 'Start Quiz'}
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <QuizHistory history={studentData.quizHistory} />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-teal-400" />
                <span className="text-xl font-semibold text-white">EduQuiz</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setShowPanel(!showPanel)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <img
                    className="h-8 w-8 rounded-full ring-2 ring-teal-500"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=random`}
                    alt={studentData.name}
                  />
                  <span className="text-white font-medium">{studentData.name}</span>
                </button>

                {showPanel && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5 border border-purple-500/20">
                    <button
                      onClick={() => {
                        navigate('/student-dashboard/profile');
                        setShowPanel(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${location.pathname.includes('/profile')
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } transition-colors duration-200`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/student-dashboard');
                        setShowPanel(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${location.pathname === '/student-dashboard'
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } transition-colors duration-200`}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/student-dashboard/progress');
                        setShowPanel(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm ${location.pathname.includes('/progress')
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } transition-colors duration-200`}
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      Progress Report
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/profile" element={<Profile studentId={studentData.uid} studentData={studentData} />} />
          <Route path="/progress" element={<ProgressReport studentId={studentData.uid} />} />
          <Route path="/quiz-game/:quizId" element={<QuizGame />} />
          <Route path="/quiz/:category" element={<Quiz />} />
          <Route path="/" element={<MainContent />} />
        </Routes>
      </div>
    </div>
  );
}

export default StudentDashboard;