import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../firebase';
import { Trophy, BookOpen, Award, LogOut, Crown, History } from 'lucide-react';
import Quiz from './Quiz';

function StudentDashboard() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch student data
      const studentRef = ref(database, `students/${user.uid}`);
      onValue(studentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudentData(data);
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
    });

    return () => unsubscribe();
  }, [navigate]);

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
          className="text-gray-400 hover:text-white"
        >
          Back to Quiz
        </button>
      </div>
      <div className="space-y-4">
        {history.map((quiz, index) => (
          <div key={index} className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">
                {new Date(quiz.date).toLocaleDateString()}
              </span>
              <span className="text-purple-400 font-bold">
                {quiz.points} points
              </span>
            </div>
            <div className="text-gray-300">
              Score: {quiz.score}/{quiz.totalQuestions}
            </div>
          </div>
        )).reverse()}
      </div>
    </div>
  );

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800/50 backdrop-blur-sm shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-teal-400" />
              <span className="ml-3 text-xl font-semibold text-white">EduQuiz</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-teal-500"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=random`}
                  alt={studentData.name}
                />
                <span className="ml-2 text-white">{studentData.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-white">{studentData.points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-teal-200" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Quizzes Completed</p>
                <p className="text-2xl font-bold text-white">{studentData.quizzesCompleted || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform hover:scale-105 transition-all">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-400" />
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
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center mb-6">
                <Crown className="h-6 w-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              </div>
              <div className="space-y-4">
                {leaderboard.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-center font-bold text-yellow-400">
                        #{index + 1}
                      </span>
                      <img
                        className="h-8 w-8 rounded-full ml-3"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          student.name
                        )}&background=random`}
                        alt={student.name}
                      />
                      <span className="ml-3 text-white">{student.name}</span>
                    </div>
                    <span className="text-teal-400 font-bold">{student.points || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="lg:col-span-2">
            {!showQuiz && !showHistory ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Available Quiz</h2>
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">General Knowledge Quiz</h3>
                  <p className="text-gray-300 mb-4">
                    Test your knowledge with this quick quiz! Complete it to earn points and climb the
                    leaderboard.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Start Quiz
                    </button>
                    <button
                      onClick={() => setShowHistory(true)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      View History
                    </button>
                  </div>
                </div>
              </div>
            ) : showHistory ? (
              <QuizHistory history={studentData.quizHistory} />
            ) : (
              <Quiz />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;