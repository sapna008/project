import React, { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { database, auth } from '../firebase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { Trophy, Clock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const Quiz = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');

  const API_KEY = 'dVk4yfdQ21ZdXjt6Ayf6uwENthztAKSUnBcqlyPM';

  useEffect(() => {
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    setQuizTitle(title);
    fetchQuestions();
  }, [category]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL('https://quizapi.io/api/v1/questions');
      
      const params = {
        apiKey: API_KEY,
        limit: 10,
        category: category.toLowerCase(),
        difficulty: 'easy'
      };
      
      url.search = new URLSearchParams(params).toString();
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error(`No questions found for category: ${category}`);
      }
      
      const formattedQuestions = data.map(q => ({
        question: q.question,
        options: Object.entries(q.answers)
          .filter(([_, value]) => value !== null)
          .map(([_, value]) => value),
        correctAnswers: Object.entries(q.correct_answers)
          .filter(([key, value]) => value === 'true')
          .map(([key, _]) => q.answers[key.replace('_correct', '')])
      }));
      
      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && !loading) {
      handleQuizEnd();
    }
  }, [timeLeft, showResult, loading]);

  const handleAnswer = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correct = questions[currentQuestion].correctAnswers.includes(selectedOption);
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
      } else {
        handleQuizEnd();
      }
    }, 1000);
  };

  const handleQuizEnd = async () => {
    setShowResult(true);
    setShowConfetti(true);
    
    if (auth.currentUser) {
      const userRef = ref(database, `students/${auth.currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      
      const points = score * 10;
      const updatedQuizzes = (userData.quizzesCompleted || 0) + 1;
      const updatedPoints = (userData.points || 0) + points;

      const quizHistory = userData.quizHistory || [];
      const quizResult = {
        date: new Date().toISOString(),
        score,
        totalQuestions: questions.length,
        points,
        category: quizTitle
      };
      quizHistory.push(quizResult);

      const completedQuizzes = userData.completedQuizzes || {};
      if (!completedQuizzes[category]) {
        completedQuizzes[category] = [];
      }
      completedQuizzes[category].push(quizResult);

      await update(userRef, {
        points: updatedPoints,
        quizzesCompleted: updatedQuizzes,
        quizHistory: quizHistory,
        completedQuizzes: completedQuizzes
      });

      setTimeout(() => {
        navigate('/student-dashboard');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="relative z-10 min-h-[400px] bg-gray-800/90 p-8 rounded-xl shadow-xl flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading {quizTitle} quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="relative z-10 min-h-[400px] bg-gray-800/90 p-8 rounded-xl shadow-xl flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">Error loading quiz: {error}</p>
            <button 
              onClick={fetchQuestions} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>No questions available for this category. Please try another.</p>
          <button 
            onClick={() => navigate('/student-dashboard')} 
            className="mt-4 px-4 py-2 bg-blue-500 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-2xl bg-gray-800/90 p-8 rounded-xl shadow-xl">
          {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
          <div className="text-center">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">Quiz Completed!</h2>
            <div className="w-40 h-40 mx-auto mb-6">
              <CircularProgressbar
                value={(score / questions.length) * 100}
                text={`${score}/${questions.length}`}
                styles={buildStyles({
                  pathColor: score === questions.length ? '#10B981' : `rgba(62, 152, 199, ${score / questions.length})`,
                  textColor: '#fff',
                  trailColor: '#2e3748'
                })}
              />
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-2xl text-gray-300">
                You earned <span className="text-yellow-400 font-bold">{score * 10} points</span>!
              </p>
              <p className="text-lg text-gray-400">
                Redirecting to dashboard in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="mb-6 flex items-center text-white hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="relative z-10 bg-gray-800/90 p-8 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">{quizTitle} Quiz</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">
                  Time Left: <span className="text-blue-400">{timeLeft}s</span>
                </span>
              </div>
              <div className="text-white font-medium">
                Question <span className="text-blue-400">{currentQuestion + 1}</span>/{questions.length}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl text-white font-medium mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }}>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg text-left transition-all transform hover:scale-105 ${
                    selectedAnswer === null
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : selectedAnswer === option
                      ? questions[currentQuestion].correctAnswers.includes(option)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : questions[currentQuestion].correctAnswers.includes(option) && selectedAnswer !== null
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                  dangerouslySetInnerHTML={{ __html: option }}
                />
              ))}
            </div>
          </div>

          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;