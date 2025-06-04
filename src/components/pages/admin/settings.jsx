/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

function Settings() {
  const [language, setLanguage] = useState("English");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setMessage("Language updated successfully");
    setMessageType("success");
  };

  const handleCurrencyChange = (e) => {
    setCurrencySymbol(e.target.value);
    setMessage("Currency symbol updated successfully");
    setMessageType("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          {/* Global Message Display */}
          {message && (
            <div className="mx-8 mt-6">
              <div
                className={`p-4 rounded-lg border ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {messageType === "success" ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Section */}
          <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-indigo-600 mb-6">
                General Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Language:
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer text-gray-900"
                    >
                      <option value="English">English</option>
                      <option value="Kinyarwanda">Kinyarwanda</option>
                      <option value="French">French</option>
                      <option value="Swahili">Swahili</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Currency Symbol Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Currency Symbol:
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={handleCurrencyChange}
                    placeholder="Enter currency symbol"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the currency symbol to be used throughout the application (e.g., $, €, ₦, RWF)
                  </p>
                </div>
              </div>


              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    setMessage("Settings saved successfully!");
                    setMessageType("success");
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;