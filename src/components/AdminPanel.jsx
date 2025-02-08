import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { BookOpen, Plus, Settings, LogOut, BookOpenCheck, Layers, Award, Clock, AlertCircle } from 'lucide-react';
import AdminQuizEditor from './AdminQuizEditor';
import QuizResults from './QuizResults';

function AdminPanel() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    category: '',
    points: '',
    numberOfQuestions: '',
    timeLimit: '30',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showResults, setShowResults] = useState(false);

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
        numberOfQuestions: '',
        timeLimit: '30',
        description: ''
      });

      setSelectedQuiz(newQuizRef.key);
      alert('Quiz created successfully!');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await remove(ref(database, `quizzes/${quizId}`));
      await remove(ref(database, `quizQuestions/${quizId}`));
      setSelectedQuiz(null);
      setShowResults(false);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Error deleting quiz');
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Navigation */}
        <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedQuiz ? (
            <>
              {/* Create Quiz Form */}
              <div className="bg-black/20 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-8 border border-white/20 hover:border-teal-500/30 transition-all duration-300">
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
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                        value={quizData.points}
                        onChange={(e) => setQuizData({ ...quizData, points: e.target.value })}
                        placeholder="Enter points"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        required
                        min="30"
                        max="3600"
                        className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                        value={quizData.timeLimit}
                        onChange={(e) => setQuizData({ ...quizData, timeLimit: e.target.value })}
                        placeholder="Enter time limit"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      value={quizData.description}
                      onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                      placeholder="Enter quiz description"
                      rows="3"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:from-teal-400 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Creating Quiz...
                      </div>
                    ) : (
                      'Create Quiz'
                    )}
                  </button>
                </form>
              </div>

              {/* Active Quizzes Grid */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <Layers className="h-6 w-6 text-teal-400 mr-2" />
                  <h2 className="text-2xl font-bold text-white">Active Quizzes</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeQuizzes.map((quiz) => (
                    <div key={quiz.id} className="group bg-black/40 rounded-lg p-6 border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">{quiz.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-teal-400" />
                          {quiz.category}
                        </p>
                        <p className="text-sm text-gray-300 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-teal-400" />
                          {quiz.points} points
                        </p>
                        <p className="text-sm text-gray-300 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-teal-400" />
                          {quiz.timeLimit}s
                        </p>
                        <p className="text-sm text-gray-300 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-teal-400" />
                          {quiz.description}
                        </p>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedQuiz(quiz.id);
                            setShowResults(false);
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuiz(quiz.id);
                            setShowResults(true);
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-400 hover:to-indigo-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Results
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-400 hover:to-pink-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-black/30 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setShowResults(false);
                }}
                className="mb-6 text-gray-400 hover:text-white flex items-center group transition-all duration-200"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
                <span className="ml-2">Back to Quizzes</span>
              </button>
              
              {showResults ? (
                <QuizResults quizId={selectedQuiz} />
              ) : (
                <AdminQuizEditor quizId={selectedQuiz} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;