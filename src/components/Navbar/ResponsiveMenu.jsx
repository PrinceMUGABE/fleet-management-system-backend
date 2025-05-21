/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// ResponsiveMenu.jsx
import React from "react";
import { MenuLinks } from "./Navbar";
import { FaGlobe, FaUser } from "react-icons/fa";

const ResponsiveMenu = ({ showMenu, setShowMenu }) => {
  const handleLinkClick = () => setShowMenu(false);

  return (
    <div
      className={`${
        showMenu ? "left-0" : "-left-full"
      } fixed top-0 bottom-0 z-20 flex flex-col w-[75%] h-screen bg-gray-900 text-white px-6 pt-16 transition-all duration-300 md:hidden rounded-r-xl shadow-lg`}
    >
      {/* Navigation Links */}
      <nav className="mt-6">
        <ul className="space-y-6 text-lg">
          {MenuLinks.map(({ id, name, link }) => (
            <li key={id}>
              <a href={link} className="hover:text-green-500" onClick={handleLinkClick}>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto pb-6">
        <div className="flex flex-col space-y-4">
          <button className="flex items-center gap-2 hover:text-green-500">
            <FaUser /> Log in
          </button>
          {/* <button className="flex items-center gap-2 hover:text-green-500">
            <FaGlobe /> English ▼
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveMenu;
