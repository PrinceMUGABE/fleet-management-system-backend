// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";



import AdminHome from "./components/pages/admin/Home.jsx";

// import Admin_Manage_Inventory from "./components/pages/admin/manage_inventories.jsx";
import Admin_Manage_Vehicles from "./components/pages/admin/manage_vehicles.jsx";
import Admin_Manage_Drivers from "./components/pages/admin/manage_drivers.jsx";
import Admin_Manage_Batteries from "./components/pages/admin/manage_batteries.jsx";



const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });

    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>


          <Route path="/" element={<MainLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="/vehicles" element={<Admin_Manage_Vehicles />} />
            <Route path="/drivers" element={<Admin_Manage_Drivers />} />
            <Route path="/batteries" element={<Admin_Manage_Batteries />} />
          </Route>





        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
