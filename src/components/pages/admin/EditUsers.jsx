// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { LockClosedIcon } from "@heroicons/react/20/solid";

const EditUser = () => {
  const { id } = useParams();
  const [data, setData] = useState({}); // Store the user data
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [errorMessage, setErrorMessage] = useState(""); // Error message to show on the page
  const navigate = useNavigate();

  // Fetch the user data by ID
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the token from local storage

    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return; // Stop the request if there's no token
    }

    setLoading(true); // Start loading before making the request
    axios
      .get(`http://127.0.0.1:8000/user/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((res) => {
        if (res.data) {
          console.log("The related data is:", res.data);
          setData(res.data); // Set the fetched user data
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err); // Log the error
        setErrorMessage(err.response?.data?.message || "Error fetching user data.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request finishes
      });
  }, [id]);

  // Update the user data
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Retrieve the token from local storage
  
    if (!token) {
      console.error("No token found. User is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return; // Stop the request if there's no token
    }
  
    setLoading(true); // Start loading when the form is submitted
    setErrorMessage(""); // Clear any previous error message
    axios
      .put(`http://127.0.0.1:8000/update/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((res) => {
        if (res.data) {
          // alert("Data updated successfully");
          navigate("/admin/users"); // Navigate back to the users list page
        }
      })
      .catch((err) => {
        console.error("Error updating user:", err); // Log the error
  
        // Attempt to extract detailed error message from the backend
        const backendMessage = err.response?.data?.message || err.response?.data?.detail || "Error updating user.";
  
        // Set the error message to be displayed
        setErrorMessage(backendMessage);
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request finishes
      });
  };
  

  return (
    <section className="bg-gray-800 min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-gray-900 opacity-50 pattern-grid-lg"></div>

      {/* Responsive container - wider on larger screens */}
      <div className="container mx-auto w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Update User
          </h2>
          <p className="text-gray-300 max-w-md mx-auto">
            Modify user information and assign roles
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h3 className="text-xl font-semibold">Edit User Profile</h3>
            <p className="text-gray-100 mt-1">Update user account details</p>
          </div>

          {errorMessage && (
            <div className="mx-6 mt-6 p-3 rounded bg-blue-900 text-red-600">
              {errorMessage}
            </div>
          )}

          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-gray-300 mb-2 font-medium"
                >
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  value={data.phone_number || ""}
                  onChange={(e) => setData({ ...data, phone_number: e.target.value })}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., 0781234567"
                />
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
                  value={data.email || ""}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., example@gmail.com"
                />
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
                value={data.role || ""}
                onChange={(e) => setData({ ...data, role: e.target.value })}
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="dispatcher">Dispatcher</option>
                {/* <option value="warehouse_manager">Warehouse Mananger</option> */}
              </select>
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
                  Update User
                </>
              )}
            </button>
            
            <div className="mt-5 text-center">
              <Link
                to="/admin/users"
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

export default EditUser;