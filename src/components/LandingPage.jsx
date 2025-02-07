import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-6 w-6 text-teal-400" />,
      title: "Adaptive Learning",
      description: "Personalized quizzes that adapt to your knowledge level"
    },
    {
      icon: <Trophy className="h-6 w-6 text-teal-400" />,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics"
    },
    {
      icon: <Users className="h-6 w-6 text-teal-400" />,
      title: "Community Learning",
      description: "Compete and learn with peers worldwide"
    }
  ];

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Master Your Knowledge with 
              <span className="text-teal-400 block sm:inline"> Interactive Quizzes</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Enhance your learning journey with our adaptive quiz platform. Challenge yourself, track your progress, and achieve excellence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg bg-teal-500 text-white text-base sm:text-lg font-semibold hover:bg-teal-400 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Learning</span>
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg bg-white/10 text-white text-base sm:text-lg font-semibold hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 sm:bottom-10 left-0 right-0 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { number: "1000+", label: "Active Students" },
              { number: "500+", label: "Quiz Questions" },
              { number: "50+", label: "Subject Areas" }
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-teal-400">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-16 sm:py-20 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Choose EduQuiz?</h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Our platform combines advanced technology with proven learning methods to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 transform transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            Ready to Start Your Learning Journey?
          </h2>
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg bg-teal-500 text-white text-base sm:text-lg font-semibold hover:bg-teal-400 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Join Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;