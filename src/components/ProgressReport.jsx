import React, { useEffect, useState } from 'react';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, Brain } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AiGenReport from './AiGenReport';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

function ProgressReport({ studentId }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch - replace with your actual data fetching logic
    const mockData = {
      quizHistory: [
        { score: 8, totalQuestions: 10, category: 'Linux', points: 80, date: '2024-03-01' },
        { score: 9, totalQuestions: 10, category: 'DevOps', points: 90, date: '2024-03-02' },
        { score: 7, totalQuestions: 10, category: 'Cloud', points: 70, date: '2024-03-03' }
      ],
      points: 240
    };

    setProgressData(mockData);
    setLoading(false);
  }, []);

  const calculateMetrics = (quizHistory = []) => {
    const totalQuizzes = quizHistory.length;
    const averageScore = quizHistory.reduce((acc, quiz) => 
      acc + (quiz.score / quiz.totalQuestions) * 100, 0) / totalQuizzes || 0;
    const categoryScores = quizHistory.reduce((acc, quiz) => {
      if (!acc[quiz.category]) acc[quiz.category] = [];
      acc[quiz.category].push((quiz.score / quiz.totalQuestions) * 100);
      return acc;
    }, {});

    return { totalQuizzes, averageScore, categoryScores };
  };

  const prepareChartData = (quizHistory = []) => {
    const metrics = calculateMetrics(quizHistory);

    const categoryData = Object.entries(metrics.categoryScores).map(([category, scores]) => ({
      category,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      bestScore: Math.max(...scores)
    }));

    const progressData = quizHistory.map((quiz, index) => ({
      quiz: index + 1,
      score: (quiz.score / quiz.totalQuestions) * 100,
      points: quiz.points
    }));

    const categoryDistribution = Object.entries(metrics.categoryScores).map(([category, scores]) => ({
      name: category,
      value: scores.length
    }));

    return { categoryData, progressData, categoryDistribution };
  };

  if (loading || !progressData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const { categoryData, progressData: timeData, categoryDistribution } = prepareChartData(progressData.quizHistory);
  const metrics = calculateMetrics(progressData.quizHistory);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">Progress Report</h1>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-white">
                {metrics.averageScore.toFixed(1)}%
              </p>
            </div>
            <BarChartIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-white">
                {metrics.totalQuizzes}
              </p>
            </div>
            <PieChartIcon className="h-8 w-8 text-teal-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Progress Trend</p>
              <p className="text-2xl font-bold text-white">
                {progressData.points ? '+' + progressData.points : '0'} pts
              </p>
            </div>
            <LineChartIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Bar Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Category Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar dataKey="averageScore" name="Average Score" fill="#8884d8" />
                <Bar dataKey="bestScore" name="Best Score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Over Time Line Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Progress Over Time</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="quiz" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="score" name="Score %" stroke="#8884d8" />
                <Line type="monotone" dataKey="points" name="Points" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Distribution Pie Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Quiz Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-4">Performance by Category</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quizzes Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Average Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Best Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Object.entries(metrics.categoryScores).map(([category, scores]) => (
                <tr key={category} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {scores.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Math.max(...scores).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Generated Progress Report */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AI Analysis & Recommendations</h2>
        </div>
        <AiGenReport studentId={studentId} />
      </div>
    </div>
  );
}

export default ProgressReport;