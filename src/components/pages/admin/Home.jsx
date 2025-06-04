/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faBolt,
  faFileExport,
  faFilePdf,
  faFileExcel,
  faCar,
  faUsers,
  faBatteryHalf,
  faTools,
  faChartLine,
  faMapMarkerAlt,
  faGasPump,
  faExclamationTriangle,
  faBatteryEmpty,
  faCheckCircle,
  faClock,
  faWrench,
  faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";

function AdminDashboard() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [batteryAssignments, setBatteryAssignments] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [batteriesData, setBatteriesData] = useState([]);
  const [driverAssignments, setDriverAssignments] = useState([]);
  const [vehicleUnderMaintenance, setVehicleUnderMaintenance] = useState([]);
  const [vehicleBatteryLevel, setVehicleBatteryLevel] = useState([]);
  const [driversData, setDriversData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
    
  const [reportStats, setReportStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    totalRevenue: 0
  });

  const BASE_URL = "http://127.0.0.1:8000/";

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
    fetchDriverAssignments();
    fetchVehicles();
    fetchVehicleBatteryCurrentCharge();
    fetchDrivers();
    fetchBatteryAssignment();
    fetchBatteries();
    fetchVehiclesUnderMaintenance();
  }, []);

  const fetchDriverAssignments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}driverAssignment/get_all_assignments/`
      );
      console.log("Driver Assignments Response:", res.data);
      const allAssignments = Array.isArray(res.data.data) ? res.data.data : [];
      setDriverAssignments(allAssignments);

      // Calculate report statistics
      const activeAssignments = allAssignments.filter(
        (assignment) => assignment.status === "assigned"
      ).length;

      const completedAssignments = allAssignments.filter(
        (assignment) => assignment.status === "completed"
      ).length;

      // Calculate total revenue from completed trips (placeholder calculation)
      const totalRevenue = completedAssignments * 50; // Assuming $50 per completed trip

      setReportStats({
        totalAssignments: allAssignments.length,
        activeAssignments: activeAssignments,
        completedAssignments: completedAssignments,
        totalRevenue: totalRevenue
      });

      setMessage("Report data loaded successfully");
      setMessageType("success");
    } catch (err) {
      console.error("Error fetching driver assignments:", err);
      handleError(err, "Failed to fetch driver assignments");
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}vehicle/list_vehicles/`);
      console.log("Vehicles fetched successfully:", res.data);
      setVehiclesData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchVehiclesUnderMaintenance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}vehicle/maintenance-vehicles/`);
      console.log("Vehicles under maintenance:", res.data);
      setVehicleUnderMaintenance(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchVehicleBatteryCurrentCharge = async () => {
    try {
      const res = await axios.get(`${BASE_URL}vehicle/vehicle-battery-levels/`);
      console.log("Vehicles current battery charges:", res.data);
      setVehicleBatteryLevel(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        "Error fetching vehicles battery current charge levels:",
        err
      );
    }
  };

  const fetchDrivers = async (isRefresh = false) => {
    try {
      const response = await fetch(`${BASE_URL}driver/drivers/`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Drivers fetched successfully:", data);
        setMessage("Drivers loaded successfully");
        setDriversData(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || "Failed to fetch drivers";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setMessage(err.message || "Failed to load drivers. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatteries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}battery/batteries/`);
      console.log("Batteries fetched successfully:", res.data);
      setBatteriesData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching batteries:", err);
      handleError(err, "Failed to fetch batteries");
    }
  };

  const fetchBatteryAssignment = async () => {
    try {
      const res = await axios.get(`${BASE_URL}batteryAssignment/assignments/`);
      console.log("Battery Assignments fetched successfully:", res.data);
      setBatteryAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching Assignments:", err);
      handleError(err, "Failed to fetch assignments");
    }
  };

  // Enhanced statistics calculations
  const getEnhancedStats = () => {
    // Vehicle statistics
    const onlineVehicles = vehiclesData.filter(v => v.status === 'online').length;
    const offlineVehicles = vehiclesData.filter(v => v.status === 'offline').length;
    const maintenanceVehicles = vehiclesData.filter(v => v.status === 'maintenance').length;
    
    // Driver statistics
    const availableDrivers = driversData.filter(d => d.status === 'available').length;
    const assignedDrivers = driversData.filter(d => d.status === 'assigned').length;
    
    // Assignment statistics
    const assignedStatusCount = driverAssignments.filter(a => a.status === 'assigned').length;
    const completedStatusCount = driverAssignments.filter(a => a.status === 'completed').length;
    
    // Battery statistics - considering batteries with charge < 20% as low
    const lowBatteries = batteriesData.filter(b => {
      const chargePercentage = (parseFloat(b.current_charge) / parseFloat(b.capacity)) * 100;
      return chargePercentage < 20;
    }).length;
    
    return {
      // Vehicle stats
      totalVehicles: vehiclesData.length,
      onlineVehicles,
      offlineVehicles,
      maintenanceVehicles,
      
      // Driver stats
      totalDrivers: driversData.length,
      availableDrivers,
      assignedDrivers,
      
      // Assignment stats
      totalAssignments: driverAssignments.length,
      assignedStatusCount,
      completedStatusCount,
      
      // Battery stats
      totalBatteries: batteriesData.length,
      lowBatteries
    };
  };

  // Chart data processing based on real data
  const getVehicleStatusData = () => {
    const statusCounts = vehiclesData.reduce((acc, vehicle) => {
      const status = vehicle.status_display;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'Online' ? '#10B981' : status === 'Under Maintenance' ? '#F59E0B' : '#6B7280'
    }));
  };

  const getDriverStatusData = () => {
    const statusCounts = driversData.reduce((acc, driver) => {
      const status = driver.status === 'available' ? 'Available' : 
                   driver.status === 'assigned' ? 'Assigned' : 'Other';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'Available' ? '#10B981' : status === 'Assigned' ? '#3B82F6' : '#6B7280'
    }));
  };

  const getAssignmentStatusData = () => {
    const statusCounts = driverAssignments.reduce((acc, assignment) => {
      const status = assignment.status_display || assignment.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      assignments: count
    }));
  };

  const getBatteryLevelData = () => {
    return batteriesData.map(battery => ({
      name: battery.rol_number,
      'Current Charge': parseFloat(battery.current_charge),
      'Capacity': parseFloat(battery.capacity),
      'Charge Percentage': (parseFloat(battery.current_charge) / parseFloat(battery.capacity)) * 100
    }));
  };

  const getVehicleTypeData = () => {
    const typeCounts = vehiclesData.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
      color: type === 'Scooter' ? '#8B5CF6' : type === 'Car' ? '#EF4444' : '#6B7280'
    }));
  };

  const getDriverTripsData = () => {
    return driversData.map(driver => ({
      name: driver.name,
      'Trips Covered': driver.trips_covered
    }));
  };

  // Time-based data for line charts
  const getVehicleGrowthData = () => {
    const vehiclesByMonth = vehiclesData.reduce((acc, vehicle) => {
      const date = new Date(vehicle.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(vehiclesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        vehicles: count
      }));
  };

  const getDriverGrowthData = () => {
    const driversByMonth = driversData.reduce((acc, driver) => {
      const date = new Date(driver.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(driversByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        drivers: count
      }));
  };

  const getAssignmentTrendData = () => {
    const assignmentsByMonth = driverAssignments.reduce((acc, assignment) => {
      const date = new Date(assignment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(assignmentsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        assignments: count
      }));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

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

  const stats = getEnhancedStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          Fleet Management Dashboard
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

        {/* Enhanced Key Metrics Summary Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">
            Fleet Overview & Key Metrics
          </h2>
          
          {/* Assignment Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Assignment Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Assignments</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</p>
                  </div>
                  <FontAwesomeIcon icon={faFileExport} className="text-blue-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Assigned Status</h4>
                    <p className="text-2xl font-bold text-yellow-600">{stats.assignedStatusCount}</p>
                  </div>
                  <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Completed Status</h4>
                    <p className="text-2xl font-bold text-green-600">{stats.completedStatusCount}</p>
                  </div>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Success Rate</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalAssignments > 0 ? Math.round((stats.completedStatusCount / stats.totalAssignments) * 100) : 0}%
                    </p>
                  </div>
                  <FontAwesomeIcon icon={faTachometerAlt} className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Vehicle Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</h4>
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalVehicles}</p>
                  </div>
                  <FontAwesomeIcon icon={faCar} className="text-indigo-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Online Vehicles</h4>
                    <p className="text-2xl font-bold text-green-600">{stats.onlineVehicles}</p>
                  </div>
                  <FontAwesomeIcon icon={faBolt} className="text-green-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Offline Vehicles</h4>
                    <p className="text-2xl font-bold text-red-600">{stats.offlineVehicles}</p>
                  </div>
                  <FontAwesomeIcon icon={faGasPump} className="text-red-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Under Maintenance</h4>
                    <p className="text-2xl font-bold text-orange-600">{stats.maintenanceVehicles}</p>
                  </div>
                  <FontAwesomeIcon icon={faWrench} className="text-orange-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Driver Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Driver Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Drivers</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalDrivers}</p>
                  </div>
                  <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Available Drivers</h4>
                    <p className="text-2xl font-bold text-green-600">{stats.availableDrivers}</p>
                  </div>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Assigned Drivers</h4>
                    <p className="text-2xl font-bold text-yellow-600">{stats.assignedDrivers}</p>
                  </div>
                  <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Utilization Rate</h4>
                    <p className="text-2xl font-bold text-gray-600">
                      {stats.totalDrivers > 0 ? Math.round((stats.assignedDrivers / stats.totalDrivers) * 100) : 0}%
                    </p>
                  </div>
                  <FontAwesomeIcon icon={faTachometerAlt} className="text-gray-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Battery Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Battery Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Batteries</h4>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalBatteries}</p>
                  </div>
                  <FontAwesomeIcon icon={faBatteryHalf} className="text-blue-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Low Batteries (&lt;20%)</h4>
                    <p className="text-2xl font-bold text-red-600">{stats.lowBatteries}</p>
                  </div>
                  <FontAwesomeIcon icon={faBatteryEmpty} className="text-red-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Healthy Batteries</h4>
                    <p className="text-2xl font-bold text-green-600">{stats.totalBatteries - stats.lowBatteries}</p>
                  </div>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Growth Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-2 text-blue-600" />
              Vehicle Growth Trend
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monthly vehicle registration growth over time
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getVehicleGrowthData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="vehicles" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Driver Growth Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
              Driver Growth Trend
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monthly driver registration growth over time
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getDriverGrowthData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="drivers" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignment Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-2 text-purple-600" />
              Assignment Trend
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Monthly assignment creation trend
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getAssignmentTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="assignments" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faCar} className="mr-2 text-blue-600" />
              Vehicle Status Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Current status distribution of all vehicles
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getVehicleStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getVehicleStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Driver Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
              Driver Status Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Current availability status of all drivers
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getDriverStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getDriverStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignment Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faFileExport} className="mr-2 text-orange-600" />
              Assignment Status Overview
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Distribution of assignment statuses
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getAssignmentStatusData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assignments" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Battery and Vehicle Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Battery Levels Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faBatteryHalf} className="mr-2 text-yellow-600" />
              Battery Charge Levels
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Current charge levels vs capacity for all batteries
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getBatteryLevelData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value.toFixed(1)}${name === 'Charge Percentage' ? '%' : ' kWh'}`, 
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="Current Charge" fill="#10B981" />
                  <Bar dataKey="Capacity" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faCar} className="mr-2 text-purple-600" />
              Vehicle Type Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Distribution of vehicles by type
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getVehicleTypeData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getVehicleTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Driver Performance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faTachometerAlt} className="mr-2 text-indigo-600" />
            Driver Performance - Trips Covered
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Number of trips covered by each driver
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDriverTripsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Trips Covered" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

       

        {/* Footer Summary */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Fleet Management System</h3>
            <p className="text-indigo-100 mb-4">
              Comprehensive overview of your fleet operations and performance metrics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                <div className="text-indigo-200 text-sm">Total Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalDrivers}</div>
                <div className="text-indigo-200 text-sm">Active Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                <div className="text-indigo-200 text-sm">Total Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalBatteries}</div>
                <div className="text-indigo-200 text-sm">Battery Units</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;