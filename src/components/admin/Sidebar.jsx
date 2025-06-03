/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCommentDots,
  FaTruck,
  FaBoxes,
  FaTag
} from "react-icons/fa";
import { 
  MdDashboard, 
  MdPeople, 
  MdDirectionsCar, 
  MdPersonPin,
  MdCompareArrows, 
  MdInsights, 
  MdFeedback,
  MdWarehouse,
  MdLocalShipping,
  MdInventory,
  MdAttachMoney
} from "react-icons/md";
import { X, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/pictures/logo.png";

function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Enhanced sidebar links with more appropriate icons
  const Sidebar_Links = [
    { id: 1, name: "Dashboard", path: "/", icon: <MdDashboard className="text-xl" /> },
    { id: 2, name: "Vehicles", path: "/vehicles", icon: <MdDirectionsCar className="text-xl" /> },
    { id: 3, name: "Drivers", path: "/drivers", icon: <MdPersonPin className="text-xl" /> },
    { id: 4, name: "Batteries", path: "/batteries", icon: <MdPersonPin className="text-xl" /> },

  ];

  // Check if the current path matches the link path
  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path !== "/" && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded-md shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl py-6 z-40">
        <div className="flex justify-center items-center mb-6 px-6 flex-shrink-0">
          <img src={Logo} alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col space-y-1 pb-4">
            {Sidebar_Links.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "bg-gray-700 text-white font-medium shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <span className={`${isActiveLink(link.path) ? "text-blue-400" : ""}`}>{link.icon}</span>
                <span>{link.name}</span>
                {isActiveLink(link.path) && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-blue-400"></span>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Fixed Logout Button at Bottom */}
        <div className="px-4 mt-4 flex-shrink-0 border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 w-full text-left group"
          >
            <FaSignOutAlt className="text-xl group-hover:text-blue-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-800 to-gray-900 transform transition-all duration-300 ease-in-out z-50 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <img src={Logo} alt="Logo" className="h-12 w-auto" />
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-gray-300 hover:text-white focus:outline-none hover:bg-gray-700/50 p-1 rounded-full"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-76px)]">
          <div className="flex flex-col space-y-1 p-4 flex-grow overflow-y-auto">
            {Sidebar_Links.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? "bg-gray-700 text-white font-medium shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <span className={`${isActiveLink(link.path) ? "text-blue-400" : ""}`}>{link.icon}</span>
                <span>{link.name}</span>
                {isActiveLink(link.path) && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-blue-400"></span>
                )}
              </Link>
            ))}
          </div>
          
          <div className="p-4 mt-auto border-t border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileSidebarOpen(false);
              }}
              className="text-gray-300 hover:text-white flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 w-full text-left group"
            >
              <FaSignOutAlt className="text-xl group-hover:text-blue-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Sidebar;