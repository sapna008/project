import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check for specific admin credentials
    if (formData.email === 'sapnapks1@gmail.com' && formData.password === 'sapna@08') {
      // Store admin session
      sessionStorage.setItem('isAdmin', 'true');
      navigate('/admin-panel');
    } else {
      setError('Invalid admin credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] border border-white/20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}>
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-full bg-teal-500/10">
            <ShieldCheck className="w-16 h-16 text-teal-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Admin Access
        </h2>
        <p className="text-center text-gray-300 mb-8">
          Please enter your admin credentials
        </p>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
              <input
                type="email"
                required
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter admin email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
              <input
                type="password"
                required
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-white/20 bg-black/60 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter admin password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Login as Admin
          </button>

          <div className="text-center">
            <a
              href="/"
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors duration-200"
            >
              Return to Student Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;