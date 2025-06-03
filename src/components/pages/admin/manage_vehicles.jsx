/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faFilter,
  faWeight,
  faInfoCircle,
  faTags,
  faClipboardList,
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faTruck,
  faChartPie,
  faPlus,
  faBicycle,
  faCar,
  faMotorcycle,
  faBatteryFull,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Admin_Manage_Vehicles() {
  const [vehicleData, setVehicleData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "Scooter",
    location: "",
    status: "offline",
  });
  const navigate = useNavigate();
  const BASE_URL = "http://127.0.0.1:8000/vehicle/";
  const [vehicleUnderMaintenance, setVehicleUnderMaintenance] = useState([]);
  const [vehicleBatteryLevel, setVehicleBatteryLevel] = useState([]);

  // Vehicle type options for dropdown
  const vehicleTypes = [
    { value: "Scooter", label: "Scooter" },
    { value: "Bike", label: "Bike" },
    { value: "Car", label: "Car" },
  ];

  useEffect(() => {
    handleFetch();
    fetchVehiclesUnderMaintenance();
    fetchVehicleBatteryCurrentCharge();
  }, []);

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}list_vehicles/`);
      setVehicleData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };
  const fetchVehiclesUnderMaintenance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}maintenance-vehicles/`);
      console.log("Vehicles under maintenance:", res.data);
      setVehicleUnderMaintenance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchVehicleBatteryCurrentCharge = async () => {
    try {
      const res = await axios.get(`${BASE_URL}vehicle-battery-levels/`);
      console.log("Vehicles current battery charges:", res.data);
      setVehicleBatteryLevel(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        "Error fetching vehicles battery current charge levels:",
        err
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this vehicle?")) return;
    try {
      await axios.delete(`${BASE_URL}delete_vehicle/${id}/`);
      await handleFetch();
      setMessage("Vehicle deleted successfully");
      setMessageType("success");
      handleFetch()
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const sendToMaintenance = async (id) => {
    if (!window.confirm("Do you want to send this vehicle to maintenance?"))
      return;
    try {
      await axios.put(`${BASE_URL}send-to-maintenance/${id}/`);
      await handleFetch();
      await fetchVehiclesUnderMaintenance(); // Add this line
      setMessage("Vehicle successfully sent to maintenance");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const removeToMaintenance = async (id) => {
    if (!window.confirm("Do you want to remove this vehicle from maintenance?"))
      return;
    try {
      await axios.put(`${BASE_URL}remove-from-maintenance/${id}/`);
      await handleFetch();
      await fetchVehiclesUnderMaintenance(); // Add this line
      setMessage("Vehicle successfully removed from maintenance");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  // Handle adding vehicle directly from the form
  const handleAddVehicle = async () => {
    if (!newVehicle.name.trim()) {
      setMessage("Vehicle name is required");
      setMessageType("error");
      return;
    }

    try {
      await axios.post(`${BASE_URL}create_vehicle/`, newVehicle, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage("Vehicle created successfully");
      setMessageType("success");
      setNewVehicle({
        name: "",
        type: "Scooter",
        location: "",
        status: "offline",
      });
      handleFetch();
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    try {
      const vehicleData = {
        type: e.target.type.value,
        name: e.target.name.value,
        location: e.target.location.value,
        status: e.target.status.value,
      };

      await axios.put(
        `${BASE_URL}update_vehicle/${currentVehicle.id}/`,
        vehicleData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Vehicle updated successfully");
      setMessageType("success");

      handleFetch();
      setIsModalOpen(false);
      setCurrentVehicle(null);
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const openModal = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsModalOpen(true);
  };

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "scooter":
        return faMotorcycle;
      case "bike":
        return faBicycle;
      case "car":
        return faCar;
      default:
        return faTruck;
    }
  };

  const filteredData = [
    ...vehicleData.filter((vehicle) =>
      [vehicle.type, vehicle.name, vehicle.location, vehicle.rol_number].some(
        (field) => field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
    ...vehicleUnderMaintenance.filter((vehicle) =>
      [vehicle.type, vehicle.name, vehicle.location, vehicle.rol_number].some(
        (field) => field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
  ].filter(
    (vehicle, index, self) =>
      index === self.findIndex((v) => v.id === vehicle.id)
  ); // Remove duplicates by id

  const renderModal = () => {
    if (!currentVehicle) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            isModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-white rounded-lg shadow-xl p-6 z-50 w-96 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Update Vehicle
          </h2>
          <form onSubmit={handleUpdateVehicle}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Vehicle Type</label>
                <select
                  name="type"
                  defaultValue={currentVehicle?.type || ""}
                  required
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentVehicle?.name || ""}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={currentVehicle?.location || ""}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={currentVehicle?.status || "offline"}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 2. Helper function to get battery level for a vehicle
  const getBatteryLevel = (vehicleId) => {
    const batteryInfo = vehicleBatteryLevel.find(
      (battery) => battery.vehicle === vehicleId
    );
    return batteryInfo?.battery_details?.current_charge || "N/A";
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-purple-700 mb-8">
            Vehicle Management
          </h1>

          {/* Add New Vehicle Section */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              Add New Vehicle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Vehicle Name (e.g., Scooter Alpha)"
                value={newVehicle.name}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, name: e.target.value })
                }
                className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={newVehicle.type}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, type: e.target.value })
                }
                className="p-3 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Current Location (e.g., Kacyiru)"
                value={newVehicle.location}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, location: e.target.value })
                }
                className="p-3 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={handleAddVehicle}
                className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Add Vehicle
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`text-center py-3 px-4 mb-6 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Current Fleet Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-6">
              Current Fleet
            </h2>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Vehicle Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredData.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No vehicles found
                </div>
              ) : (
                filteredData.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                  >
                    {/* Vehicle Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={getVehicleIcon(vehicle.type)}
                          className="text-2xl text-gray-600 mr-3"
                        />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === "online"
                              ? "bg-green-100 text-green-800"
                              : vehicle.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {vehicle.status === "online"
                            ? "Online"
                            : vehicle.status === "maintenance"
                            ? "Under Maintenance"
                            : "Offline"}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {vehicle.name || `${vehicle.type} ${vehicle.rol_number}`}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-medium">ID:</span>
                        <span className="ml-2">{vehicle.rol_number}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="mr-2"
                        />
                        <span>Location: {vehicle.location || "Unknown"}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faBatteryFull}
                          className="mr-2"
                        />
                        <span>Battery: {getBatteryLevel(vehicle.id)}%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Trips Covered:</span>
                        <span className="ml-2">
                          {vehicle.covered_trips || vehicle.trips_covered || 0}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {vehicle.status === "maintenance" ? (
                        <button
                          onClick={() => removeToMaintenance(vehicle.id)}
                          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          Remove from Maintenance
                        </button>
                      ) : (
                        <button
                          onClick={() => sendToMaintenance(vehicle.id)}
                          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                          Send to Maintenance
                        </button>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(vehicle)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {renderModal()}
      </div>
    </ErrorBoundary>
  );
}

export default Admin_Manage_Vehicles;
