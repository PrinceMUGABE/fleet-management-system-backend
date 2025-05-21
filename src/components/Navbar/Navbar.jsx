/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// Navbar.jsx
import React, { useState } from "react";
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import { FaGlobe, FaUser } from "react-icons/fa";
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/logo.png";
import { Link, useNavigate } from "react-router-dom";

export const MenuLinks = [
  { id: 1, name: "Home", link: "/#home" },
  { id: 3, name: "Our Services", link: "/#services" },
  { id: 4, name: "About Us", link: "/#network" },
  { id: 5, name: "Contact", link: "/#contact" },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLoginClick = () => navigate("/login");

  return (
    <header className="fixed top-0 left-0 right-0 z-20 w-full">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2 text-sm flex justify-end px-6 md:px-12">
        <div className="flex items-center gap-4">
          {/* <a href="#careers" className="text-gray-600 hover:text-green-500">Careers</a>
          <a href="#payment" className="text-gray-600hover:text-green-500">Payment</a> */}
          <button onClick={handleLoginClick} className="flex items-center gap-1 hover:text-green-500">
            <FaUser /> Log in
          </button>
          {/* <button className="flex items-center gap-1 hover:text-green-500">
            <FaGlobe /> English ▼
          </button> */}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white shadow-md py-3 px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-24" />
            <span className="text-xl font-semibold text-gray-900">SLMS</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6">
              {MenuLinks.map(({ id, name, link }) => (
                <li key={id}>
                  <a href={link} className="text-lg text-gray-600 font-medium hover:text-green-500 py-2 border-b-2 border-transparent hover:border-red-500 transition-colors">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get a Quote Button
          <button className=" flex items-center gap-1 md:block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
            <FaUser />Login
          </button> */}

          {/* Mobile Menu Toggle */}
          <div className="md:hidden text-black flex items-center gap-4">
  
            {showMenu ? (
              <HiMenuAlt1 onClick={toggleMenu} className="cursor-pointer" size={30} />
            ) : (
              <HiMenuAlt3 onClick={toggleMenu} className="cursor-pointer" size={30} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      <ResponsiveMenu showMenu={showMenu} setShowMenu={setShowMenu} />
    </header>
  );
};

export default Navbar;