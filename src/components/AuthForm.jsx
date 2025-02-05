import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebase';
import { UserCircle, Mail, Lock, User, ShieldCheck } from 'lucide-react';

function AuthForm() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        // Store additional user data in Realtime Database
        await set(ref(database, `students/${userCredential.user.uid}`), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
          points: 0,
          quizzesCompleted: 0
        });

        navigate('/student-dashboard');
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/student-dashboard');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Admin Icon */}
      <Link
        to="/admin-login"
        className="absolute top-4 right-4 p-3 rounded-full hover:bg-white/10 transition-all duration-300 border border-white/20"
        title="Admin Login"
      >
        <ShieldCheck className="w-8 h-8 text-teal-400" />
      </Link>

      <div className="backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] border border-white/20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}>
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-teal-500/10">
            <UserCircle className="w-16 h-16 text-teal-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-300 mb-8">
          {isSignUp ? 'Sign up to start learning' : 'Sign in to continue learning'}
        </p>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  required
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
              <input
                type="email"
                id="email"
                required
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
              <input
                type="password"
                id="password"
                required
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="text-center space-y-4">
            <p className="text-gray-300">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>
      </div>  
    </div>
  );
}

export default AuthForm;