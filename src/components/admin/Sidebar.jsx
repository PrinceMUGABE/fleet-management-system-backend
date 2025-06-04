/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCommentDots,
  FaTruck,
  FaBoxes,
  FaTag,
  FaBatteryFull,
  FaCog
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
  MdAttachMoney,
  MdAssignment,
  MdReport,
  MdSettings
} from "react-icons/md";
import { X, Menu, Car, Users, Battery, UserCheck, FileText, Settings } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/pictures/logo.png";

function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";

  // Enhanced sidebar links with corresponding icons
  const Sidebar_Links = [
    { id: 1, name: "Dashboard", path: "/", icon: <MdDashboard className="text-xl" /> },
    { id: 2, name: "Vehicles", path: "/vehicles", icon: <Car className="text-xl" /> },
    { id: 3, name: "Drivers", path: "/drivers", icon: <Users className="text-xl" /> },
    { id: 4, name: "Batteries", path: "/batteries", icon: <Battery className="text-xl" /> },
    { id: 5, name: "Assign Driver", path: "/driverAssignments", icon: <UserCheck className="text-xl" /> },
    { id: 6, name: "Report", path: "/report", icon: <FileText className="text-xl" /> },
    { id: 7, name: "Setting", path: "/setting", icon: <Settings className="text-xl" /> },
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
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-purple-800 p-2 rounded-md shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 fixed left-0 top-0 h-screen bg-gradient-to-b from-purple-700 to-purple-800 shadow-xl py-6 z-40">
        <div className="flex justify-center items-center mb-6 px-2 flex-shrink-0">
          <h1 className="text-white font-semibold text-lg">Fleet Management</h1>
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
                    ? "bg-purple-600 text-white font-medium shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-purple-600/50"
                }`}
              >
                <span className={`${isActiveLink(link.path) ? "text-purple-300" : ""}`}>{link.icon}</span>
                <span>{link.name}</span>
                {isActiveLink(link.path) && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-purple-300"></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-purple-700 to-purple-800 transform transition-all duration-300 ease-in-out z-50 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-purple-600">
          <h1 className="text-white font-semibold text-lg">Fleet Management</h1>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-gray-300 hover:text-white focus:outline-none hover:bg-purple-600/50 p-1 rounded-full"
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
                    ? "bg-purple-600 text-white font-medium shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-purple-600/50"
                }`}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <span className={`${isActiveLink(link.path) ? "text-purple-300" : ""}`}>{link.icon}</span>
                <span>{link.name}</span>
                {isActiveLink(link.path) && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-purple-300"></span>
                )}
              </Link>
            ))}
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