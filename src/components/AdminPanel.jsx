import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, onValue } from 'firebase/database';
import { database } from '../firebase';
import { BookOpen, Plus, Settings, LogOut, BookOpenCheck, Layers, Award } from 'lucide-react';

function AdminPanel() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    category: '',
    points: '',
    numberOfQuestions: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState([]);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }

    const quizzesRef = ref(database, 'quizzes');
    onValue(quizzesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const quizzesList = Object.entries(data).map(([id, quiz]) => ({
          id,
          ...quiz
        }));
        setActiveQuizzes(quizzesList);
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quizRef = ref(database, 'quizzes');
      const newQuizRef = push(quizRef);
      
      await set(newQuizRef, {
        ...quizData,
        createdAt: new Date().toISOString(),
        active: true
      });

      setQuizData({
        title: '',
        category: '',
        points: '',
        numberOfQuestions: ''
      });

      alert('Quiz created successfully!');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Main content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-gray-900/20 backdrop-blur-lg">
        <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <BookOpenCheck className="h-8 w-8 text-teal-400" />
                <span className="ml-2 text-xl font-semibold text-white">Quiz Master Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center mb-6">
              <Plus className="h-6 w-6 text-teal-400 mr-2" />
              <h2 className="text-2xl font-bold text-white">Create New Quiz</h2>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                    value={quizData.category}
                    onChange={(e) => setQuizData({ ...quizData, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                    value={quizData.points}
                    onChange={(e) => setQuizData({ ...quizData, points: e.target.value })}
                    placeholder="Enter points"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                    value={quizData.numberOfQuestions}
                    onChange={(e) => setQuizData({ ...quizData, numberOfQuestions: e.target.value })}
                    placeholder="Enter number of questions"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <Layers className="h-6 w-6 text-teal-400 mr-2" />
              <h2 className="text-2xl font-bold text-white">Active Quizzes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-black/40 rounded-lg p-6 border border-white/10 hover:border-teal-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                  <h3 className="text-lg font-semibold text-white mb-3">{quiz.title}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-teal-400" />
                      Category: {quiz.category}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-teal-400" />
                      Points: {quiz.points}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-teal-400" />
                      Questions: {quiz.numberOfQuestions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;