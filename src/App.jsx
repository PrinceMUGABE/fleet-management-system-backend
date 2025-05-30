// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";


// Admin imports
import Layout from "./components/admin/Layout.jsx";
import AdminHome from "./components/pages/admin/Home.jsx";
import Users from "./components/pages/admin/Users.jsx";
import CreateUser from "./components/pages/admin/CreateNewUser.jsx";
import EditUsers from "./components/pages/admin/EditUsers.jsx";




import AdminProfile from "./components/pages/admin/AdminProfile.jsx";
import UserProfile from "./components/pages/customer/UserProfile.jsx";
import UserHome from "./components/pages/customer/Home.jsx";
// import Admin_Manage_Inventory from "./components/pages/admin/manage_inventories.jsx";
import Admin_Manage_Vehicles from "./components/pages/admin/manage_vehicles.jsx";
import Admin_Manage_Drivers from "./components/pages/admin/manage_drivers.jsx";
import Customer_Layout from "./components/customer/Layout.jsx";
import Customer_VehiclesDisplay from "./components/pages/customer/vehicles.jsx";
import Customer_Map from "./components/pages/customer/map.jsx";
import Customer_Manage_Relocations from "./components/pages/customer/my_relocations.jsx";
import Admin_Create_Relocation from "./components/pages/admin/create_relocation.jsx";
import Admin_Manage_Feedbacks from "./components/pages/admin/manage_feedbacks.jsx";
import Customer_Manage_Feedbacks from "./components/pages/customer/manage_feedbacks.jsx";
import Driver_Layout from "./components/driver/Layout.jsx";
import Driver_Home from "./components/pages/driver/Home.jsx";
import Driver_VehiclesDisplay from "./components/pages/driver/vehicles.jsx";
import Driver_Map from "./components/pages/driver/map.jsx";
import Driver_Manage_Feedbacks from "./components/pages/driver/manage_feedbacks.jsx";
import DriverProfile from "./components/pages/driver/UserProfile.jsx";
import Driver_Manage_Relocations from "./components/pages/driver/my_relocations.jsx";
import Admin_Manage_Warehouses from "./components/pages/admin/manage_warehouses.jsx";
import WarehouseManagement from "./components/pages/admin/manage_warehouses.jsx";
import CategoryManagement from "./components/pages/admin/category_mangement.jsx";
import CommodityManagement from "./components/pages/admin/commodity_management.jsx";
import InventoryMovementHistory from "./components/pages/admin/inventory_movement_history.jsx";
import WarehouseCommodityManagement from "./components/pages/admin/warehouse_commodity_management.jsx";
import StorageCosts from "./components/pages/admin/manage_storage_costs.jsx";
import Admin_OrderManagement from "./components/pages/admin/manage_orders.jsx";
import Admin_Manage_Deliveries from "./components/pages/admin/manage_deliveries.jsx";
import Dispatcher_StorageCostManager from "./components/pages/dispatcher/manage_storage_costs.jsx";
import Dispatcher_InventoryMovementHistory from "./components/pages/dispatcher/inventory_movement_history.jsx";
import Dispatcher_CommodityManagement from "./components/pages/dispatcher/commodity_management.jsx";
import Dispatcher_CategoryManagement from "./components/pages/dispatcher/category_mangement.jsx";
import Dispatcher_WarehouseCommodityManagement from "./components/pages/dispatcher/warehouse_commodity_management.jsx";
import DispatcherProfile from "./components/pages/dispatcher/AdminProfile.jsx";
import Dispatcher_Manage_Deliveries from "./components/pages/dispatcher/manage_deliveries.jsx";
import Dispatcher_Manage_Feedbacks from "./components/pages/dispatcher/manage_feedbacks.jsx";
import Dispatcher_WarehouseManagement from "./components/pages/dispatcher/manage_warehouses.jsx";
import Dispatcher_Manage_Drivers from "./components/pages/dispatcher/manage_drivers.jsx";
import Dispatcher_Create_Relocation from "./components/pages/dispatcher/create_relocation.jsx";
import Dispatcher_OrderManagement from "./components/pages/dispatcher/manage_orders.jsx";
import Dispatcher_Manage_Vehicles from "./components/pages/dispatcher/manage_vehicles.jsx";
import DispatcherHome from "./components/pages/dispatcher/Home.jsx";
import Dispatcher_Layout from "./components/dispatcher/Layout.jsx";
import Dispatcher_EditUser from "./components/pages/dispatcher/EditUsers.jsx";
import Dispatcher_CreateUser from "./components/pages/dispatcher/CreateNewUser.jsx";
import Dispatcher_ManageUsers from "./components/pages/dispatcher/Users.jsx";
import Customer_OrderManagement from "./components/pages/customer/manage_orders.jsx";
import Customer_Manage_Deliveries from "./components/pages/customer/manage_deliveries.jsx";





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
          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset" element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />

          {/* End Home view */}

          {/* Admin */}

          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />
            <Route path="/admin/createUser" element={<CreateUser />} />

            <Route path="/admin/vehicles" element={<Admin_Manage_Vehicles />} />
            <Route path="/admin/relocations" element={<Admin_OrderManagement />} />
            <Route path="/admin/createRelocation" element={<Admin_Create_Relocation />} />


            <Route path="/admin/drivers" element={<Admin_Manage_Drivers />} />
            <Route path="/admin/warehouses" element={<Admin_Manage_Warehouses />} />
            <Route path="/admin/feedbacks" element={<Admin_Manage_Feedbacks />} />
            <Route path="/admin/deliveries" element={<Admin_Manage_Deliveries />} />
            <Route path="/admin/profile/:id" element={<AdminProfile />} />


            <Route path="/admin/warehouses" element={<WarehouseManagement />} />
            {/* <Route path="/admin/warehouses/:warehouseId" element={<WarehouseDetail />} /> */}
            <Route path="/admin/warehouses/:warehouseId/commodities" element={<WarehouseCommodityManagement />} />
            <Route path="/admin/warehouses/:warehouseId/movements" element={<InventoryMovementHistory />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/commodities" element={<CommodityManagement />} />
            <Route path="/admin/warehouses/:warehouseId/movements" element={<InventoryMovementHistory />} />
            <Route path="/admin/costs" element={<StorageCosts />} />

          </Route>


          {/* Dispatcher */}

          <Route path="/dispatcher" element={<Dispatcher_Layout />}>
            <Route index element={<DispatcherHome />} />
            <Route path="/dispatcher/users" element={<Dispatcher_ManageUsers />} />
            <Route path="/dispatcher/edituser/:id" element={<Dispatcher_EditUser />} />
            <Route path="/dispatcher/createUser" element={<Dispatcher_CreateUser />} />

            <Route path="/dispatcher/vehicles" element={<Dispatcher_Manage_Vehicles />} />
            <Route path="/dispatcher/relocations" element={<Dispatcher_OrderManagement />} />
            <Route path="/dispatcher/createRelocation" element={<Dispatcher_Create_Relocation />} />


            <Route path="/dispatcher/drivers" element={<Dispatcher_Manage_Drivers />} />
            <Route path="/dispatcher/warehouses" element={<Dispatcher_WarehouseManagement />} />
            <Route path="/dispatcher/feedbacks" element={<Dispatcher_Manage_Feedbacks />} />
            <Route path="/dispatcher/deliveries" element={<Dispatcher_Manage_Deliveries />} />
            <Route path="/dispatcher/profile/:id" element={<DispatcherProfile />} />


            <Route path="/dispatcher/warehouses" element={<WarehouseManagement />} />
            {/* <Route path="/admin/warehouses/:warehouseId" element={<WarehouseDetail />} /> */}
            <Route path="/dispatcher/warehouses/:warehouseId/commodities" element={<Dispatcher_WarehouseCommodityManagement />} />
            <Route path="/dispatcher/warehouses/:warehouseId/movements" element={<Dispatcher_InventoryMovementHistory />} />
            <Route path="/dispatcher/categories" element={<Dispatcher_CategoryManagement />} />
            <Route path="/dispatcher/commodities" element={<Dispatcher_CommodityManagement />} />
            <Route path="/dispatcher/warehouses/:warehouseId/movements" element={<Dispatcher_InventoryMovementHistory />} />
            <Route path="/dispatcher/costs" element={<Dispatcher_StorageCostManager />} />

          </Route>


          {/* user */}

          <Route path="/customer" element={<Customer_Layout />}>
            <Route index element={<UserHome />} />
            <Route path="/customer/vehicles" element={<Customer_VehiclesDisplay />} />
            <Route path="/customer/predict" element={<Customer_Map />} />
            <Route path="/customer/feedbacks" element={<Customer_Manage_Feedbacks />} />

            <Route path="/customer/profile/:id" element={<UserProfile />} />
            <Route path="/customer/orders" element={<Customer_OrderManagement />} />
            <Route path="/customer/deliveries" element={<Customer_Manage_Deliveries />} />

            <Route path="/customer/relocations" element={<Customer_Manage_Relocations />} />
     
          </Route>



          <Route path="/driver" element={<Driver_Layout />}>
            <Route index element={<Driver_Home />} />
            <Route path="/driver/vehicles" element={<Driver_VehiclesDisplay />} />
            <Route path="/driver/predict" element={<Driver_Map />} />
            <Route path="/driver/feedbacks" element={<Driver_Manage_Feedbacks />} />

            <Route path="/driver/profile" element={<DriverProfile />} />

            <Route path="/driver/relocations" element={<Driver_Manage_Relocations />} />
     
          </Route>




        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
