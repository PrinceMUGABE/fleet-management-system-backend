/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Clock, Edit, Save, X, ArrowLeft } from 'lucide-react';
import profileImage from '../../../assets/pictures/driving2.jpg';

function DispatcherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch user data from the server
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;
      
      if (!accessToken) {
        console.error('Access token is missing!');
        setError('Authentication error. Please log in again.');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("User data retrieved from API:", data);
        
        // Update userData and formData with fresh data
        setUserData({
          ...data,
          phone: data.phone_number // Ensure compatibility with your component
        });
        
        setFormData({
          phone_number: data.phone_number,
          email: data.email,
          role: data.role
        });
      } else {
        console.error('Failed to fetch user data');
        setError('Failed to load profile. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - try from localStorage first, but then fetch from API
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    console.log("Retrieved user from localStorage:", storedUser);

    if (storedUser && storedUser.id.toString() === id) {
      setUserData(storedUser);
      setFormData({
        phone_number: storedUser.phone,
        email: storedUser.email,
        role: storedUser.role
      });
      console.log("Matching user data:", storedUser);
    }
    
    // Fetch the most up-to-date user data from the server
    fetchUserData();
  }, [id]);

  useEffect(() => {
    if (userData) {
      console.log("User data set in state:", userData);
    }
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(078|072|079|073)\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate phone and email
    if (!validatePhone(formData.phone_number)) {
      setError("Phone number must be 10 digits and start with 078, 072, 079, or 073.");
      return;
    }
  
    if (!validateEmail(formData.email)) {
      setError("Email must be a valid Gmail address ending with @gmail.com.");
      return;
    }
  
    setIsLoading(true);
    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;
  
    if (!accessToken) {
      console.error('Access token is missing!');
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }
  
    const updatedUser = {
      ...userData,
      phone_number: formData.phone_number,
      email: formData.email,
      role: formData.role,
    };
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (response.ok) {
        const updatedData = await response.json();
        
        // Update localStorage with the new data
        const currentUserData = JSON.parse(localStorage.getItem('userData'));
        const updatedUserData = {
          ...currentUserData,
          phone: updatedData.phone_number,
          phone_number: updatedData.phone_number,
          email: updatedData.email
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Exit edit mode
        setIsEditing(false);
        console.log('User data updated:', updatedData);
        
        // Fetch fresh data from the server
        fetchUserData();
      } else {
        console.error('Failed to update user data');
        setError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <section className="bg-gray-800 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${profileImage})` }}></div>
        <div className="text-white text-xl flex items-center z-10">
          <svg className="animate-spin h-8 w-8 mr-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your profile...
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with image */}
      {/* <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${profileImage})` }}></div> */}

      <div className="container mx-auto max-w-2xl z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            My Profile
          </h2>
          <p className="text-gray-300 max-w-md mx-auto">
            View and manage your account information
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-gray-600 text-white">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </h3>
            <p className="text-gray-100 mt-1">
              {isEditing ? "Edit your profile details below" : "Your personal account details"}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-3 rounded bg-gray-900 text-gray-100">
              {error}
            </div>
          )}

          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-start">
                    <div className="p-2 bg-gray-700 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm block">Phone Number</span>
                      <span className="text-white text-lg">{userData.phone || userData.phone_number}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-start">
                    <div className="p-2 bg-gray-700 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm block">Email Address</span>
                      <span className="text-white text-lg">{userData.email}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-start">
                    <div className="p-2 bg-gray-700 rounded-full mr-4">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm block">Role</span>
                      <span className="text-white text-lg capitalize">{userData.role}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-start">
                    <div className="p-2 bg-gray-700 rounded-full mr-4">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm block">Member Since</span>
                      <span className="text-white text-lg">
                        {new Date(userData.created_at).toLocaleDateString()} at {new Date(userData.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleEditClick}
                    className="px-6 py-3 text-white bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200 ease-in-out flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    <Edit className="h-5 w-5" />
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-gray-300 text-sm font-medium mb-2" 
                      htmlFor="phone_number"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="e.g., 0781234567"
                        className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-gray-300 text-sm font-medium mb-2" 
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., example@gmail.com"
                        className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-gray-300 text-sm font-medium mb-2" 
                      htmlFor="role"
                    >
                      Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        readOnly
                        className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-6 py-3 text-white bg-gray-700 hover:bg-gray-600 rounded-md transition duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 text-white bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/dispatcher"
                className="text-gray-400 hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DispatcherProfile;