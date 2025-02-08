import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database, auth } from '../firebase';
import { Timer, AlertCircle, CheckCircle, XCircle, Trophy, ArrowRight, Home } from 'lucide-react';

function QuizGame() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [totalTimeLeft, setTotalTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quiz details
        const quizRef = ref(database, `quizzes/${quizId}`);
        const quizSnapshot = await get(quizRef);
        
        if (!quizSnapshot.exists()) {
          throw new Error('Quiz not found');
        }

        const quizData = quizSnapshot.val();
        setQuiz(quizData);

        // Fetch quiz questions from the provided API
        const response = await fetch('https://education-quiz-app-default-rtdb.firebaseio.com/quizQuestions.json');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const questionsData = await response.json();
        
        // Find the questions for this specific quiz
        const quizQuestions = questionsData[quizId] || [];
        if (!quizQuestions.length) {
          throw new Error('No questions found for this quiz');
        }

        setQuestions(quizQuestions);
        setTimeLeft(quizQuestions[0].timeLimit);
        setTotalTimeLeft(parseInt(quizData.timeLimit) * 60); // Convert minutes to seconds
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (totalTimeLeft === null || showResult) return;

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalTimeLeft, showResult]);

  useEffect(() => {
    if (timeLeft === null || showResult || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswerTimeout();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult, selectedAnswer]);

  const handleAnswerTimeout = () => {
    if (!questions[currentQuestionIndex]) return;
    
    setFeedback({
      type: 'timeout',
      message: 'Time\'s up! Moving to next question...'
    });
    setAnsweredQuestions([...answeredQuestions, {
      question: questions[currentQuestionIndex].question,
      selectedAnswer: null,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect: false,
      timeout: true
    }]);
    setTimeout(handleNextQuestion, 1500);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || !questions[currentQuestionIndex]) return;
    
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback({
        type: 'correct',
        message: 'Correct! Well done!'
      });
    } else {
      setFeedback({
        type: 'incorrect',
        message: 'Incorrect! The correct answer is highlighted.'
      });
    }

    setAnsweredQuestions([...answeredQuestions, {
      question: questions[currentQuestionIndex].question,
      selectedAnswer: answerIndex,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect,
      timeout: false
    }]);

    setTimeout(handleNextQuestion, 2000);
  };

  const handleQuizComplete = async () => {
    const user = auth.currentUser;
    if (!user || !quiz) return;

    const studentRef = ref(database, `students/${user.uid}`);
    const quizResultRef = ref(database, `quizResults/${quizId}/${user.uid}`);
    
    const result = {
      score,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString(),
      studentName: user.displayName || 'Anonymous',
      timeTaken: quiz.timeLimit * 60 - totalTimeLeft
    };

    try {
      await Promise.all([
        update(studentRef, {
          points: (score * parseInt(quiz.points || 0)),
          quizzesCompleted: (prev) => (prev || 0) + 1,
          [`completedQuizzes/${quizId}`]: result
        }),
        update(quizResultRef, result)
      ]);
    } catch (error) {
      console.error('Error saving results:', error);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      handleQuizComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentQuestionIndex + 1]?.timeLimit || 30);
      setFeedback(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full shadow-xl border border-red-500/20 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Error Loading Quiz</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const earnedPoints = score * parseInt(quiz?.points || 0);

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 max-w-3xl w-full shadow-xl border border-teal-500/20">
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-teal-400 mb-1">{percentage}%</p>
                <p className="text-gray-400">Score</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-yellow-400 mb-1">{earnedPoints}</p>
                <p className="text-gray-400">Points Earned</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {answeredQuestions.map((answer, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-white mb-2">
                  <span className="text-gray-400">Q{index + 1}.</span> {answer.question}
                </p>
                <div className="flex items-center">
                  {answer.timeout ? (
                    <Timer className="h-5 w-5 text-yellow-400 mr-2" />
                  ) : answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  )}
                  <p className={`text-sm ${
                    answer.timeout ? 'text-yellow-400' : 
                    answer.isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {answer.timeout ? 'Time Out' : 
                     answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 max-w-3xl w-full shadow-xl border border-teal-500/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">{quiz?.title}</h2>
            <p className="text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <Timer className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white font-mono">{formatTime(totalTimeLeft)}</span>
            </div>
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <Trophy className="h-5 w-5 text-teal-400 mr-2" />
              <span className="text-white font-mono">{score}/{questions.length}</span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-lg ${
            feedback.type === 'correct' ? 'bg-green-500/20 text-green-400' :
            feedback.type === 'incorrect' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xl text-white">{currentQuestion.question}</p>
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-lg">
              <Timer className="h-4 w-4 text-teal-400 mr-2" />
              <span className="text-white font-mono">{timeLeft}s</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedAnswer === null
                    ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-[1.02]'
                    : selectedAnswer === index
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white scale-[1.02]'
                      : 'bg-red-500 text-white'
                    : index === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white scale-[1.02]'
                    : 'bg-gray-700 text-white opacity-50'
                }`}
              >
                <span className="text-sm text-gray-400 block mb-1">Option {index + 1}</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-gray-400">Select your answer before time runs out</p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-gray-400">Points per question:</p>
            <span className="text-teal-400 font-bold">{quiz?.points || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizGame;