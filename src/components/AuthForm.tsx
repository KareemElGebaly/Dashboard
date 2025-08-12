import React, { useState } from 'react';
import { LogIn, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsOTP, setNeedsOTP] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [displayOTP, setDisplayOTP] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.otp);
      
      if (result.success) {
        // Login successful
      } else if (result.needsOTP) {
        setNeedsOTP(true);
        setError('');
        // Get the OTP from localStorage to display it
        const pendingOTPData = localStorage.getItem('pendingOTP');
        if (pendingOTPData) {
          const { otp } = JSON.parse(pendingOTPData);
          setDisplayOTP(otp);
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', otp: '' });
    setError('');
    setNeedsOTP(false);
    setDisplayOTP('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cash Flow Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {needsOTP ? 'Enter the OTP sent to your email' : 'Enter your email to receive OTP'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="Enter your email"
                required
                disabled={needsOTP}
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {needsOTP && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OTP Code
              </label>
              <div className="relative">
                <input
                  type={showOTP ? 'text' : 'password'}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowOTP(!showOTP)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showOTP ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Check your email for the 6-digit verification code
              </p>
              {displayOTP && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    🔐 Your OTP Code (for testing): <span className="font-mono text-lg">{displayOTP}</span>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    In production, this would be sent to your email
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {needsOTP ? 'Verify OTP' : 'Send OTP'}
                </>
              )}
            </button>

            {needsOTP && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Back to Email
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Administrator: kareem@letsvape.ae<br />
            Invited users can login with their email only<br />
            {displayOTP && <span className="text-blue-600 dark:text-blue-400">OTP will be displayed above for testing</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;