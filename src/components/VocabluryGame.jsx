import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

// Predefined word list
const wordList = [
  { word: "Ephemeral", meaning: "Lasting for a very short time" },
  { word: "Ubiquitous", meaning: "Present, appearing, or found everywhere" },
  { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically" },
  { word: "Resilient", meaning: "Able to recover quickly from difficulties" },
  { word: "Ambiguous", meaning: "Open to more than one interpretation" },
  { word: "Meticulous", meaning: "Showing great attention to detail" },
  { word: "Innovative", meaning: "Featuring new methods or ideas" },
  { word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing" },
  { word: "Tenacious", meaning: "Persistent; not giving up easily" },
  { word: "Empathy", meaning: "The ability to understand others' feelings" },
  { word: "Paradigm", meaning: "A typical example or pattern" },
  { word: "Authentic", meaning: "Genuine; of undisputed origin" },
  { word: "Catalyst", meaning: "A person or thing that causes change" },
  { word: "Diligent", meaning: "Having or showing care in one's work" },
  { word: "Enigmatic", meaning: "Difficult to interpret or understand" },
  { word: "Versatile", meaning: "Able to adapt or be adapted to many functions" },
  { word: "Profound", meaning: "Very great or intense; showing deep insight" },
  { word: "Resilience", meaning: "The capacity to recover quickly" },
  { word: "Intuitive", meaning: "Using or based on what one feels to be true" },
  { word: "Persevere", meaning: "Continue despite difficulties" }
];

function VocabularyGame() {
  const [currentWord, setCurrentWord] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [usedWords, setUsedWords] = useState(new Set());

  const getRandomWord = () => {
    const availableWords = wordList.filter(word => !usedWords.has(word.word));
    if (availableWords.length === 0) {
      // Reset used words if all words have been used
      setUsedWords(new Set());
      return wordList[Math.floor(Math.random() * wordList.length)];
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const loadNewWord = () => {
    setIsLoading(true);
    setShowMeaning(false);
    setUserGuess('');
    setFeedback(null);
    
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setUsedWords(prev => new Set([...prev, newWord.word]));
    setIsLoading(false);
  };

  useEffect(() => {
    loadNewWord();
  }, []);

  const handleGuessSubmit = () => {
    if (!userGuess.trim()) return;
    
    const similarity = calculateSimilarity(userGuess.toLowerCase(), currentWord.meaning.toLowerCase());
    if (similarity >= 0.7) {
      setScore(prev => prev + 10);
      setFeedback({ type: 'success', message: 'Great job! Your understanding is correct!' });
    } else {
      setFeedback({ type: 'error', message: 'Not quite right. Try another word!' });
    }
    setShowMeaning(true);
  };

  // Simple string similarity calculation
  const calculateSimilarity = (str1, str2) => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-teal-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Vocabulary Builder</h2>
        </div>
        <div className="text-teal-400 font-bold">Score: {score}</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
        </div>
      ) : currentWord && (
        <div className="space-y-6">
          <div className="bg-gray-700/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white text-center mb-4">{currentWord.word}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you think this word means?
                </label>
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Type your guess here..."
                  disabled={showMeaning}
                />
              </div>

              {!showMeaning ? (
                <button
                  onClick={handleGuessSubmit}
                  className="w-full bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Check Answer
                </button>
              ) : (
                <>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-gray-300">
                      <span className="font-bold text-white">Correct meaning:</span> {currentWord.meaning}
                    </p>
                  </div>
                  {feedback && (
                    <div className={`flex items-center ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2" />
                      )}
                      {feedback.message}
                    </div>
                  )}
                  <button
                    onClick={loadNewWord}
                    className="w-full bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Next Word
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabularyGame;