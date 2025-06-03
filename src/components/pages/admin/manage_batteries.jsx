/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

function BatteryManagement() {
  const [batteries, setBatteries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedBattery, setSelectedBattery] = useState("");
  const [newBatteryId, setNewBatteryId] = useState("");
  const [newBatteryCapacity, setNewBatteryCapacity] = useState("");
  const [newBatteryInitialCharge, setNewBatteryInitialCharge] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dischargeActive, setDischargeActive] = useState(false);
  const [dischargeInterval, setDischargeInterval] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000/";

  // Enhanced error handling function
  const handleError = (error, defaultMessage = "An error occurred") => {
    let errorMessage = defaultMessage;

    if (error.response) {
      console.error("API Error Response:", error.response);
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);

      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.non_field_errors) {
          errorMessage = Array.isArray(error.response.data.non_field_errors)
            ? error.response.data.non_field_errors.join(", ")
            : error.response.data.non_field_errors;
        } else {
          const fieldErrors = [];
          Object.keys(error.response.data).forEach((field) => {
            const fieldError = error.response.data[field];
            if (Array.isArray(fieldError)) {
              fieldError.forEach((err) => {
                if (typeof err === "object" && err.string) {
                  fieldErrors.push(err.string);
                } else if (typeof err === "string") {
                  fieldErrors.push(err);
                } else {
                  fieldErrors.push(String(err));
                }
              });
            } else if (typeof fieldError === "object" && fieldError.string) {
              fieldErrors.push(fieldError.string);
            } else if (typeof fieldError === "string") {
              fieldErrors.push(fieldError);
            } else {
              fieldErrors.push(String(fieldError));
            }
          });

          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join("; ");
          }
        }
      }
    } else if (error.request) {
      console.error("Network Error:", error.request);
      errorMessage = "Network error: Unable to connect to server";
    } else {
      console.error("Error:", error.message);
      errorMessage = error.message || defaultMessage;
    }

    console.error("Final error message:", errorMessage);
    setMessage(errorMessage);
    setMessageType("error");
  };

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

  useEffect(() => {
    fetchBatteries();
    fetchVehicles();
    fetchAssignments(); // Fetch assignments when component mounts
  }, []);

  useEffect(() => {
    // Start monitoring discharge status when component mounts
    checkDischargeStatus();

    // Start discharge simulation automatically when there are active assignments
    const activeAssignments = batteries.filter((b) => b.assignment);
    if (activeAssignments.length > 0 && !dischargeActive) {
      startDischargeSimulation();
    }

    return () => {
      // Clean up interval when component unmounts
      if (dischargeInterval) {
        clearInterval(dischargeInterval);
      }
    };
  }, [batteries]);

  // Add this useEffect to handle real-time battery updates during discharge
  useEffect(() => {
    if (dischargeActive) {
      const interval = setInterval(() => {
        fetchBatteries(); // Fetch updated battery data
      }, 2000); // Update every 2 seconds to match backend discharge rate

      setDischargeInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (dischargeInterval) {
        clearInterval(dischargeInterval);
        setDischargeInterval(null);
      }
    }
  }, [dischargeActive]);

  useEffect(() => {
    if (assignmentData && assignmentData.length > 0) {
      console.log("Fetched Assignments:", assignmentData);
    }
  }, [assignmentData]);

  const startDischargeSimulation = async () => {
    try {
      console.log("Starting battery discharge simulation");
      const res = await axios.post(
        `${BASE_URL}batteryAssignment/assignments/discharge/`
      );
      console.log("Discharge simulation started:", res.data);

      setDischargeActive(true);
      setMessage("Battery discharge simulation started");
      setMessageType("success");
    } catch (err) {
      console.error("Error starting discharge simulation:", err);
      handleError(err, "Failed to start discharge simulation");
    }
  };

  const stopDischargeSimulation = async () => {
    try {
      console.log("Stopping battery discharge simulation");
      const res = await axios.post(
        `${BASE_URL}batteryAssignment/assignments/stop-discharge/`
      );
      console.log("Discharge simulation stopped:", res.data);

      setDischargeActive(false);
      if (dischargeInterval) {
        clearInterval(dischargeInterval);
        setDischargeInterval(null);
      }
      setMessage("Battery discharge simulation stopped");
      setMessageType("success");
      fetchBatteries(); // Fetch updated battery data after stopping discharge
      fetchAssignments(); // Refresh assignments after stopping discharge
    } catch (err) {
      console.error("Error stopping discharge simulation:", err);
      handleError(err, "Failed to stop discharge simulation");
    }
  };

  const checkDischargeStatus = async () => {
    try {
      // Use the first battery assignment ID or a default value
      const assignmentId =
        batteries.find((b) => b.assignment)?.assignment?.id || 1;
      const res = await axios.get(
        `${BASE_URL}batteryAssignment/assignments/status/`
      );
      console.log("Discharge status:", res.data);

      setDischargeActive(res.data.discharge_active);
      // fetchBatteries(); // Fetch updated battery data after checking status
    } catch (err) {
      console.error("Error checking discharge status:", err);
      // Don't show error message for status check failures
    }
  };

  const fetchBatteries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}battery/batteries/`);
      console.log("Batteries fetched successfully:", res.data);
      setBatteries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching batteries:", err);
      handleError(err, "Failed to fetch batteries");
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}vehicle/list_vehicles/`);
      console.log("Vehicles fetched successfully:", res.data);
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      handleError(err, "Failed to fetch vehicles");
    }
  };

  const registerBattery = async () => {
    if (!newBatteryCapacity || !newBatteryInitialCharge) {
      setMessage(
        "Please fill in all required fields (Capacity and Initial Charge)"
      );
      setMessageType("error");
      return;
    }

    try {
      const payload = {
        capacity: parseFloat(newBatteryCapacity),
        initial_charge: parseFloat(newBatteryInitialCharge),
        status: "active",
      };

      console.log("Registering battery with payload:", payload);
      const res = await axios.post(`${BASE_URL}battery/create/`, payload);
      console.log("Battery registered successfully:", res.data);

      setMessage("Battery registered successfully");
      setMessageType("success");
      fetchBatteries();
      setNewBatteryId("");
      setNewBatteryCapacity("");
      setNewBatteryInitialCharge("");
    } catch (err) {
      console.error("Error registering battery:", err);
      handleError(err, "Failed to register battery");
    }
  };

  const assignBattery = async () => {
    if (!selectedVehicle || !selectedBattery) {
      setMessage("Please select both vehicle and battery");
      setMessageType("error");
      return;
    }

    try {
      const payload = {
        vehicle: parseInt(selectedVehicle),
        battery: parseInt(selectedBattery),
      };

      console.log("Assigning battery with payload:", payload);
      const res = await axios.post(
        `${BASE_URL}batteryAssignment/assignments/create/`,
        payload
      );
      console.log("Battery assigned successfully:", res.data);

      setMessage("Battery assigned successfully");
      setMessageType("success");
      await fetchBatteries();
      await fetchAssignments(); // Add this line to refresh assignments after new assignment
      setSelectedVehicle("");
      setSelectedBattery("");

      // Auto-start discharge simulation after successful assignment
      if (!dischargeActive) {
        setTimeout(() => {
          startDischargeSimulation();
        }, 1000); // Small delay to ensure battery data is updated
      }
    } catch (err) {
      console.error("Error assigning battery:", err);
      handleError(err, "Failed to assign battery");
    }
  };

  const startCharging = async (batteryId) => {
    try {
      console.log("Starting charging for battery ID:", batteryId);
      const res = await axios.post(`${BASE_URL}battery/charge/${batteryId}/`);
      console.log("Charging started successfully:", res.data);

      setMessage("Charging started successfully");
      setMessageType("success");
      fetchBatteries();
    } catch (err) {
      console.error("Error starting charging:", err);
      handleError(err, "Failed to start charging");
    }
  };

  const stopCharging = async (batteryId) => {
    try {
      console.log("Stopping charging for battery ID:", batteryId);
      const res = await axios.post(`${BASE_URL}battery/stop/${batteryId}/`);
      console.log("Charging stopped successfully:", res.data);

      setMessage("Charging stopped successfully");
      setMessageType("success");
      fetchBatteries();
    } catch (err) {
      console.error("Error stopping charging:", err);
      handleError(err, "Failed to stop charging");
    }
  };

  const detachBattery = async (batteryId) => {
    try {
      console.log("Detaching battery ID:", batteryId);
      const res = await axios.post(`${BASE_URL}battery/detach/${batteryId}/`);
      console.log("Battery detached successfully:", res.data);

      setMessage("Battery detached successfully");
      setMessageType("success");
      fetchBatteries();
    } catch (err) {
      console.error("Error detaching battery:", err);
      handleError(err, "Failed to detach battery");
    }
  };

  const detachAssignment = async (assignmentId) => {
    try {
      console.log("Detaching assignment ID:", assignmentId);
      const res = await axios.delete(
        `${BASE_URL}batteryAssignment/assignments/delete/${assignmentId}/`
      );
      console.log("Assignment detached successfully:", res.data);

      setMessage("Battery assignment detached successfully");
      setMessageType("success");
      await fetchBatteries();
      await fetchAssignments(); // Refresh assignments after detaching
    } catch (err) {
      console.error("Error detaching assignment:", err);
      handleError(err, "Failed to detach assignment");
    }
  };

  const filteredBatteries = batteries.filter((battery) =>
    battery.rol_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "charging":
        return "text-blue-600";
      case "low charge":
        return "text-orange-600";
      case "available":
        return "text-green-600";
      case "active":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getChargeColor = (charge) => {
    if (charge < 20) return "text-red-600";
    if (charge < 50) return "text-orange-600";
    return "text-green-600";
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}batteryAssignment/assignments/`);
      console.log("Assignments fetched successfully:", res.data);
      setAssignmentData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching Assignments:", err);
      handleError(err, "Failed to fetch assignments");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          Battery Management
        </h1>

        {/* Global Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
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
              <div className="ml-auto pl-3">
                <button
                  onClick={() => {
                    setMessage("");
                    setMessageType("");
                  }}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Register New Battery Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Register New Battery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Battery ID (e.g., BAT001)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                placeholder="Auto-generated"
                value={newBatteryId}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Capacity (kWh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full text-gray-700 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newBatteryCapacity}
                onChange={(e) => setNewBatteryCapacity(e.target.value)}
                placeholder="e.g., 50"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Initial Charge (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newBatteryInitialCharge}
                onChange={(e) => setNewBatteryInitialCharge(e.target.value)}
                placeholder="e.g., 80"
                min="0"
                max="100"
                required
              />
            </div>
          </div>
          <button
            onClick={registerBattery}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium w-full"
          >
            Register Battery
          </button>
        </div>

        {/* Assign Battery to Vehicle Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Assign Battery to Vehicle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Select Vehicle
              </label>
              <select
                className="w-full text-gray-700 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.rol_number} - {vehicle.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Select Battery
              </label>
              <select
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedBattery}
                onChange={(e) => setSelectedBattery(e.target.value)}
              >
                <option value="">Select Battery</option>
                {batteries
                  .filter((b) => b.status === "active")
                  .map((battery) => (
                    <option key={battery.id} value={battery.id}>
                      {battery.rol_number} - {battery.capacity}kWh (
                      {battery.current_charge}%)
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button
            onClick={assignBattery}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium w-full"
          >
            Assign Battery
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Battery Discharge Simulation
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">
                {dischargeActive
                  ? "Discharge simulation is currently running - batteries are automatically discharging every 2 seconds"
                  : "Discharge simulation is stopped - battery levels remain constant"}
              </p>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    dischargeActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    dischargeActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {dischargeActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="space-x-3">
              {dischargeActive ? (
                <button
                  onClick={stopDischargeSimulation}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  Stop Discharge
                </button>
              ) : (
                <button
                  onClick={startDischargeSimulation}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  Start Discharge
                </button>
              )}
              <button
                onClick={checkDischargeStatus}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>

        {/* All Registered Batteries Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-6">
            All Registered Batteries
          </h2>

          {filteredBatteries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No batteries found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatteries.map((battery) => (
                <div
                  key={battery.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-indigo-700 text-lg mb-2">
                      Battery ID: {battery.rol_number}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Capacity:</span>{" "}
                        <span className=" text-black font-medium">
                          {battery.capacity} kWh
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Charge:</span>{" "}
                        <span
                          className={`font-bold ${getChargeColor(
                            battery.current_charge
                          )}`}
                        >
                          {battery.current_charge}%
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Status:</span>{" "}
                        <span
                          className={`font-medium ${getStatusColor(
                            battery.status
                          )}`}
                        >
                          {battery.status === "active"
                            ? "Available"
                            : battery.status === "charging"
                            ? "Charging"
                            : battery.status === "low_charge"
                            ? "Low Charge"
                            : battery.status}
                        </span>
                      </p>
                      {battery.assignment && (
                        <p>
                          <span className="text-gray-600">Assigned To:</span>{" "}
                          <span className="font-medium text-indigo-600">
                            {battery.assignment.vehicle.rol_number}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {battery.is_charging ? (
                      <button
                        onClick={() => stopCharging(battery.id)}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                      >
                        Stop Charging
                      </button>
                    ) : (
                      battery.status === "active" && (
                        <button
                          onClick={() => startCharging(battery.id)}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        >
                          Start Charging
                        </button>
                      )
                    )}

                    {battery.assignment && (
                      <button
                        onClick={() => detachBattery(battery.id)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                      >
                        Detach Battery
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Battery Status Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-indigo-700 mb-6">
            Vehicle Battery Status
          </h2>

          {assignmentData && assignmentData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignmentData.map((assignment) => {
                // Fix: Use the nested objects instead of just the IDs
                const vehicle = assignment.vehicle_details;
                const battery = assignment.battery_details;
                const currentCharge = battery?.current_charge || 0;
                const isDischarging =
                  dischargeActive && battery && currentCharge > 0;

                return (
                  <div
                    key={assignment.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-indigo-700 text-lg mb-2 flex items-center">
                        {vehicle?.name || "Unknown Vehicle"} (
                        {vehicle?.rol_number || "N/A"})
                        {isDischarging && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full animate-pulse">
                            Discharging
                          </span>
                        )}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">
                            Assigned Battery:
                          </span>{" "}
                          <span className="font-medium text-indigo-600">
                            {battery?.rol_number || "None"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">
                            Battery Capacity:
                          </span>{" "}
                          <span className="font-medium text-black">
                            {battery?.capacity || 0} kWh
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">
                            Current Battery Charge:
                          </span>
                          <span
                            className={`font-bold ${getChargeColor(
                              parseFloat(currentCharge)
                            )}`}
                          >
                            {parseFloat(currentCharge).toFixed(1)}%
                            {isDischarging && (
                              <span className="text-orange-600 ml-1">↓</span>
                            )}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Vehicle Status:</span>
                          <span
                            className={`font-medium ${
                              vehicle?.status === "online"
                                ? "text-green-600"
                                : vehicle?.status === "offline"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {battery?.is_charging
                              ? "On Charge"
                              : isDischarging
                              ? "Discharging"
                              : vehicle?.status_display ||
                                vehicle?.status ||
                                "Unknown"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">
                            Assignment Date:
                          </span>
                          <span className="font-medium text-gray-700">
                            {new Date(
                              assignment.assigned_at
                            ).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Battery charge progress bar */}
                    {battery && (
                      <div className="mt-3 mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Battery Level</span>
                          <span>{parseFloat(currentCharge).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              parseFloat(currentCharge) > 50
                                ? "bg-green-500"
                                : parseFloat(currentCharge) > 20
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            } ${isDischarging ? "animate-pulse" : ""}`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, parseFloat(currentCharge))
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Detach Assignment Button */}
                    <button
                      onClick={() => detachAssignment(assignment.id)}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    >
                      Detach Assignment
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No battery assignments found. Assign batteries to vehicles to see
              them here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BatteryManagement;
