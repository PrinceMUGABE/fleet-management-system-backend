/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faUser,
  faFilter,
  faPlus,
  faCheckCircle,
  faTimesCircle,
  faTimes,
  faUpload,
  faSpinner,
  faEye,
  faChevronLeft,
  faChevronRight,
  faFile,
  faFileExcel,
  faFileCsv,
  faIdCard,
  faIdBadge,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

function Admin_Manage_Drivers() {
  const [driversData, setDriversData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage, setDriversPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:8000/driver/";
  const token = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}drivers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDriversData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  const [filters, setFilters] = useState({
    status: "",
    availability: "",
    drivingCategories: [],
    gender: "",
    ageRange: { min: "", max: "" },
    experience: { min: "", max: "" },
    sortBy: "",
    sortOrder: "asc",
  });

  // Add summary data calculation
  const summaryData = React.useMemo(() => {
    if (!driversData.length) return [];

    const totalDrivers = driversData.length;
    const approvedDrivers = driversData.filter(
      (driver) => driver.status === "approved"
    ).length;

    const activeDrivers = driversData.filter(
      (driver) => driver.availability_status === "active"
    ).length;

    return [
      {
        title: "Total Drivers",
        value: totalDrivers,
        icon: faUser,
        color: "bg-blue-500",
      },
      {
        title: "Approved Drivers",
        value: approvedDrivers,
        icon: faCheckCircle,
        color: "bg-green-500",
      },

      {
        title: "Active Drivers",
        value: activeDrivers,
        icon: faUser,
        color: "bg-purple-500",
      },
    ];
  }, [driversData]);

  const filteredData = driversData.filter((driver) => {
    const nameMatch = [driver.first_name, driver.last_name]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const statusMatch = !filters.status || driver.status === filters.status;
    const availabilityMatch =
      !filters.availability ||
      driver.availability_status === filters.availability;
    const genderMatch = !filters.gender || driver.gender === filters.gender;
    const categoriesMatch =
      filters.drivingCategories.length === 0 ||
      filters.drivingCategories.some((category) =>
        driver.driving_categories.includes(category)
      );

    return (
      nameMatch &&
      statusMatch &&
      availabilityMatch &&
      genderMatch &&
      categoriesMatch
    );
  });

  const currentDrivers = filteredData.slice(
    (currentPage - 1) * driversPerPage,
    currentPage * driversPerPage
  );

  // Enhanced Render Summary Cards
  const renderSummaryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summaryData.map((card, index) => (
        <div
          key={index}
          className={`${card.color} text-white rounded-lg p-4 shadow-md border border-gray-800 flex items-center hover:scale-105 transition duration-300`}
        >
          <div className="mr-4">
            <FontAwesomeIcon icon={card.icon} className="text-3xl" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-75">{card.title}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDriverDetailsModal = () =>
    selectedDriver && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">Driver Details</h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-blue-800">Full Name</p>
              <p className="font-medium text-gray-800">
                {selectedDriver.first_name} {selectedDriver.last_name}
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Gender</p>
              <p className="capitalize text-gray-800">
                {selectedDriver.gender}
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Phone Number</p>
              <p className="text-gray-800">{selectedDriver.phone_number}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Email</p>
              <p className="text-gray-800">{selectedDriver.email}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Driving Categories</p>
              <p className="text-gray-800 capitalize">
                {selectedDriver.driving_categories.join(", ")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Status</p>
              <p className="uppercase text-gray-800">{selectedDriver.status}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Availability Status</p>
              <p className="uppercase text-gray-800">
                {selectedDriver.availability_status}
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  const renderDriversTable = () => (
    <div className="bg-gray-900 shadow-md rounded-lg overflow-x-auto border border-gray-800">
      <table className="w-full" id="driver-table">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-3 text-left text-gray-300">Name</th>
            <th className="p-3 text-left text-gray-300">Phone</th>
            <th className="p-3 text-left text-gray-300">Driving Categories</th>
            <th className="p-3 text-left text-gray-300">Status</th>
            <th className="p-3 text-left text-gray-300">Availability</th>
            <th className="p-3 text-left text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDrivers.map((driver) => (
            <tr
              key={driver.id}
              className="border-b border-gray-700 hover:bg-gray-800 transition duration-200"
            >
              <td className="p-3 text-gray-300">
                {driver.first_name} {driver.last_name}
              </td>
              <td className="p-3 text-gray-300">{driver.phone_number}</td>
              <td className="p-3 text-gray-300">
                {driver.driving_categories.join(", ")}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    driver.status === "approved"
                      ? "bg-green-900 text-green-400"
                      : "bg-blue-900 text-blue-400"
                  }`}
                >
                  {driver.status.toUpperCase()}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    driver.availability_status === "active"
                      ? "bg-green-900 text-green-400"
                      : "bg-blue-900 text-blue-400"
                  }`}
                >
                  {driver.availability_status.toUpperCase()}
                </span>
              </td>
              <td className="p-3 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedDriver(driver);
                    setIsViewModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => handleEditDriver(driver)}
                  className="text-green-500 hover:text-green-700"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-900 text-gray-300 border border-gray-700 rounded px-2 py-1"
          >
            {[5, 10, 15, 20, 25].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-gray-300 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="text-gray-300 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCharts = () => {
    const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FDCB6E", "#6C5CE7"];

    const statusData = Object.entries(
      driversData.reduce((acc, driver) => {
        acc[driver.status] = (acc[driver.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const drivingCategoriesData = Object.entries(
      driversData.reduce((acc, driver) => {
        driver.driving_categories.forEach((category) => {
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            Driver Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((entry, index) => (
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
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ color: "#f9fafb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            Driving Categories Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={drivingCategoriesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {drivingCategoriesData.map((entry, index) => (
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
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ color: "#f9fafb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDriverCard = (driver) => (
    <div
      key={driver.id}
      className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-red-500 transition duration-300"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={
              driver.availability_status === "active"
                ? faCheckCircle
                : faTimesCircle
            }
            className={`mr-2 ${
              driver.availability_status === "active"
                ? "text-green-500"
                : "text-blue-500"
            }`}
          />
          <span
            className={`font-semibold ${
              driver.availability_status === "active"
                ? "text-green-500"
                : "text-blue-500"
            }`}
          >
            {driver.availability_status.toUpperCase()}
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            driver.status === "approved"
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {driver.status.toUpperCase()}
        </span>
      </div>
      <div className="text-center mb-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-4xl mb-3">
          {driver.first_name[0]}
          {driver.last_name[0]}
        </div>
        <h3 className="text-xl font-bold text-white">
          {driver.first_name} {driver.last_name}
        </h3>
        <p className="text-gray-400">{driver.user.phone_number}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-700 p-2 rounded text-center">
          <span className="block text-gray-400">Driving Categories</span>
          <span className="font-semibold text-white">
            {driver.driving_categories.join(", ")}
          </span>
        </div>
        <div className="bg-gray-700 p-2 rounded text-center">
          <span className="block text-gray-400">Gender</span>
          <span className="font-semibold text-white capitalize">
            {driver.gender}
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => {
            setCurrentDriver(driver);
            setIsModalOpen(true);
          }}
          className="w-1/2 mr-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faEdit} className="mr-2" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(driver.id)}
          className="w-1/2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );

  // Comprehensive Filter Modal
  const renderFilterModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFilterModalOpen ? "visible" : "invisible"
      }`}
    >
      <div
        className={`fixed inset-0 bg-black opacity-50 ${
          isFilterModalOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsFilterModalOpen(false)}
      ></div>
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-[500px] border border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-blue-500">
          Advanced Filters
        </h2>
        <div className="space-y-4">
          {/* Existing Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters({ ...filters, availability: e.target.value })
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="">All Availabilities</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Driving Categories */}
          <div>
            <label className="block text-gray-300 mb-2">
              Driving Categories
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["A", "B", "B1", "C", "D", "D1", "E", "F"].map((category) => (
                <label key={category} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={category}
                    checked={filters.drivingCategories.includes(category)}
                    onChange={(e) => {
                      const updatedCategories = e.target.checked
                        ? [...filters.drivingCategories, category]
                        : filters.drivingCategories.filter(
                            (c) => c !== category
                          );
                      setFilters({
                        ...filters,
                        drivingCategories: updatedCategories,
                      });
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
                  />
                  <span className="ml-2 text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) =>
                  setFilters({ ...filters, gender: e.target.value })
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div></div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => {
              // Reset all filters
              setFilters({
                status: "",
                availability: "",
                drivingCategories: [],
                gender: "",
                ageRange: { min: "", max: "" },
                experience: { min: "", max: "" },
                sortBy: "",
                sortOrder: "asc",
              });
              setIsFilterModalOpen(false);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // Pre-fill Form on Edit
  const handleEditDriver = (driver) => {
    setCurrentDriver(driver);
    setIsModalOpen(true);

    // Timeout to ensure modal is open before populating
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        form.elements.first_name.value = driver.first_name;
        form.elements.last_name.value = driver.last_name;
        form.elements.gender.value = driver.gender;
        form.elements.phone_number.value = driver.phone_number;
        form.elements.email.value = driver.email;
        form.elements.status.value = driver.status;
        form.elements.availability_status.value = driver.availability_status;

        // Reset and check driving categories
        form.elements.drivingCategories.forEach((checkbox) => {
          checkbox.checked = driver.driving_categories.includes(checkbox.value);
        });
      }
    }, 100);
  };

  // Comprehensive Filtering and Sorting Logic
  const filteredAndSortedDrivers = useMemo(() => {
    let result = driversData.filter((driver) => {
      const nameMatch = [driver.first_name, driver.last_name]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const statusMatch = !filters.status || driver.status === filters.status;
      const availabilityMatch =
        !filters.availability ||
        driver.availability_status === filters.availability;
      const genderMatch = !filters.gender || driver.gender === filters.gender;

      const categoriesMatch =
        filters.drivingCategories.length === 0 ||
        filters.drivingCategories.some((category) =>
          driver.driving_categories.includes(category)
        );

      // Age and Experience Filters (assuming you have these fields)
      const ageMatch =
        (!filters.ageRange.min || driver.age >= filters.ageRange.min) &&
        (!filters.ageRange.max || driver.age <= filters.ageRange.max);

      const experienceMatch =
        (!filters.experience.min ||
          driver.years_of_experience >= filters.experience.min) &&
        (!filters.experience.max ||
          driver.years_of_experience <= filters.experience.max);

      return (
        nameMatch &&
        statusMatch &&
        availabilityMatch &&
        genderMatch &&
        categoriesMatch &&
        ageMatch &&
        experienceMatch
      );
    });

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const sortValue = filters.sortBy;
        const sortMultiplier = filters.sortOrder === "asc" ? 1 : -1;

        if (sortValue === "name") {
          return (
            sortMultiplier *
            (a.first_name + a.last_name).localeCompare(
              b.first_name + b.last_name
            )
          );
        }
        if (sortValue === "status") {
          return sortMultiplier * a.status.localeCompare(b.status);
        }
        // Add more sorting conditions as needed
        return 0;
      });
    }

    return result;
  }, [driversData, searchQuery, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this driver?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Driver deleted successfully");
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
      doc.autoTable({ html: "#driver-table" });
      doc.save("drivers.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(driversData),
        "Drivers"
      );
      XLSX.writeFile(workbook, "drivers.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(driversData[0]).join(",") +
        "\n" +
        driversData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "drivers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const formData = new FormData();
      const form = e.target;

      const fields = [
        "first_name",
        "last_name",
        "gender",
        "phone_number",
        "email",
        "status",
        "availability_status",
      ];

      // Directly use the form's current values
      fields.forEach((field) => {
        formData.append(field, form.elements[field].value);
      });

      // Handle optional fields
      if (form.elements.national_id_number) {
        formData.append(
          "national_id_number",
          form.elements.national_id_number.value
        );
      }

      if (form.elements.driving_license_number) {
        formData.append(
          "driving_license_number",
          form.elements.driving_license_number.value
        );
      }

      // Handle checkbox selection for driving categories
      const selectedCategories = Array.from(form.elements.drivingCategories)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      formData.append("driving_categories", selectedCategories);

      const token = localStorage.getItem("token");
      const url = currentDriver
        ? `${BASE_URL}update/${currentDriver.id}/`
        : `${BASE_URL}create/`;

      const response = await axios({
        method: currentDriver ? "put" : "post",
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        currentDriver
          ? "Driver updated successfully"
          : "Driver added successfully"
      );
      setMessageType("success");
      console.log("Success:", response.data);

      // Refresh the data and close the modal on success
      await handleFetch();
      setIsModalOpen(false);
    } catch (err) {
      // Enhanced error handling
      console.error("Error submitting driver:", err);

      // Handle different error responses
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", err.response.data);

        // Format the error message based on the structure of the response
        if (
          typeof err.response.data === "object" &&
          err.response.data !== null
        ) {
          // Handle error object format from backend
          const errorMessage = Object.entries(err.response.data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
          setMessage(errorMessage);
        } else {
          setMessage(
            err.response.data.message ||
              "An error occurred while submitting the form"
          );
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request:", err.request);
        setMessage(
          "No response received from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", err.message);
        setMessage("Failed to submit the form: " + err.message);
      }

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDownloadDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
        className="bg-gray-800 text-gray-300 px-4 py-2 rounded flex items-center"
      >
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        Download
      </button>
      {downloadMenuVisible && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              handleDownload.PDF();
              setDownloadMenuVisible(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-300 flex items-center"
          >
            <FontAwesomeIcon icon={faFile} className="mr-2" /> PDF
          </button>
          <button
            onClick={() => {
              handleDownload.Excel();
              setDownloadMenuVisible(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-300 flex items-center"
          >
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> Excel
          </button>
          <button
            onClick={() => {
              handleDownload.CSV();
              setDownloadMenuVisible(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-800 text-gray-300 flex items-center"
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" /> CSV
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-gray-950 min-h-screen text-gray-300">
      {renderSummaryCards()}

      <div className="bg-gray-900 shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-500">
            Drivers Management
          </h2>
          <div className="flex space-x-4">
            {renderDownloadDropdown()}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filters
            </button>
            <button
              onClick={() => {
                setCurrentDriver(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add Driver
            </button>
          </div>
        </div>

        {renderDriversTable()}
      </div>

      {renderCharts()}
      {renderFilterModal()}

      {/* Modals */}
      {isViewModalOpen && renderDriverDetailsModal()}
      {/* Modal Form Component - Replace the existing modal form code with this */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 py-6">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Container - Improved width for larger screens */}
          <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border border-gray-800 relative z-10">
            {/* Header (sticky to stay visible when scrolling) */}
            <div className="sticky top-0 bg-gray-900 z-10 flex justify-between items-center mb-6 pb-2 border-b border-gray-800">
              <h2 className="text-xl font-bold text-blue-500">
                {currentDriver ? "Update Driver" : "Add New Driver"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Error Message Display */}
            {message && messageType === "error" && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-md">
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                  {message}
                </p>
              </div>
            )}

            {/* Form Layout - Responsive grid */}
            <form
              className="grid md:grid-cols-2 gap-x-6 gap-y-4"
              onSubmit={handleDriverSubmit}
            >
              {/* === FIRST COLUMN === */}
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    maxLength={10}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-300 mb-2">Gender</label>
                  <select
                    name="gender"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

              </div>

              {/* === SECOND COLUMN === */}
              <div className="space-y-4">
                {/* National ID Number */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    National ID Number
                  </label>
                  <input
                    type="text"
                    name="national_id_number"
                    maxLength={16}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter national ID number"
                  />
                </div>

                {/* Driving License Number */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    name="driving_license_number"
                    maxLength={16}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    placeholder="Enter driving license number"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    required
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Availability Status */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Availability Status
                  </label>
                  <select
                    name="availability_status"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Driving Categories */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Driving Categories
                  </label>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-gray-800 border border-gray-700 rounded">
                    {["A", "B", "B1", "C", "D", "D1", "E", "F"].map(
                      (category) => (
                        <label
                          key={category}
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            name="drivingCategories"
                            value={category}
                            className="form-checkbox h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
                          />
                          <span className="ml-2 text-gray-300">{category}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* === FORM BUTTONS - Full width for both layouts === */}
              <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white rounded transition ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      {currentDriver ? "Updating..." : "Adding..."}
                    </>
                  ) : currentDriver ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Admin_Manage_Drivers;
