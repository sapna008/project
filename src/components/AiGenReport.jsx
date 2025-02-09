import { useEffect, useState } from "react";
import { Brain, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { generateContent } from "../aicomponents/geminie/generateContent";

const AiGenReport = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_STUDENT_API);
        if (!response.ok) throw new Error("Failed to fetch student data");

        const data = await response.json();
        const studentData = data[studentId];
        
        if (!studentData) {
          throw new Error("Student data not found");
        }

        const prompt = `Analyze the student's past performance and generate a progress report with areas of improvement: ${JSON.stringify(studentData)}. The report should be structured in JSON format suitable for rendering the following HTML structure. The JSON should be an object where each key is a section title (e.g., "Strengths", "Areas for Improvement", "Overall Progress") and the value for each key is an array of strings representing the points for that section. Return ONLY the JSON without backticks or language specifiers.`;
        
        const aiResponse = await generateContent(prompt);
        setReport(JSON.parse(aiResponse));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm">Analyzing your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-red-400">
        <AlertTriangle className="h-8 w-8 mb-4" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-400">
        <Brain className="h-8 w-8 mb-4" />
        <p className="text-sm">No progress data available. Keep engaging with quizzes to get insights!</p>
      </div>
    );
  }

  const sectionIcons = {
    "Strengths": "✨",
    "Areas for Improvement": "🎯",
    "Overall Progress": "📈",
    "Recommendations": "💡",
    "Learning Path": "🛣️",
    "Next Steps": "👣"
  };

  const sectionColors = {
    "Strengths": "text-green-400",
    "Areas for Improvement": "text-yellow-400",
    "Overall Progress": "text-blue-400",
    "Recommendations": "text-purple-400",
    "Learning Path": "text-teal-400",
    "Next Steps": "text-pink-400"
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {Object.entries(report).map(([title, points], index) => (
        <motion.div
          key={title}
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" role="img" aria-label={title}>
              {sectionIcons[title] || "📝"}
            </span>
            <h3 className={`text-lg font-semibold ${sectionColors[title] || "text-white"}`}>
              {title}
            </h3>
          </div>
          <ul className="space-y-3">
            {points.map((point, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: (index * 0.1) + (idx * 0.05) }}
              >
                <div className="min-w-[24px] h-6 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${sectionColors[title] || "bg-purple-400"}`} />
                </div>
                <span className="text-sm leading-6">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AiGenReport;