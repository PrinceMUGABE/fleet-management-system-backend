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

function Manage_DriverAssignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [batteryAssignments, setBatteryAssignments] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [pastAssignments, setPastAssignments] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [distanceCovered, setDistanceCovered] = useState("");
  const [moneyPaid, setMoneyPaid] = useState("");

  const BASE_URL = "http://127.0.0.1:8000/";

  // Enhanced error handling function
  // Enhanced error handling function
const handleError = (error, defaultMessage = "An error occurred") => {
  let errorMessage = defaultMessage;

  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === "string") {
        errorMessage = error.response.data;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.end_time) {
        // Handle validation errors for specific fields
        if (Array.isArray(error.response.data.end_time)) {
          errorMessage = error.response.data.end_time[0].string || error.response.data.end_time[0];
        } else {
          errorMessage = error.response.data.end_time;
        }
      } else {
        // Handle general validation errors - extract first error message
        const errorKeys = Object.keys(error.response.data);
        if (errorKeys.length > 0) {
          const firstErrorKey = errorKeys[0];
          const firstError = error.response.data[firstErrorKey];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0].string || firstError[0] || `${firstErrorKey}: ${firstError[0]}`;
          } else {
            errorMessage = firstError || `${firstErrorKey}: ${firstError}`;
          }
        }
      }
    }
  } else if (error.request) {
    errorMessage = "Network error: Unable to connect to server";
  } else {
    errorMessage = error.message || defaultMessage;
  }

  setMessage(errorMessage);
  setMessageType("error");
};

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
    fetchDrivers();
    fetchBatteryAssignments();
    fetchDriverAssignments();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}driver/drivers/`);
      setDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      handleError(err, "Failed to fetch drivers");
    }
  };

  const fetchBatteryAssignments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}batteryAssignment/assignments/`);
      console.log("Battery Assignments Response:", res.data);
      setBatteryAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching battery assignments:", err);
      handleError(err, "Failed to fetch battery assignments");
    }
  };

  const fetchDriverAssignments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}driverAssignment/get_all_assignments/`
      );
      console.log("Driver Assignments Response:", res.data);
      const allAssignments = Array.isArray(res.data.data) ? res.data.data : [];

      // Separate current and past assignments
      const current = allAssignments.filter(
        (assignment) =>
          assignment.status === "assigned" ||
          assignment.status === "in_progress"
      );
      const past = allAssignments.filter(
        (assignment) =>
          assignment.status === "completed" || assignment.status === "cancelled"
      );

      setCurrentAssignments(current);
      setPastAssignments(past);
    } catch (err) {
      console.error("Error fetching driver assignments:", err);
      handleError(err, "Failed to fetch driver assignments");
    }
  };

 const handleAssignDriver = async () => {
  if (
    !selectedDriver ||
    !selectedAssignment ||
    !startDate ||
    !startTime ||
    !fromLocation ||
    !toLocation
  ) {
    setMessage("Please fill all required fields");
    setMessageType("error");
    return;
  }

  try {
    const assignmentData = {
      driver: selectedDriver,
      battery_assignment: selectedAssignment,
      origin: fromLocation,
      destination: toLocation,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate || null,
      end_time: endTime || null,
      status: "assigned",
    };

    const res = await axios.post(
      `${BASE_URL}driverAssignment/create/`,
      assignmentData
    );

    setMessage("Driver assigned successfully");
    setMessageType("success");

    // Reset form (add the new time fields to reset)
    setSelectedDriver("");
    setSelectedAssignment("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setFromLocation("");
    setToLocation("");

    // Refresh assignments
    fetchDriverAssignments();
  } catch (err) {
    console.error("Error assigning driver:", err);
    console.error("Error response data:", err.response?.data);
    console.error("Error response status:", err.response?.status);
    
    // Handle specific validation errors
    if (err.response && err.response.status === 400 && err.response.data) {
      const errorData = err.response.data;
      console.log("Full error data:", errorData);
      
      // Try to extract validation error messages
      let errorMessage = "Validation failed";
      
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData.errors) {
        // Handle the errors object structure
        const errors = errorData.errors;
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
          const firstErrorKey = errorKeys[0];
          const firstError = errors[firstErrorKey];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = firstError;
          }
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        // Handle other validation errors
        const errorKeys = Object.keys(errorData);
        if (errorKeys.length > 0) {
          const firstError = errorData[errorKeys[0]];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = firstError;
          }
        }
      }
      
      setMessage(errorMessage);
      setMessageType("error");
    } else {
      handleError(err, "Failed to assign driver");
    }
  }
};

  const handleEndAssignment = (assignmentId) => {
  setSelectedAssignmentId(assignmentId);
  setShowEndModal(true);
};

const handleConfirmEndAssignment = async () => {
  if (!distanceCovered || !moneyPaid) {
    setMessage("Please fill in both distance covered and money paid");
    setMessageType("error");
    return;
  }

  try {
    await axios.patch(`${BASE_URL}driverAssignment/update-status/${selectedAssignmentId}/`, {
      status: "completed",
      distance_covered: parseFloat(distanceCovered),
      amount_paid: parseFloat(moneyPaid),
    });

    setMessage("Assignment ended successfully");
    setMessageType("success");
    
    // Reset modal state
    setShowEndModal(false);
    setSelectedAssignmentId(null);
    setDistanceCovered("");
    setMoneyPaid("");
    
    fetchDriverAssignments();
  } catch (err) {
    console.error("Error ending assignment:", err);
    handleError(err, "Failed to end assignment");
  }
};

// Add this new function for canceling the modal
const handleCancelEndAssignment = () => {
  setShowEndModal(false);
  setSelectedAssignmentId(null);
  setDistanceCovered("");
  setMoneyPaid("");
};

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const EndAssignmentModal = () => {
  if (!showEndModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">
          End Assignment & Record Trip
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Distance Covered (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full text-gray-500 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter distance in km"
              value={distanceCovered}
              onChange={(e) => setDistanceCovered(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Money Paid (RWF) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              className="w-full p-3 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount in RWF"
              value={moneyPaid}
              onChange={(e) => setMoneyPaid(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancelEndAssignment}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmEndAssignment}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Confirm End Trip
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          Driver Assignment Management
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
            </div>
          </div>
        )}

        {/* Create New Assignment Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Create New Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Select Driver <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">Select Driver</option>
                {drivers
                  .filter((driver) => driver.status === "available")
                  .map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.license_number})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Select Vehicle & Battery <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
              >
                <option value="">Select Vehicle & Battery</option>
                {batteryAssignments
                  .filter((assignment) => assignment.vehicle_details.status === "online")
                  .filter((assignment) => assignment.status === "active")
                  .map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.vehicle_details?.name} (
                      {assignment.vehicle_details?.rol_number}) - Battery:{" "}
                      {assignment.battery_details?.rol_number} (
                      {assignment.battery_details?.current_charge}%)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full p-3 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full p-3 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                End Date (Optional)
              </label>
              <input
                type="date"
                className="w-full p-3 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                End Time (Optional)
              </label>
              <input
                type="time"
                className="w-full p-3 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                From Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full text-gray-500 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Kacyiru"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">
                To Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Remera"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleAssignDriver}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Assign Driver
            </button>
          </div>
        </div>

        {/* Current Assignments Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-700 mb-6">
            Current Assignments
          </h2>

          {currentAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No current assignments found
            </div>
          ) : (
            <div className="space-y-4">
              {currentAssignments.map((assignment) => {
                // Access nested data directly from the assignment object
                const driver = assignment.driver;
                const batteryAssignment = assignment.battery_assignment;
                const vehicle = batteryAssignment?.vehicle;
                const battery = batteryAssignment?.battery;

                return (
                  <div
                    key={assignment.id}
                    className="border border-gray-300 rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                          Assignment ID: A
                          {assignment.id.toString().padStart(4, "0")}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Vehicle:
                            </span>
                            <span className="text-gray-600">
                              {vehicle?.name || "N/A"} (
                              {vehicle?.rol_number || "N/A"})
                            </span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Driver:
                            </span>
                            <span className="text-gray-600">
                              {driver?.name || "N/A"} (
                              {driver?.license_number || "N/A"})
                            </span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Period:
                            </span>
                            <span className="text-gray-600">
                              {new Date(
                                assignment.start_date
                              ).toLocaleDateString("en-US")}{" "}
                              {assignment.start_time} to{" "}
                              {assignment.end_date
                                ? `${new Date(
                                    assignment.end_date
                                  ).toLocaleDateString("en-US")} ${
                                    assignment.end_time || ""
                                  }`
                                : "Ongoing"}
                            </span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Route:
                            </span>
                            <span className="text-gray-600">
                              {assignment.origin} to {assignment.destination}
                            </span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Start Battery:
                            </span>
                            <span className="text-gray-600">
                              {battery?.current_charge || 0}%
                            </span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Expected Distance:
                            </span>
                            <span className="text-gray-600">0.0 km</span>
                          </div>

                          <div className="flex">
                            <span className="font-medium text-gray-700 w-32">
                              Status:
                            </span>
                            <span className="text-green-600 font-medium">
                              {assignment.status === "assigned"
                                ? "Active"
                                : assignment.status === "in_progress"
                                ? "In Progress"
                                : assignment.status}
                            </span>
                          </div>

                          <div className="">
                            <button
                              onClick={() => handleEndAssignment(assignment.id)}
                              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                            >
                              End Assignment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Assignments Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-indigo-700 mb-6">
            Past Assignments
          </h2>

          {pastAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No past assignments found
            </div>
          ) : (
            <div className="space-y-4">
              {pastAssignments.map((assignment) => {
                // Access nested data directly from the assignment object
                const driver = assignment.driver;
                const batteryAssignment = assignment.battery_assignment;
                const vehicle = batteryAssignment?.vehicle;
                const battery = batteryAssignment?.battery;

                return (
                  <div
                    key={assignment.id}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                        Assignment ID: A
                        {assignment.id.toString().padStart(4, "0")}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Vehicle:
                          </span>
                          <span className="text-gray-600">
                            {vehicle?.name || "N/A"} (
                            {vehicle?.rol_number || "N/A"})
                          </span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Driver:
                          </span>
                          <span className="text-gray-600">
                            {driver?.name || "N/A"} (
                            {driver?.license_number || "N/A"})
                          </span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Period:
                          </span>
                          <span className="text-gray-600">
                            {new Date(assignment.start_date).toLocaleDateString(
                              "en-US"
                            )}{" "}
                            {assignment.start_time} to{" "}
                            {assignment.end_date
                              ? `${new Date(
                                  assignment.end_date
                                ).toLocaleDateString("en-US")} ${
                                  assignment.end_time || ""
                                }`
                              : "N/A"}
                          </span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Route:
                          </span>
                          <span className="text-gray-600">
                            {assignment.origin} to {assignment.destination}
                          </span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Start Battery:
                          </span>
                          <span className="text-gray-600">
                            {battery?.current_charge || 0}%
                          </span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Distance Covered:
                          </span>
                          <span className="text-gray-600">{assignment.distance_covered || "0"} km</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Money Paid
                          </span>
                          <span className="text-gray-600">{assignment.money_paid || "0"} frw</span>
                        </div>

                        <div className="flex">
                          <span className="font-medium text-gray-700 w-32">
                            Status:
                          </span>
                          <span
                            className={`font-medium ${
                              assignment.status === "completed"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {assignment.status === "completed"
                              ? "Completed"
                              : "Cancelled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <EndAssignmentModal />
    </div>
  );
}

export default Manage_DriverAssignments;
