import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, GraduationCap } from 'lucide-react';

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg border-b border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-teal-400" />
            <span className="text-xl font-bold text-white">EduQuiz</span>
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                 <Moon className="h-5 w-5 text-gray-300" />
              ) : (
               
                <Sun className="h-5 w-5 text-teal-400" />
              )}
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 transition-all duration-200 transform hover:scale-105"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;