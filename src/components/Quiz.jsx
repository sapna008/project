import React, { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { database, auth } from '../firebase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { Trophy, Clock, AlertCircle, Loader2 } from 'lucide-react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10');
      const data = await response.json();
      
      const formattedQuestions = data.results.map(q => ({
        question: q.question,
        options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        correctAnswer: q.correct_answer
      }));
      
      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
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
    const correct = selectedOption === questions[currentQuestion].correctAnswer;
    
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
      
      const points = score * 10; // 10 points per correct answer
      const updatedQuizzes = (userData.quizzesCompleted || 0) + 1;
      const updatedPoints = (userData.points || 0) + points;

      // Store quiz history
      const quizHistory = userData.quizHistory || [];
      quizHistory.push({
        date: new Date().toISOString(),
        score: score,
        totalQuestions: questions.length,
        points: points
      });

      await update(userRef, {
        points: updatedPoints,
        quizzesCompleted: updatedQuizzes,
        quizHistory: quizHistory
      });
    }
  };

  if (loading) {
    return (
      <div className="relative z-10 min-h-[400px] bg-gray-800/90 p-8 rounded-xl shadow-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="relative z-10 min-h-[400px] bg-gray-800/90 p-8 rounded-xl shadow-xl">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={(score / questions.length) * 100}
              text={`${score}/${questions.length}`}
              styles={buildStyles({
                pathColor: `rgba(62, 152, 199, ${score / questions.length})`,
                textColor: '#fff',
                trailColor: '#2e3748'
              })}
            />
          </div>
          <p className="text-xl text-gray-300 mb-4">
            You earned {score * 10} points!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-[400px] bg-gray-800/90 p-8 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-white mr-2" />
          <span className="text-white font-medium">
            Time Left: {timeLeft}s
          </span>
        </div>
        <div className="text-white">
          Question {currentQuestion + 1}/{questions.length}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl text-white font-medium mb-4"
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
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : option === questions[currentQuestion].correctAnswer && selectedAnswer !== null
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-white'
              }`}
              dangerouslySetInnerHTML={{ __html: option }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;