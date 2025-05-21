/* eslint-disable no-unused-vars */
import React from "react";
import { 
  FaLinkedin, FaTwitter, FaArrowUp, FaPhone, 
  FaWarehouse, FaRoute, FaChartLine, FaTruck, 
  FaMapMarkedAlt, FaShieldAlt, FaCloudscale 
} from "react-icons/fa";
import { MdEmail, MdLocationOn, MdDashboard, MdAnalytics } from "react-icons/md";
import { BiData, BiPackage } from "react-icons/bi";
import logoImg from "../../assets/pictures/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-6 md:mb-0">
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <img 
                  src={logoImg} 
                  alt="SLMS - Smart Logistics Management System" 
                  className="h-16"
                />
                <p className="text-sm mt-2 text-gray-400">Optimizing supply chains with AI</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <MdLocationOn className="text-blue-400 mr-2" />
                  <span className="text-sm">Kigali Logistics Hub, Rwanda</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-blue-400 mr-2" />
                  <a href="tel:+250788123456" className="text-sm hover:text-blue-300">+250 788 123 456</a>
                </div>
                <div className="flex items-center">
                  <MdEmail className="text-blue-400 mr-2" />
                  <a href="mailto:info@slms.rw" className="text-sm hover:text-blue-300">info@slms.rw</a>
                </div>
              </div>
              
              <a 
                href="#dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4 inline-block font-medium transition-colors"
              >
                ACCESS FLEET DASHBOARD
              </a>
              
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaLinkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </div>
          
          {/* SLMS Features */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-4 text-white">Key Features</h3>
            <ul className="space-y-3">
              {[
                { icon: <FaTruck className="mr-2 text-blue-400" />, text: "Fleet Tracking & Management" },
                { icon: <FaRoute className="mr-2 text-blue-400" />, text: "Route Optimization" },
                { icon: <BiPackage className="mr-2 text-blue-400" />, text: "Inventory Management" },
                { icon: <FaChartLine className="mr-2 text-blue-400" />, text: "Predictive Analytics" },
                { icon: <MdAnalytics className="mr-2 text-blue-400" />, text: "Real-Time Reporting" },
                { icon: <FaCloudscale className="mr-2 text-blue-400" />, text: "Scalable Infrastructure" }
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-sm hover:text-blue-300 flex items-center">
                    {item.icon}
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Coverage Areas */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-4 text-white">Regional Coverage</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Kigali City", "Eastern Province", "Northern Province", 
                "Southern Province", "Western Province", "Burundi",
                "DRC Border", "Tanzania Border", "Uganda Border"
              ].map((region, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="text-sm hover:text-blue-300 hover:underline"
                >
                  {region}
                </a>
              ))}
            </div>
            
            <h3 className="text-lg font-bold mt-6 mb-3 text-white">Industries Served</h3>
            <div className="flex flex-wrap gap-2">
              {["E-Commerce", "Agriculture", "Manufacturing", "Pharma", "Construction", "Retail"].map((industry, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
          
          {/* Updates & Compliance */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-4 text-white">System Updates</h3>
            <ul className="space-y-3 mb-6">
              {[
                "New: Cross-border documentation automation",
                "Enhanced: Fuel consumption analytics",
                "Updated: Driver performance metrics"
              ].map((update, index) => (
                <li key={index}>
                  <a href="#" className="text-sm hover:text-blue-300 flex items-start">
                    <span className="bg-blue-600 text-white text-xs px-1 rounded mr-2">NEW</span>
                    {update}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center mb-3">
                <FaShieldAlt className="text-blue-400 mr-2" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <FaShieldAlt className="text-blue-400 mr-2" />
                <span className="text-sm">ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} SLMS. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <a href="#" className="text-xs hover:text-blue-300">Terms of Service</a>
            <a href="#" className="text-xs hover:text-blue-300">Privacy Policy</a>
            <a href="#" className="text-xs hover:text-blue-300">Security</a>
            <a href="#" className="text-xs hover:text-blue-300">Careers</a>
            <a href="#" className="text-xs hover:text-blue-300">Contact</a>
          </div>
          <a 
            href="#top" 
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 flex items-center justify-center transition-colors"
            aria-label="Back to top"
          >
            <FaArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;