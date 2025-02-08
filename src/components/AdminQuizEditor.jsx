import React, { useState, useEffect } from 'react';
import { ref, push, set, get, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { Clock, HelpCircle, Plus, Save, Trash2, Edit2 } from 'lucide-react';

function AdminQuizEditor({ quizId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 30
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuizQuestions();
    }
  }, [quizId]);

  const loadQuizQuestions = async () => {
    const questionsRef = ref(database, `quizQuestions/${quizId}`);
    const snapshot = await get(questionsRef);
    if (snapshot.exists()) {
      setQuestions(snapshot.val());
    }
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      question: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleAddQuestion = async () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const questionsRef = ref(database, `quizQuestions/${quizId}`);
      const newQuestions = [...questions, currentQuestion];
      await set(questionsRef, newQuestions);
      
      setQuestions(newQuestions);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error adding question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (index) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const newQuestions = questions.filter((_, i) => i !== index);
      const questionsRef = ref(database, `quizQuestions/${quizId}`);
      await set(questionsRef, newQuestions);
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <HelpCircle className="h-6 w-6 text-teal-400 mr-2" />
        Quiz Questions Editor
      </h3>

      <div className="space-y-6">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={handleQuestionChange}
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black/60 text-white resize-none"
            rows="3"
            placeholder="Enter your question"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Options
          </label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === index}
                onChange={() => setCurrentQuestion({
                  ...currentQuestion,
                  correctAnswer: index
                })}
                className="text-teal-500 focus:ring-teal-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-black/60 text-white"
              />
            </div>
          ))}
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={currentQuestion.timeLimit}
            onChange={(e) => setCurrentQuestion({
              ...currentQuestion,
              timeLimit: parseInt(e.target.value)
            })}
            min="10"
            max="300"
            className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black/60 text-white"
          />
        </div>

        <button
          onClick={handleAddQuestion}
          disabled={loading}
          className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-white mb-4">Added Questions</h4>
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="bg-black/40 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">{q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((option, optIndex) => (
                      <p
                        key={optIndex}
                        className={`text-sm ${
                          optIndex === q.correctAnswer
                            ? 'text-teal-400 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {optIndex + 1}. {option}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Time limit: {q.timeLimit} seconds
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(index)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminQuizEditor;