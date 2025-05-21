/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import loginImage from "../../assets/pictures/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    isValidLength: false
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordsMatchState, setPasswordsMatchState] = useState(false);
  const [showPasswordMatchFeedback, setShowPasswordMatchFeedback] = useState(false);

  const getCsrfToken = () => {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith('csrftoken=')) {
        csrfToken = cookie.trim().split('=')[1];
        break;
      }
    }
    return csrfToken;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 5;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
      isValid: password.length >= minLength && hasSpecialChar && hasUppercase && hasLowercase && hasNumber,
      hasUpperCase: hasUppercase,
      hasLowerCase: hasLowercase,
      hasDigit: hasNumber,
      hasSpecialChar: hasSpecialChar,
      isValidLength: password.length >= minLength
    };
  };

  const passwordsMatch = () => {
    return formData.new_password === formData.confirm_password;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'new_password') {
      const validation = validatePassword(value);
      setPasswordValidation({
        hasUpperCase: validation.hasUpperCase,
        hasLowerCase: validation.hasLowerCase,
        hasDigit: validation.hasDigit,
        hasSpecialChar: validation.hasSpecialChar,
        isValidLength: validation.isValidLength
      });

      // Show validation feedback once user starts typing
      if (value.length > 0) {
        setShowPasswordValidation(true);
      } else {
        setShowPasswordValidation(false);
      }

      // Check if passwords match when new password changes
      if (formData.confirm_password) {
        setPasswordsMatchState(value === formData.confirm_password);
        setShowPasswordMatchFeedback(true);
      }
    }
    
    if (name === 'confirm_password') {
      if (value) {
        setPasswordsMatchState(formData.new_password === value);
        setShowPasswordMatchFeedback(true);
      } else {
        setShowPasswordMatchFeedback(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!validateEmail(formData.email)) {
      setIsLoading(false);
      setError('Please enter a valid email address.');
      return;
    }

    const passwordValidationResult = validatePassword(formData.new_password);
    if (!passwordValidationResult.isValid) {
      setIsLoading(false);
      setError('Password must be at least 5 characters long, contain a special character, an uppercase letter, a lowercase letter, and a number.');
      return;
    }

    if (!passwordsMatch()) {
      setIsLoading(false);
      setError('Passwords do not match.');
      return;
    }

    const csrfToken = getCsrfToken();
    try {
      // Sending only email and new_password to the backend
      const dataToSend = {
        email: formData.email,
        new_password: formData.new_password
      };
      
      const response = await axios.post('http://127.0.0.1:8000/forget_password/', dataToSend, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });

      setIsLoading(false);

      if (response.data.message === "Password reset successfully. A confirmation has been sent to your email.") {
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('An unexpected response was received.');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Email address not found.');
        } else if (error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('An error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up the request. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>
      
      <div className="container mx-auto max-w-md md:max-w-lg lg:max-w-xl z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-300 max-w-md mx-auto">
            Enter your email and create a new secure password
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h3 className="text-xl font-semibold">Password Recovery</h3>
            <p className="text-gray-100 mt-1">We'll send a confirmation to your email</p>
          </div>

          <form className="p-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-5 p-3 rounded bg-blue-900 text-red-600">
                {error}
              </div>
            )}
            
            {message && (
              <div className="mb-5 p-3 rounded bg-green-900 text-green-100 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="new_password"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Create a new password"
                  className="w-full p-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              {showPasswordValidation && (
                <div className="mt-2 text-sm">
                  <p className={passwordValidation.isValidLength ? "text-green-400" : "text-red-400"}>
                    ✓ At least 5 characters long
                  </p>
                  <p className={passwordValidation.hasUpperCase ? "text-green-400" : "text-red-400"}>
                    ✓ At least one uppercase letter
                  </p>
                  <p className={passwordValidation.hasLowerCase ? "text-green-400" : "text-red-400"}>
                    ✓ At least one lowercase letter
                  </p>
                  <p className={passwordValidation.hasDigit ? "text-green-400" : "text-red-400"}>
                    ✓ At least one number
                  </p>
                  <p className={passwordValidation.hasSpecialChar ? "text-green-400" : "text-red-400"}>
                    ✓ At least one special character (!@#$%^&amp;*(),.?&quot;:&#123;&#125;|&lt;&gt;)
                  </p>
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-gray-300 mb-2 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full p-3 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              {showPasswordMatchFeedback && (
                <div className="mt-2 text-sm">
                  <p className={passwordsMatchState ? "text-green-400" : "text-red-400"}>
                    {passwordsMatchState ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="mt-5 text-center">
              <Link
                to="/login"
                className="text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;