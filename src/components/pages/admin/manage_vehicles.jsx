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
} from "@fortawesome/free-solid-svg-icons";

import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faTruck,
  faChartPie,
  faPlus,
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

function Admin_Manage_Vehicles() {
  const [vehicleData, setVehicleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage, setVehiclesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#F9F871"];
  const BASE_URL = "http://127.0.0.1:8000/vehicle/";
  const token = localStorage.getItem("token");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    handleFetch();
  }, [navigate]);

  const [activeFilters, setActiveFilters] = useState({
    type: [],
    relocationSize: [],
    drivingCategory: [],
    weightRange: [],
    status: [], // ADD THIS LINE
  });

  // Add this for filter drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}list_vehicles/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicleData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this vehicle?")) return;
    try {
      await axios.delete(`${BASE_URL}delete_vehicle/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Vehicle deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#vehicle-table" });
      doc.save("vehicles.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(vehicleData),
        "Vehicles"
      );
      XLSX.writeFile(workbook, "vehicles.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(vehicleData[0]).join(",") +
        "\n" +
        vehicleData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "vehicles.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const handleAddUpdateVehicle = async (e) => {
    e.preventDefault();
    try {
      const vehicleData = {
        type: e.target.type.value,
        relocation_size: e.target.relocation_size.value, // Add this line
        vehicle_model: e.target.vehicle_model.value, // Add this line
        plate_number: e.target.plate_number.value, // Add this line
        driving_category: e.target.driving_category.value,
        status: e.target.status.value,
      };

      // Add image base64 if selected or existing
      if (selectedImage) {
        vehicleData.image_base64 = selectedImage;
      }

      if (currentVehicle) {
        // Update existing vehicle
        await axios.put(
          `${BASE_URL}update_vehicle/${currentVehicle.id}/`,
          vehicleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Vehicle updated successfully");
      } else {
        // Create new vehicle
        await axios.post(`${BASE_URL}create_vehicle/`, vehicleData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Vehicle created successfully");
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentVehicle(null);
      setSelectedImage(null);
      setImagePreview(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  // Modify modal opening to reset image states
  const openModal = (vehicle = null) => {
    setCurrentVehicle(vehicle);
    setSelectedImage(null);
    setImagePreview(vehicle?.image_base64 || null);
    setIsModalOpen(true);
  };

  const renderCharts = () => {
    if (!vehicleData.length) return null;

    const vehicleTypeData = Object.entries(
      vehicleData.reduce((acc, vehicle) => {
        acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, value]) => ({ name: type, value }));

    const vehicleSizeData = Object.entries(
      vehicleData.reduce((acc, vehicle) => {
        const size = vehicle.relocation_size; // Get the relocation_size directly
        acc[size] = (acc[size] || 0) + 1; // Count occurrences of each size
        return acc;
      }, {})
    ).map(([size, count]) => ({
      name: size, // Use the size string directly (e.g., "Small", "Medium", "Large")
      count,
    }));

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Read file as base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result);
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      // Changed from w-full lg:w-1/3 to w-full - the charts container will now take full width
      <div className="w-full space-y-6 md:space-y-6 lg:space-y-0 lg:flex lg:flex-row lg:gap-6">
        <ErrorBoundary>
          {/* Chart 1 - Changed to make it full width on small screens and 1/2 width on large screens */}
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 mb-6 lg:mb-0">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faTruck} className="mr-2" />
              Vehicle Type Distribution
            </h3>
            <ResponsiveContainer>
              <AreaChart>
                <Area
                  data={vehicleTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={{
                    position: "outside",
                    offset: 10,
                    fill: "#e5e7eb",
                  }}
                >
                  {vehicleTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Area>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#e5e7eb" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          {/* Chart 2 - Changed to make it full width on small screens and 1/2 width on large screens */}
          <div className="w-full lg:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Vehicle Weight Distribution
            </h3>
            <ResponsiveContainer>
              <BarChart data={vehicleSizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  padding={{ top: 20, bottom: 20 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                {/* Changed Bar component to have fill color and adjusted other properties */}
                <Bar
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B6B"
                  fill="#3b82f6"
                  name="Vehicle Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const filteredData = vehicleData.filter((vehicle) =>
    [vehicle.type.toString()].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Update the filteredData variable to include both search and filters

  const searchFilteredData = vehicleData.filter((vehicle) =>
    [
      vehicle.type,
      vehicle.vehicle_model,
      vehicle.plate_number,
      vehicle.status, // ADD THIS LINE
    ].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const applyFilters = (data) => {
    return data.filter((vehicle) => {
      // Check type filter
      if (
        activeFilters.type.length > 0 &&
        !activeFilters.type.includes(vehicle.type)
      ) {
        return false;
      }

      // Check relocation size filter
      if (
        activeFilters.relocationSize.length > 0 &&
        !activeFilters.relocationSize.includes(vehicle.relocation_size)
      ) {
        return false;
      }

      // Check driving category filter
      if (
        activeFilters.drivingCategory.length > 0 &&
        !activeFilters.drivingCategory.includes(vehicle.driving_category)
      ) {
        return false;
      }

      if (
        activeFilters.status.length > 0 &&
        !activeFilters.status.includes(vehicle.status)
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredAndSortedData = applyFilters(searchFilteredData);

  const currentVehicles = filteredAndSortedData.slice(
    (currentPage - 1) * vehiclesPerPage,
    currentPage * vehiclesPerPage
  );

  // Add this function to get summary stats
  const getSummaryStats = () => {
    if (!vehicleData.length) return {};

    // Get unique types
    const uniqueTypes = [...new Set(vehicleData.map((v) => v.type))];

    // Get most common vehicle type
    const typeCounts = vehicleData.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {});
    const mostCommonType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    // Get newest vehicle
    const newestVehicle = [...vehicleData].sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    )[0];

    return {
      totalVehicles: vehicleData.length,
      uniqueTypes: uniqueTypes.length,
      mostCommonType,
      newestVehicle: newestVehicle
        ? {
            type: newestVehicle.type,
            date: new Date(newestVehicle.created_date).toLocaleDateString(),
          }
        : null,
    };
  };

  const getStatusStats = () => {
    if (!vehicleData.length) return { active: 0, inactive: 0 };

    const activeCount = vehicleData.filter((v) => v.status === "active").length;
    const inactiveCount = vehicleData.filter(
      (v) => v.status === "not_active"
    ).length;

    return { active: activeCount, inactive: inactiveCount };
  };

  // Add this function to handle filter changes
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

  // Add this function to reset filters
  const resetFilters = () => {
    setActiveFilters({
      type: [],
      relocationSize: [],
      drivingCategory: [],
      weightRange: [],
      status: [],
    });
  };

  // Add this function to get unique filter options
  const getFilterOptions = () => {
    const types = [...new Set(vehicleData.map((v) => v.type))];
    const relocationSizes = [
      ...new Set(vehicleData.map((v) => v.relocation_size)),
    ];
    const drivingCategories = [
      ...new Set(vehicleData.map((v) => v.driving_category)),
    ];

    const statuses = [...new Set(vehicleData.map((v) => v.status))];

    return { types, relocationSizes, drivingCategories, statuses };
  };

  const renderModal = () => {
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
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-96 border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-blue-500">
            {currentVehicle ? "Update Vehicle" : "Add New Vehicle"}
          </h2>
          <form onSubmit={handleAddUpdateVehicle}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    defaultValue={currentVehicle?.type || ""}
                    required
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    Relocation Size
                  </label>
                  <select
                    name="relocation_size"
                    defaultValue={currentVehicle?.relocation_size || "medium"}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    defaultValue={currentVehicle?.vehicle_model || ""}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    name="plate_number"
                    defaultValue={currentVehicle?.plate_number || ""}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={currentVehicle?.status || "active"}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  >
                    <option value="active">Active</option>
                    <option value="not_active">Not Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Vehicle Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Driving License Category
                  </label>
                  <select
                    name="driving_category"
                    defaultValue={currentVehicle?.driving_category || "B"}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  >
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="B1">Category B1</option>
                    <option value="C">Category C</option>
                    <option value="D">Category D</option>
                    <option value="D1">Category D1</option>
                    <option value="E">Category E</option>
                    <option value="F">Category F</option>
                  </select>
                </div>
              </div>
            </div>

            {(imagePreview || currentVehicle?.image_base64) && (
              <div className="mt-4 flex justify-center">
                <img
                  src={imagePreview || currentVehicle?.image_base64}
                  alt="Vehicle Preview"
                  className="w-40 h-40 object-cover rounded"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentVehicle ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    const stats = getSummaryStats();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-lg shadow-md p-4 border border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Vehicles</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.totalVehicles}
              </h3>
            </div>
            <div className="bg-blue-800 p-3 rounded-full">
              <FontAwesomeIcon icon={faTruck} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-md p-4 border border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Avg. Weight Capacity</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.avgWeight} kg
              </h3>
            </div>
            <div className="bg-blue-800 p-3 rounded-full">
              <FontAwesomeIcon icon={faWeight} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900 to-yellow-700 rounded-lg shadow-md p-4 border border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm">Active Vehicles</p>
              <h3 className="text-white text-2xl font-bold">
                {getStatusStats().active}
              </h3>
            </div>
            <div className="bg-yellow-800 p-3 rounded-full">
              <FontAwesomeIcon
                icon={faClipboardList}
                className="text-white text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-lg shadow-md p-4 border border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Vehicle Types</p>
              <h3 className="text-white text-2xl font-bold">
                {stats.uniqueTypes}
              </h3>
            </div>
            <div className="bg-green-800 p-3 rounded-full">
              <FontAwesomeIcon icon={faTags} className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-lg shadow-md p-4 border border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Most Common Type</p>
              <h3 className="text-white text-xl font-bold">
                {stats.mostCommonType}
              </h3>
            </div>
            <div className="bg-purple-800 p-3 rounded-full">
              <FontAwesomeIcon
                icon={faInfoCircle}
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
              <h4 className="text-gray-300 font-medium mb-2">Vehicle Type</h4>
              <div className="space-y-2">
                {filterOptions.types.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.type.includes(type)}
                      onChange={() => handleFilterChange("type", type)}
                      className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-300 font-medium mb-2">Status</h4>
              <div className="space-y-2">
                {filterOptions.statuses &&
                  filterOptions.statuses.map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.status.includes(status)}
                        onChange={() => handleFilterChange("status", status)}
                        className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-gray-300 capitalize">
                        {status === "active" ? "Active" : "Not Active"}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-300 font-medium mb-2">
                Relocation Size
              </h4>
              <div className="space-y-2">
                {filterOptions.relocationSizes.map((size) => (
                  <label key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.relocationSize.includes(size)}
                      onChange={() =>
                        handleFilterChange("relocationSize", size)
                      }
                      className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-gray-300 capitalize">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-300 font-medium mb-2">
                Driving Category
              </h4>
              <div className="space-y-2">
                {filterOptions.drivingCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.drivingCategory.includes(category)}
                      onChange={() =>
                        handleFilterChange("drivingCategory", category)
                      }
                      className="mr-2 text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-gray-300">Category {category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-gray-300 font-medium mb-2">
                Weight Range (kg)
              </h4>
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
              Manage Vehicles
            </h1>
            <p className="text-center text-gray-400 text-sm">
              View, edit and manage vehicle fleet from a central dashboard
            </p>
          </div>

          {message && (
            <div
              className={`text-center py-3 px-4 mb-6 rounded-lg shadow-md ${
                messageType === "success"
                  ? "bg-green-900 text-green-100"
                  : "bg-blue-900 text-blue-100"
              }`}
            >
              {message}
            </div>
          )}

          {renderSummaryCards()}

          <div className="flex flex-col gap-6">
            <div className="w-full">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-blue-400 flex items-center">
                      <FontAwesomeIcon icon={faTruck} className="mr-2" />
                      <span className="font-semibold">Total Vehicles:</span>
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
                        placeholder="Search vehicles..."
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

                    <button
                      onClick={() => {
                        setCurrentVehicle(null);
                        openModal();
                      }}
                      className="py-2 bg-blue-600 px-4 rounded-lg text-white flex items-center justify-center hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Vehicle
                    </button>
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-700">
                  <table
                    id="vehicle-table"
                    className="w-full text-sm text-left"
                  >
                    <thead className="text-xs uppercase bg-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-3 rounded-tl-lg">#</th>
                        <th className="px-6 py-3">Image</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Relocation Size</th>
                        <th className="px-6 py-3">Vehicle Model</th>
                        <th className="px-6 py-3">Plate Number</th>
                        <th className="px-6 py-3">Driving Category</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Created Date</th>
                        <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentVehicles.length === 0 ? (
                        <tr>
                          <td
                            colSpan="12"
                            className="text-center py-8 text-gray-400 bg-gray-800"
                          >
                            <div className="flex flex-col items-center">
                              <FontAwesomeIcon
                                icon={faTruck}
                                className="text-4xl mb-3 text-gray-600"
                              />
                              <p>No vehicles found matching your criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentVehicles.map((vehicle, index) => (
                          <tr
                            key={vehicle.id}
                            className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                          >
                            <td className="px-6 py-4 text-gray-300">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              {vehicle.image_base64 ? (
                                <img
                                  src={vehicle.image_base64}
                                  alt={`${vehicle.type} vehicle`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {vehicle.type}
                            </td>
                            <td className="px-6 py-4 text-gray-300 capitalize">
                              {vehicle.relocation_size}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {vehicle.vehicle_model || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {vehicle.plate_number || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {vehicle.driving_category}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  vehicle.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {vehicle.status === "active"
                                  ? "Active"
                                  : "Not Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(
                                vehicle.created_date
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    setCurrentVehicle(vehicle);
                                    openModal(vehicle);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  onClick={() => handleDelete(vehicle.id)}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
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
                      value={vehiclesPerPage}
                      onChange={(e) =>
                        setVehiclesPerPage(Number(e.target.value))
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
                        currentPage * vehiclesPerPage >=
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

export default Admin_Manage_Vehicles;
