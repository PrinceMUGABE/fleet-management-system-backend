/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { LockClosedIcon } from "@heroicons/react/20/solid";

const Dispatcher_CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    // Phone validation (10 digits starting with specific prefixes)
    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    // Email validation (basic regex check)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'You must select a role.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const dataToSubmit = {
      phone: formData.phone,
      email: formData.email,
      role: formData.role,
      is_admin_creating: true,
    };
  
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await axios.post(
        'http://127.0.0.1:8000/register/',
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
  
      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/dispatcher/users'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};
  
        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
        }
        if (backendErrors.email) {
          errorMessages.email = backendErrors.email;
        }
  
        setErrors((prev) => ({
          ...prev,
          ...errorMessages,
          form: backendErrors.error || 'An error occurred. Please try again.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-gray-900 opacity-50 pattern-grid-lg"></div>

      {/* Responsive container - wider on larger screens */}
      <div className="container mx-auto w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create New User
          </h2>
          <p className="text-gray-300 max-w-md mx-auto">
            Add a new user to the system
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h3 className="text-xl font-semibold">New User Registration</h3>
            <p className="text-gray-100 mt-1">Enter details for the new user account</p>
          </div>

          {errors.form && (
            <div className="mx-6 mt-6 p-3 rounded bg-blue-900 text-blue-100">
              {errors.form}
            </div>
          )}
          
          {message && (
            <div className="mx-6 mt-6 p-3 rounded bg-green-900 text-green-100">
              {message}
            </div>
          )}

          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-gray-300 mb-2 font-medium"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., 0781234567"
                  required
                />
                {errors.phone && <p className="text-blue-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-gray-300 mb-2 font-medium"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., example@gmail.com"
                  required
                />
                {errors.email && <p className="text-blue-400 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label 
                htmlFor="role" 
                className="block text-gray-300 mb-2 font-medium"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="customer">Customer</option>
                <option value="manager">Warehouse Manager</option>
                {/* <option value="warehouse_manager">Warehouse Manager</option> */}

              </select>
              {errors.role && <p className="text-blue-400 text-sm mt-1">{errors.role}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <LockClosedIcon className="h-5 w-5 text-gray-100 group-hover:text-gray-300" aria-hidden="true" />
                  Create User
                </>
              )}
            </button>
            
            <div className="mt-5 text-center">
              <Link
                to="/dispatcher/users"
                className="text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to users
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Dispatcher_CreateUser;