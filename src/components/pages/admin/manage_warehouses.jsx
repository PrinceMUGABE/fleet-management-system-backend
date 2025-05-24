/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
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
  faWarehouse,
  faInfoCircle,
  faTags,
  faClipboardList,
  faMapMarkerAlt,
  faCheckCircle,
  faTimesCircle,
  faBoxes,
  faChartLine,
  faExchangeAlt,
  faHistory,
  faCogs,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faChartPie,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  AreaChart,
  Area,
  Bar,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import CategoryManagement from "./category_mangement";
import CommodityManagement from "./commodity_management";

// Custom Components
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const getDerivedStateFromError = () => {
    setHasError(true);
  };

  if (hasError) {
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
  return children;
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    running: {
      icon: faCheckCircle,
      color: "bg-green-600",
      text: "text-green-100",
      label: "Running",
    },
    closed: {
      icon: faTimesCircle,
      color: "bg-red-600",
      text: "text-red-100",
      label: "Closed",
    },
  };

  const config = statusConfig[status] || statusConfig.closed;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.text}`}
    >
      <FontAwesomeIcon icon={config.icon} className="mr-1" />
      {config.label}
    </span>
  );
};

const AvailabilityBadge = ({ status }) => {
  const statusConfig = {
    available: {
      icon: faCheckCircle,
      color: "bg-blue-600",
      text: "text-blue-100",
      label: "Available",
    },
    full: {
      icon: faTimesCircle,
      color: "bg-yellow-600",
      text: "text-yellow-100",
      label: "Full",
    },
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.text}`}
    >
      <FontAwesomeIcon icon={config.icon} className="mr-1" />
      {config.label}
    </span>
  );
};

const WarehouseCard = ({ warehouse, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FontAwesomeIcon
                icon={faWarehouse}
                className="mr-2 text-blue-400"
              />
              {warehouse.location}
            </h3>
            <div className="mt-2 flex space-x-2">
              <StatusBadge status={warehouse.status} />
              <AvailabilityBadge status={warehouse.availability_status} />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(warehouse)}
              className="text-blue-400 hover:text-blue-300 transition"
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              onClick={() => onDelete(warehouse.id)}
              className="text-red-400 hover:text-red-300 transition"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-sm">
            <p className="text-gray-400">Created</p>
            <p className="text-white">
              {new Date(warehouse.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400">Commodities</p>
            <p className="text-white">{warehouse.total_commodities || 0}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/admin/warehouses/${warehouse.id}/commodities`}
            className="inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faBoxes} className="mr-1" />
            Inventory
          </Link>
          <Link
            to={`/admin/warehouses/${warehouse.id}/movements`}
            className="inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <FontAwesomeIcon icon={faHistory} className="mr-1" />
            Movements
          </Link>
        </div>
      </div>
    </div>
  );
};

const WarehouseModal = ({
  isOpen,
  onClose,
  warehouse,
  onSubmit,
  isLoading,
}) => {
  const initialFormData = {
    location: "",
    status: "running",
    availability_status: "available",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        location: warehouse.location,
        status: warehouse.status,
        availability_status: warehouse.availability_status,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [warehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-96 border border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-blue-500">
          {warehouse ? "Update Warehouse" : "Add New Warehouse"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                placeholder="Enter warehouse location"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="running">Running</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Availability Status
              </label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="available">Available</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {warehouse ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FilterDrawer = ({
  isOpen,
  onClose,
  filterOptions,
  activeFilters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-80 bg-gray-900 border-l border-gray-700 shadow-xl transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-blue-400 font-semibold flex items-center">
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Advanced Filters
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
                    onChange={() => onFilterChange("status", status)}
                    className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-gray-300 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-gray-300 font-medium mb-2">
              Availability Status
            </h4>
            <div className="space-y-2">
              {filterOptions.availabilityStatuses.map((availability) => (
                <label key={availability} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.availability_status.includes(
                      availability
                    )}
                    onChange={() =>
                      onFilterChange("availability_status", availability)
                    }
                    className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-gray-300 capitalize">
                    {availability}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-gray-300 font-medium mb-2">Location</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.locations.map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters.location.includes(location)}
                    onChange={() => onFilterChange("location", location)}
                    className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-gray-300">{location}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color, trend }) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div
      className={`bg-gradient-to-r ${color.from} ${color.to} rounded-lg shadow-md p-4 border ${color.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${color.text} text-sm`}>{title}</p>
          <h3 className="text-white text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={`text-xs mt-1 ${trendColors[trend.direction]}`}>
              {trendIcons[trend.direction]} {trend.value} {trend.unit}
            </p>
          )}
        </div>
        <div className={`${color.iconBg} p-3 rounded-full`}>
          <FontAwesomeIcon icon={icon} className="text-white text-xl" />
        </div>
      </div>
    </div>
  );
};



const WarehouseManagement = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [warehousesPerPage, setWarehousesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const navigate = useNavigate();

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#F9F871"];
  const BASE_URL = "http://127.0.0.1:8000/warehouse/";
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("warehouses");

  // Filters state
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    availability_status: [],
    location: [],
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch data with error handling
  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}warehouses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouseData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setMessage("Failed to fetch warehouses");
      setMessageType("error");
    } finally {
      setIsLoading(false);
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
    fetchWarehouses();
  }, [navigate]);

  // Handle warehouse operations
  // Handle warehouse operations
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWarehouses();
      setMessage("Warehouse deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete warehouse");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUpdateWarehouse = async (formData) => {
    try {
      setIsLoading(true);
      if (currentWarehouse) {
        // Update existing warehouse
        await axios.put(`${BASE_URL}${currentWarehouse.id}/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Warehouse updated successfully");
      } else {
        // Create new warehouse
        await axios.post(`${BASE_URL}create/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Warehouse created successfully");
      }

      await fetchWarehouses();
      setIsModalOpen(false);
      setCurrentWarehouse(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "An error occurred");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Download handlers
  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.text("Warehouses Report", 14, 16);
      doc.autoTable({
        head: [["Location", "Status", "Availability", "Created At"]],
        body: filteredAndSortedData.map((warehouse) => [
          warehouse.location,
          warehouse.status,
          warehouse.availability_status,
          new Date(warehouse.created_at).toLocaleDateString(),
        ]),
        startY: 22,
      });
      doc.save("warehouses-report.pdf");
    },
    Excel: () => {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredAndSortedData.map((w) => ({
          Location: w.location,
          Status: w.status,
          Availability: w.availability_status,
          "Created At": new Date(w.created_at).toLocaleDateString(),
          "Total Commodities": w.total_commodities || 0,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses");
      XLSX.writeFile(workbook, "warehouses-report.xlsx");
    },
    CSV: () => {
      const csvContent = [
        ["Location", "Status", "Availability", "Created At", "Commodities"],
        ...filteredAndSortedData.map((w) => [
          w.location,
          w.status,
          w.availability_status,
          new Date(w.created_at).toLocaleDateString(),
          w.total_commodities || 0,
        ]),
      ]
        .map((e) => e.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "warehouses-report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };

  // Filter and search functions
  const getFilterOptions = () => {
    const statuses = [...new Set(warehouseData.map((w) => w.status))];
    const availabilityStatuses = [
      ...new Set(warehouseData.map((w) => w.availability_status)),
    ];
    const locations = [...new Set(warehouseData.map((w) => w.location))];
    return { statuses, availabilityStatuses, locations };
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      status: [],
      availability_status: [],
      location: [],
    });
  };

  // Data processing
  const searchFilteredData = warehouseData.filter((warehouse) =>
    Object.values(warehouse).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredAndSortedData = searchFilteredData.filter((warehouse) => {
    if (
      activeFilters.status.length > 0 &&
      !activeFilters.status.includes(warehouse.status)
    ) {
      return false;
    }
    if (
      activeFilters.availability_status.length > 0 &&
      !activeFilters.availability_status.includes(warehouse.availability_status)
    ) {
      return false;
    }
    if (
      activeFilters.location.length > 0 &&
      !activeFilters.location.includes(warehouse.location)
    ) {
      return false;
    }
    return true;
  });

  const currentWarehouses = filteredAndSortedData.slice(
    (currentPage - 1) * warehousesPerPage,
    currentPage * warehousesPerPage
  );

  const getSummaryStats = () => {
    if (!warehouseData.length) return {};

    const runningCount = warehouseData.filter(
      (w) => w.status === "running"
    ).length;
    const availableCount = warehouseData.filter(
      (w) => w.availability_status === "available"
    ).length;
    const uniqueLocations = [...new Set(warehouseData.map((w) => w.location))];
    const newestWarehouse = [...warehouseData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    return {
      totalWarehouses: warehouseData.length,
      runningWarehouses: runningCount,
      availableWarehouses: availableCount,
      uniqueLocations: uniqueLocations.length,
      newestWarehouse: newestWarehouse
        ? {
            location: newestWarehouse.location,
            date: new Date(newestWarehouse.created_at).toLocaleDateString(),
          }
        : null,
    };
  };

  const renderCharts = () => {
    if (!warehouseData.length) return null;

    const statusData = Object.entries(
      warehouseData.reduce((acc, warehouse) => {
        acc[warehouse.status] = (acc[warehouse.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, value]) => ({ name: status, value }));

    const availabilityData = Object.entries(
      warehouseData.reduce((acc, warehouse) => {
        acc[warehouse.availability_status] =
          (acc[warehouse.availability_status] || 0) + 1;
        return acc;
      }, {})
    ).map(([availability, count]) => ({
      name: availability,
      count,
    }));

    return (
      <div className="w-full space-y-6 md:space-y-6 lg:space-y-0 lg:flex lg:flex-row lg:gap-6">
        <ErrorBoundary>
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 mb-6 lg:mb-0">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Warehouse Status Distribution
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} warehouses`, "Count"]}
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
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Warehouse Availability
            </h3>
            <ResponsiveContainer>
              <BarChart data={availabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#e5e7eb" }} />
                <YAxis tick={{ fill: "#e5e7eb" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  name="Warehouse Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-blue-600 text-white">
          <tr>
            <th className="px-6 py-3 rounded-tl-lg">#</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Availability</th>
            <th className="px-6 py-3">Commodities</th>
            <th className="px-6 py-3">Created At</th>
            <th className="px-6 py-3 rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentWarehouses.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-gray-400 bg-gray-800"
              >
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon
                    icon={faWarehouse}
                    className="text-4xl mb-3 text-gray-600"
                  />
                  <p>No warehouses found matching your criteria</p>
                </div>
              </td>
            </tr>
          ) : (
            currentWarehouses.map((warehouse, index) => (
              <tr
                key={warehouse.id}
                className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition duration-200"
              >
                <td className="px-6 py-4 text-gray-300">
                  {(currentPage - 1) * warehousesPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  {warehouse.location}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={warehouse.status} />
                </td>
                <td className="px-6 py-4">
                  <AvailabilityBadge status={warehouse.availability_status} />
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {warehouse.total_commodities || 0}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(warehouse.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setCurrentWarehouse(warehouse);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <Link
                      to={`/admin/warehouses/${warehouse.id}/commodities`}
                      className="text-green-400 hover:text-green-300 transition"
                      title="View Inventory"
                    >
                      <FontAwesomeIcon icon={faBoxes} />
                    </Link>
                    <Link
                      to={`/admin/warehouses/${warehouse.id}/movements`}
                      className="text-purple-400 hover:text-purple-300 transition"
                      title="View Movements"
                    >
                      <FontAwesomeIcon icon={faHistory} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentWarehouses.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faWarehouse}
              className="text-4xl mb-3 text-gray-600"
            />
            <p>No warehouses found matching your criteria</p>
          </div>
        </div>
      ) : (
        currentWarehouses.map((warehouse) => (
          <WarehouseCard
            key={warehouse.id}
            warehouse={warehouse}
            onEdit={(w) => {
              setCurrentWarehouse(w);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );

  const stats = getSummaryStats();
  const filterOptions = getFilterOptions();

  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
            <h1 className="text-center text-blue-500 font-bold text-xl mb-2">
              Warehouse Management
            </h1>
            <p className="text-center text-gray-400 text-sm">
              Comprehensive dashboard for managing all warehouse operations
            </p>
          </div>

          <div className="mb-6 border-b border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("warehouses")}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "warehouses"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                Warehouses
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={faTags} className="mr-2" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab("commodities")}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "commodities"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={faBox} className="mr-2" />
                Commodities
              </button>
            </nav>
          </div>

          {message && (
            <div
              className={`text-center py-3 px-4 mb-6 rounded-lg shadow-md ${
                messageType === "success"
                  ? "bg-green-900 text-green-100"
                  : "bg-red-900 text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Warehouses"
              value={stats.totalWarehouses}
              icon={faWarehouse}
              color={{
                from: "from-blue-900",
                to: "to-blue-700",
                border: "border-blue-800",
                text: "text-blue-200",
                iconBg: "bg-blue-800",
              }}
            />
            <SummaryCard
              title="Running Warehouses"
              value={stats.runningWarehouses}
              icon={faCheckCircle}
              color={{
                from: "from-green-900",
                to: "to-green-700",
                border: "border-green-800",
                text: "text-green-200",
                iconBg: "bg-green-800",
              }}
              trend={{
                direction:
                  stats.runningWarehouses / stats.totalWarehouses > 0.8
                    ? "up"
                    : "neutral",
                value: Math.round(
                  (stats.runningWarehouses / stats.totalWarehouses) * 100
                ),
                unit: "%",
              }}
            />
            <SummaryCard
              title="Available Warehouses"
              value={stats.availableWarehouses}
              icon={faCheckCircle}
              color={{
                from: "from-purple-900",
                to: "to-purple-700",
                border: "border-purple-800",
                text: "text-purple-200",
                iconBg: "bg-purple-800",
              }}
            />
            <SummaryCard
              title="Unique Locations"
              value={stats.uniqueLocations}
              icon={faMapMarkerAlt}
              color={{
                from: "from-red-900",
                to: "to-red-700",
                border: "border-red-800",
                text: "text-red-200",
                iconBg: "bg-red-800",
              }}
            />
          </div>

          {/* Main Content */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-blue-400 flex items-center">
                  <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                  <span className="font-semibold">Warehouses:</span>
                  <span className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-full">
                    {filteredAndSortedData.length}
                  </span>
                </span>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1 rounded-md ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    title="Table View"
                  >
                    <FontAwesomeIcon icon={faClipboardList} />
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`px-3 py-1 rounded-md ${
                      viewMode === "card"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    title="Card View"
                  >
                    <FontAwesomeIcon icon={faBoxes} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-gray-400"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search warehouses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                </button>

                {/* Add New Button */}
                <button
                  onClick={() => {
                    setCurrentWarehouse(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add New
                </button>

                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export
                  </button>
                  {downloadMenuVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleDownload.PDF();
                            setDownloadMenuVisible(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            handleDownload.Excel();
                            setDownloadMenuVisible(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                        >
                          Excel
                        </button>
                        <button
                          onClick={() => {
                            handleDownload.CSV();
                            setDownloadMenuVisible(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
                        >
                          CSV
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 mb-6">
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-gray-400">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * warehousesPerPage + 1,
                    filteredAndSortedData.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * warehousesPerPage,
                    filteredAndSortedData.length
                  )}{" "}
                  of {filteredAndSortedData.length} warehouses
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={warehousesPerPage}
                  onChange={(e) => {
                    setWarehousesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {[5, 10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-300">
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredAndSortedData.length / warehousesPerPage)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          filteredAndSortedData.length / warehousesPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredAndSortedData.length / warehousesPerPage)
                  }
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Charts Section */}
            {/* {renderCharts()} */}

            {/* Main Content - Table or Cards */}
            <div className="mt-6">
              {viewMode === "table" ? renderTable() : renderCards()}
            </div>

            {/* Pagination Controls (Bottom) */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  First
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Previous
                </button>
                {Array.from(
                  {
                    length: Math.min(
                      5,
                      Math.ceil(
                        filteredAndSortedData.length / warehousesPerPage
                      )
                    ),
                  },
                  (_, i) => {
                    let pageNum;
                    if (
                      Math.ceil(
                        filteredAndSortedData.length / warehousesPerPage
                      ) <= 5
                    ) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      currentPage >=
                      Math.ceil(
                        filteredAndSortedData.length / warehousesPerPage
                      ) -
                        2
                    ) {
                      pageNum =
                        Math.ceil(
                          filteredAndSortedData.length / warehousesPerPage
                        ) -
                        4 +
                        i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          filteredAndSortedData.length / warehousesPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredAndSortedData.length / warehousesPerPage)
                  }
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Next
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.ceil(
                        filteredAndSortedData.length / warehousesPerPage
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredAndSortedData.length / warehousesPerPage)
                  }
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <WarehouseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentWarehouse(null);
          }}
          warehouse={currentWarehouse}
          onSubmit={handleAddUpdateWarehouse}
          isLoading={isLoading}
        />

        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />

        {activeTab === "warehouses" && (
          <>
            {/* All the existing warehouse management UI */}
            {renderCharts()}
            {/* {viewMode === "table" ? renderTable() : renderCards()} */}
          </>
        )}

        {activeTab === "categories" && <CategoryManagement />}

        {activeTab === "commodities" && <CommodityManagement />}
      </div>
    </ErrorBoundary>
  );
};
export default WarehouseManagement;
