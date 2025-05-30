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
  faInfoCircle,
  faClipboardList,
  faTruckLoading,
  faUserTie,
  faBoxOpen,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faChartPie,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
        <div className="p-4 text-blue-100 bg-blue-900 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Customer_Manage_Deliveries() {
  const [deliveryData, setDeliveryData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveriesPerPage, setDeliveriesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const navigate = useNavigate();

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#F9F871"];
  const BASE_URL = "http://127.0.0.1:8000/delivery/";
  const DRIVER_URL = "http://127.0.0.1:8000/driver/drivers/";
  const VEHICLE_URL = "http://127.0.0.1:8000/vehicle/list_vehicles/";
  const ORDER_URL = "http://127.0.0.1:8000/order/orders/";

  const token = localStorage.getItem("token");

  // For filters
  const [activeFilters, setActiveFilters] = useState({
    status: [],
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modified fetchDeliveries function
  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}customer/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Deliveries fetched:", res.data);
      setDeliveryData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to fetch deliveries";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  // Modified fetchDrivers function
  const fetchDrivers = async () => {
    try {
      const res = await axios.get(DRIVER_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Drivers fetched:", res.data);

      // Handle direct array response for drivers
      const driversData = Array.isArray(res.data) ? res.data : [];
      setDrivers(driversData);
      return driversData;
    } catch (err) {
      console.error("Error fetching drivers:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to fetch drivers";
      setMessage(errorMessage);
      setMessageType("error");
      return [];
    }
  };

  // Modified fetchVehicles function
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(VEHICLE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Vehicles fetched:", res.data);

      // Handle direct array response for vehicles
      const vehiclesData = Array.isArray(res.data) ? res.data : [];
      setVehicles(vehiclesData);
      return vehiclesData;
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to fetch vehicles";
      setMessage(errorMessage);
      setMessageType("error");
      return [];
    }
  };

  // Modified fetchOrders function
  const fetchOrders = async () => {
    try {
      const res = await axios.get(ORDER_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Orders fetched:", res.data);

      // Handle wrapped response for orders - check if data property exists
      const ordersData = res.data.data
        ? Array.isArray(res.data.data)
          ? res.data.data
          : []
        : Array.isArray(res.data)
        ? res.data
        : [];
      setOrders(ordersData);
      return ordersData;
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to fetch orders";
      setMessage(errorMessage);
      setMessageType("error");
      return [];
    }
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Load all data on component mount
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchDeliveries(),
          fetchDrivers(),
          fetchVehicles(),
          fetchOrders(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to load initial data";
        setMessage(errorMessage);
        setMessageType("error");
      }
    };

    loadAllData();
  }, [navigate]);

  // Modified openModal function
  const openModal = async (delivery = null) => {
    try {
      // Set the current delivery first
      setCurrentDelivery(delivery);

      // Show loading state
      setMessage("Loading data...");
      setMessageType("info");

      console.log("Starting to fetch data for modal...");

      // Fetch fresh data and wait for all requests to complete
      const [driversData, vehiclesData, ordersData] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
        fetchOrders(),
      ]);

      console.log("Data fetching completed. Results:", {
        driversData: driversData,
        vehiclesData: vehiclesData,
        ordersData: ordersData,
      });

      // Clear any loading messages
      setMessage("");

      // Small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Open modal only after data is loaded
      setIsModalOpen(true);

      console.log("Modal opened with fresh data:", {
        driversCount: driversData.length,
        vehiclesCount: vehiclesData.length,
        ordersCount: ordersData.length,
      });
    } catch (error) {
      console.error("Error loading modal data:", {
        error: error,
        response: error.response,
        message: error.message,
        stack: error.stack,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to load data for modal";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  // Alternative: Modified renderModal to use local state if needed
  const renderModal = () => {
    if (!isModalOpen) return null;

    // Use the current state data
    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed"
    );
    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "active"
    );
    const availableDrivers = drivers.filter(
      (driver) => driver.status === "approved"
    );

    // Debug logs
    console.log("Modal Render - Current State:", {
      orders: orders,
      vehicles: vehicles,
      drivers: drivers,
      confirmedOrders: confirmedOrders,
      activeVehicles: activeVehicles,
      availableDrivers: availableDrivers,
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-96 max-h-[90vh] overflow-y-auto border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-blue-500">
            {currentDelivery ? "Update Delivery" : "Add New Delivery"}
          </h2>

          {/* Debug info display */}
          <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-300">
            <p>
              Debug: Orders: {orders.length}, Vehicles: {vehicles.length},
              Drivers: {drivers.length}
            </p>
            <p>
              Filtered: Orders: {confirmedOrders.length}, Vehicles:{" "}
              {activeVehicles.length}, Drivers: {availableDrivers.length}
            </p>
          </div>

          <form onSubmit={handleAddUpdateDelivery}>
            <div className="space-y-4">
              {/* Order Dropdown */}
              <div>
                <label className="block text-gray-300 mb-2">
                  Order ({confirmedOrders.length} available)
                </label>
                <select
                  name="order"
                  defaultValue={currentDelivery?.order || ""}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="">Select an order</option>
                  {confirmedOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.origin} -{" "}
                      {order.warehouse_detail?.location || "N/A"} (Qty:{" "}
                      {order.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Dropdown */}
              {/* <div>
                <label className="block text-gray-300 mb-2">
                  Vehicle ({activeVehicles.length} available)
                </label>
                <select
                  name="vehicle"
                  defaultValue={currentDelivery?.vehicle || ""}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="">Select a vehicle</option>
                  {activeVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.type} - {vehicle.plate_number} -{" "}
                      {vehicle.relocation_size} (Status: {vehicle.status})
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Driver Dropdown */}
              {/* <div>
                <label className="block text-gray-300 mb-2">
                  Driver ({availableDrivers.length} available)
                </label>
                <select
                  name="driver"
                  defaultValue={currentDelivery?.driver || ""}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  <option value="">Select a driver</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name} -{" "}
                      {driver.phone_number} (Status: {driver.status})
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Status Dropdown */}
              <div>
                <label className="block text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={currentDelivery?.status || "in_process"}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                >
                  {/* <option value="in_process">In Process</option> */}
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentDelivery ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modified handleDelete function
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this delivery?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeliveries();
      setMessage("Delivery deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "An error occurred while deleting delivery";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#delivery-table" });
      doc.save("deliveries.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(deliveryData),
        "Deliveries"
      );
      XLSX.writeFile(workbook, "deliveries.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(deliveryData[0]).join(",") +
        "\n" +
        deliveryData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "deliveries.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  // Modified handleAddUpdateDelivery function
  const handleAddUpdateDelivery = async (e) => {
    e.preventDefault();
    try {
      const deliveryData = {
        order: e.target.order.value,
        vehicle: e.target.vehicle.value,
        driver: e.target.driver.value,
        status: e.target.status.value,
      };

      if (currentDelivery) {
        // Update existing delivery
        await axios.put(
          `${BASE_URL}update/${currentDelivery.id}/`,
          deliveryData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Delivery updated successfully");
      } else {
        // Create new delivery
        await axios.post(`${BASE_URL}create/`, deliveryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Delivery created successfully");
      }

      fetchDeliveries();
      setIsModalOpen(false);
      setCurrentDelivery(null);
      setMessageType("success");
    } catch (err) {
      console.error("Error adding/updating delivery:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.errors ||
        "An error occurred while processing delivery";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const renderCharts = () => {
    if (!deliveryData.length) return null;

    const statusData = [
      {
        name: "In Process",
        value: deliveryData.filter((d) => d.status === "in_process").length,
      },
      {
        name: "Completed",
        value: deliveryData.filter((d) => d.status === "completed").length,
      },
    ];

    const driverData = Object.entries(
      deliveryData.reduce((acc, delivery) => {
        const driverName = delivery.driver_details?.user_name || "Unknown";
        acc[driverName] = (acc[driverName] || 0) + 1;
        return acc;
      }, {})
    ).map(([driver, count]) => ({ driver, count }));

    return (
      <div className="w-full space-y-6 md:space-y-6 lg:space-y-0 lg:flex lg:flex-row lg:gap-6">
        <ErrorBoundary>
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 mb-6 lg:mb-0">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faTruckLoading} className="mr-2" />
              Delivery Status Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faUserTie} className="mr-2" />
              Deliveries by Driver
            </h3>
            <ResponsiveContainer>
              <BarChart data={driverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="driver"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Deliveries"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const searchFilteredData = deliveryData.filter((delivery) =>
    [
      delivery.order_details?.origin,
      delivery.driver_details?.user_name,
      delivery.vehicle_details?.plate_number,
      delivery.status,
      delivery.warehouse?.warehouse_detail?.location,
    ].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const applyFilters = (data) => {
    return data.filter((delivery) => {
      if (
        activeFilters.status.length > 0 &&
        !activeFilters.status.includes(delivery.status)
      ) {
        return false;
      }
      return true;
    });
  };

  const filteredAndSortedData = applyFilters(searchFilteredData);

  const currentDeliveries = filteredAndSortedData.slice(
    (currentPage - 1) * deliveriesPerPage,
    currentPage * deliveriesPerPage
  );

  const getSummaryStats = () => {
    if (!deliveryData.length) return {};

    const inProcessCount = deliveryData.filter(
      (d) => d.status === "in_process"
    ).length;
    const completedCount = deliveryData.filter(
      (d) => d.status === "completed"
    ).length;

    return {
      totalDeliveries: deliveryData.length,
      inProcessCount,
      completedCount,
    };
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(
          (item) => item !== value
        );
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      status: [],
    });
  };

  const getFilterOptions = () => {
    const statuses = [...new Set(deliveryData.map((d) => d.status))];
    return { statuses };
  };

  const renderSummaryCards = () => {
    const stats = getSummaryStats();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-lg shadow-md p-4 border border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Deliveries</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.totalDeliveries}
              </h3>
            </div>
            <div className="bg-blue-800 p-3 rounded-full">
              <FontAwesomeIcon
                icon={faTruckLoading}
                className="text-white text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-md p-4 border border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">In Process</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.inProcessCount}
              </h3>
            </div>
            <div className="bg-blue-800 p-3 rounded-full">
              <FontAwesomeIcon
                icon={faBoxOpen}
                className="text-white text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-lg shadow-md p-4 border border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Completed</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.completedCount}
              </h3>
            </div>
            <div className="bg-green-800 p-3 rounded-full">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-white text-xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFilterDrawer = () => {
    const filterOptions = getFilterOptions();

    return (
      <div
        className={`fixed inset-y-0 right-0 z-40 w-80 bg-gray-900 border-l border-gray-700 shadow-xl transition-transform duration-300 transform ${
          isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-blue-400 font-semibold flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Advanced Filters
            </h3>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          <div className="p-4">
            <div className="mb-6">
              <h4 className="text-gray-300 font-medium mb-2">Status</h4>
              <div className="space-y-2">
                {filterOptions.statuses.map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.status.includes(status)}
                      onChange={() => handleFilterChange("status", status)}
                      className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-gray-300 capitalize">
                      {status === "in_process" ? "In Process" : "Completed"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-center text-blue-500 font-bold text-xl mb-2">
              Manage Deliveries
            </h1>
            <p className="text-center text-gray-400 text-sm">
              View, edit and manage order deliveries from a central dashboard
            </p>
          </div>

          {message && (
            <div
              className={`text-center py-3 px-4 mb-6 rounded-lg shadow-md border ${
                messageType === "success"
                  ? "bg-green-900 text-green-100 border-green-700"
                  : messageType === "error"
                  ? "bg-red-900 text-red-100 border-red-700"
                  : "bg-blue-900 text-blue-100 border-blue-700"
              }`}
            >
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={
                    messageType === "success"
                      ? faCheckCircle
                      : messageType === "error"
                      ? faTimesCircle
                      : faInfoCircle
                  }
                  className="mr-2"
                />
                {message}
              </div>
            </div>
          )}

          {renderSummaryCards()}

          <div className="flex flex-col gap-6">
            <div className="w-full">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-blue-400 flex items-center">
                      <FontAwesomeIcon icon={faTruckLoading} className="mr-2" />
                      <span className="font-semibold">Total Deliveries:</span>
                      <span className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-full">
                        {filteredAndSortedData.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Search deliveries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <button
                      onClick={() => setIsFilterDrawerOpen(true)}
                      className="py-2 bg-gray-700 px-4 rounded-lg text-white flex items-center justify-center hover:bg-gray-600 transition duration-200 w-full sm:w-auto"
                    >
                      <FontAwesomeIcon icon={faFilter} className="mr-2" />
                      Filters
                      {Object.values(activeFilters).flat().length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                          {Object.values(activeFilters).flat().length}
                        </span>
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setDownloadMenuVisible(!downloadMenuVisible)
                        }
                        className="py-2 bg-blue-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Export
                      </button>
                      {downloadMenuVisible && (
                        <div className="absolute right-0 mt-2 bg-gray-800 text-gray-200 shadow-lg rounded-lg p-2 z-10 border border-gray-700 w-32">
                          {Object.keys(handleDownload).map((format) => (
                            <button
                              key={format}
                              onClick={() => {
                                handleDownload[format]();
                                setDownloadMenuVisible(false);
                              }}
                              className="block w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition"
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* <button
                      onClick={() => {
                        setCurrentDelivery(null);
                        openModal();
                      }}
                      className="py-2 bg-blue-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Delivery
                    </button> */}
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-700">
                  <table
                    id="delivery-table"
                    className="w-full text-sm text-left"
                  >
                    <thead className="text-xs uppercase bg-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-3 rounded-tl-lg">#</th>
                        <th className="px-6 py-3">Order Origin</th>
                        <th className="px-6 py-3">Warehouse</th>
                        <th className="px-6 py-3">Driver</th>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Created Date</th>
                        <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDeliveries.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-8 text-gray-400 bg-gray-800"
                          >
                            <div className="flex flex-col items-center">
                              <FontAwesomeIcon
                                icon={faTruckLoading}
                                className="text-4xl mb-3 text-gray-600"
                              />
                              <p>No deliveries found matching your criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentDeliveries.map((delivery, index) => (
                          <tr
                            key={delivery.id}
                            className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                          >
                            <td className="px-6 py-4 text-gray-300">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {delivery.order_details?.origin || "N/A"}
                        
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                        
                              {delivery.warehouse?.warehouse_detail?.location || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {delivery.driver?.first_name || "N/A"} - 
                              {delivery.driver_details?.user_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {delivery.vehicle_details?.plate_number || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  delivery.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {delivery.status === "completed"
                                  ? "Completed"
                                  : "In Process"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(
                                delivery.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => openModal(delivery)}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                {/* <button
                                  onClick={() => handleDelete(delivery.id)}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-300">Rows per page:</span>
                    <select
                      value={deliveriesPerPage}
                      onChange={(e) =>
                        setDeliveriesPerPage(Number(e.target.value))
                      }
                      className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {[5, 10, 30, 50, 100].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        currentPage * deliveriesPerPage >=
                        filteredAndSortedData.length
                      }
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderCharts()}
        {renderFilterDrawer()}
        {isFilterDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsFilterDrawerOpen(false)}
          ></div>
        )}
        {renderModal()}
      </div>
    </ErrorBoundary>
  );
}

export default Customer_Manage_Deliveries;
