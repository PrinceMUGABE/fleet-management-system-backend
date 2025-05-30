/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Dispatcher_Layout() {
  return (
    <div className="flex bg-gray-800 min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-56 w-full overflow-x-auto">
        <main className="max-w-7xl mx-auto p-4 w-full">
          <div className="min-w-[320px]"> {/* Ensure minimum width for small screens */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dispatcher_Layout;