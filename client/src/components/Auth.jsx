import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Github, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = ({ onAuthSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onAuthSuccess(data);
      } else {
        setError(data.error || `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  const handleSocialAuth = (provider) => {
    setError(`${provider} authentication will be available soon!`);
    setTimeout(() => setError(''), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
          whileHover={{ x: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:text-blue-400" />
          Back to Home
        </motion.button>

        {/* Auth Card */}
        <motion.div 
          className="card p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </motion.h2>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {isSignUp 
                ? 'Join thousands of users who trust Linkify' 
                : 'Sign in to your Linkify account'
              }
            </motion.p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialAuth('Google')}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              disabled={loading}
            >
              <Chrome className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>
            <button
              onClick={() => handleSocialAuth('GitHub')}
              className="w-full flex items-center justify-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              disabled={loading}
            >
              <Github className="h-5 w-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 text-gray-400 bg-gray-800">Or continue with email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
