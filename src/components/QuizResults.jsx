import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { Award, Clock, User, BarChart } from 'lucide-react';

function QuizResults({ quizId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultsRef = ref(database, `quizResults/${quizId}`);
    const unsubscribe = onValue(resultsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedResults = Object.entries(data).map(([userId, result]) => ({
          userId,
          ...result
        }));
        setResults(formattedResults.sort((a, b) => b.score - a.score));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Award className="h-6 w-6 text-teal-400 mr-2" />
        Quiz Results
      </h3>

      {results.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No results yet</p>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={result.userId}
              className="bg-black/40 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{result.studentName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <BarChart className="h-4 w-4 mr-1" />
                        Score: {result.score}/{result.totalQuestions}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Time: {Math.round(result.timeTaken)}s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">
                    {Math.round((result.score / result.totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizResults;