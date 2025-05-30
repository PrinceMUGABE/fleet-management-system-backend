/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  Trash2,
  X,
  Download,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const Dispatcher_ManageIrrigationPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [district, setDistrict] = useState("");
  const [createError, setCreateError] = useState("");
 
  const [crop, setCrop] = useState('');



  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const downloadRef = useRef(null);

  // First useEffect for click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Second useEffect for fetching predictions
  useEffect(() => {
    fetchPredictions();
  }, []);

  // Rows per page options
  const rowsOptions = [5, 10, 30, 50, 100];

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Updated filteredPredictions to handle null values
  const filteredPredictions = predictions.filter(
    (pred) =>
      pred.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.created_by?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pred.created_by?.phone_number
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Calculate pagination based on filtered predictions
  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPredictions = filteredPredictions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Download functions with filtered data
  const downloadExcel = () => {
    const dataToExport = filteredPredictions.map((p) => ({
      Location: p.location || "N/A",
      Email: p.created_by?.email || "N/A",
      Phone: p.created_by?.phone_number || "N/A",
      Status: p.status || "N/A",
      "Created At": formatDate(p.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Predictions");
    XLSX.writeFile(wb, "predictions.xlsx");
  };

  const downloadCSV = () => {
    const headers = ["Location,Email,Phone,Status,Created At\n"];
    const csv = filteredPredictions
      .map((p) =>
        [
          p.location || "N/A",
          p.created_by?.email || "N/A",
          p.created_by?.phone_number || "N/A",
          p.status || "N/A",
          formatDate(p.created_at),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Location", "Email", "Phone", "Status", "Created At"]],
      body: filteredPredictions.map((p) => [
        p.location || "N/A",
        p.created_by?.email || "N/A",
        p.created_by?.phone_number || "N/A",
        p.status || "N/A",
        formatDate(p.created_at),
      ]),
    });
    doc.save("predictions.pdf");
  };

  // List of valid crops
const validCrops = [
  'Bananas',
  'Beans',
  'Cassava',
  'Coffee',
  'Irish Potatoes',
  'Maize',
  'Rice',
  'Sorghum',
  'Soybeans',
  'Sweet Potatoes'
];

// Add this mapping at the top of your file, after the imports
const districtCrops = {
  'Kayonza': ['Maize', 'Beans', 'Cassava', 'Bananas', 'Sweet Potatoes'],
  'Kirehe': ['Rice', 'Maize', 'Beans', 'Bananas', 'Soybeans'],
  'Nyagatare': ['Maize', 'Beans', 'Sorghum', 'Rice', 'Soybeans'],
  'Bugesera': ['Maize', 'Beans', 'Cassava', 'Rice', 'Sweet Potatoes'],
  'Gatsibo': ['Maize', 'Beans', 'Sorghum', 'Soybeans', 'Sweet Potatoes'],
  'Ngoma': ['Rice', 'Maize', 'Beans', 'Cassava', 'Sweet Potatoes'],
  'Rwamagana': ['Maize', 'Beans', 'Bananas', 'Sweet Potatoes', 'Rice'],
  'Huye': ['Coffee', 'Maize', 'Beans', 'Sweet Potatoes', 'Irish Potatoes'],
  'Gisagara': ['Rice', 'Maize', 'Beans', 'Sweet Potatoes', 'Cassava'],
  'Nyanza': ['Coffee', 'Maize', 'Beans', 'Bananas', 'Sweet Potatoes'],
  'Nyaruguru': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Nyamagabe': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Ruhango': ['Coffee', 'Maize', 'Beans', 'Bananas', 'Sweet Potatoes'],
  'Muhanga': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Kamonyi': ['Coffee', 'Maize', 'Beans', 'Bananas', 'Sweet Potatoes'],
  'Gakenke': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Musanze': ['Irish Potatoes', 'Maize', 'Beans', 'Sweet Potatoes'],
  'Burera': ['Irish Potatoes', 'Maize', 'Beans', 'Sweet Potatoes'],
  'Gicumbi': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Rulindo': ['Coffee', 'Irish Potatoes', 'Beans', 'Maize', 'Sweet Potatoes'],
  'Nyabihu': ['Irish Potatoes', 'Maize', 'Beans', 'Sweet Potatoes'],
  'Rubavu': ['Irish Potatoes', 'Maize', 'Beans', 'Sweet Potatoes'],
  'Rutsiro': ['Coffee', 'Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Karongi': ['Coffee', 'Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Ngororero': ['Coffee', 'Maize', 'Beans', 'Sweet Potatoes', 'Irish Potatoes'],
  'Nyamasheke': ['Coffee', 'Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Rusizi': ['Rice', 'Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Kicukiro': ['Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Nyarugenge': ['Maize', 'Beans', 'Sweet Potatoes', 'Bananas'],
  'Gasabo': ['Maize', 'Beans', 'Sweet Potatoes', 'Bananas']
};

// Replace the existing handleDistrictChange function with this updated version
const handleDistrictChange = (e) => {
  const value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase();
  setDistrict(value);
  // Reset crop when district changes
  setCrop('');
};

// Add this new function to get available crops for the selected district
const getAvailableCrops = () => {
  if (!district || !districtCrops[district]) {
    return [];
  }
  return districtCrops[district];
};

const handleCreatePrediction = async (e) => {
  e.preventDefault();
  setCreateError('');
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:8000/irrigation/predict/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ 
        district,
        crop 
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      setPredictionResult(data.prediction);
    } else {
      setCreateError(data.error || data.details || 'Failed to create prediction');
    }
  } catch (error) {
    setCreateError('Error creating prediction');
  } finally {
    setIsLoading(false);
  }
};
  

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:8000/irrigation/predictions/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      } else {
        setError("Failed to fetch predictions");
      }
    } catch (err) {
      setError("Error fetching predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/irrigation/prediction/delete/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setPredictions((prev) =>
          prev.filter((prediction) => prediction.id !== id)
        );
      } else {
        alert("Failed to delete prediction");
      }
    } catch (error) {
      alert("Error deleting prediction");
    }
  };

  const handleViewDetails = (id) => {
    const prediction = predictions.find((pred) => pred.id === id);
    setSelectedPrediction(prediction);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return value || "N/A";
  };


  const handleClose = () => {
    setShowCreateModal(false);
    setDistrict('');
    setPredictionResult(null);
    setCreateError('');
  };

  const renderMobileCard = (prediction) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{prediction.location || "N/A"}</h3>
          <p className="text-sm text-gray-500">{prediction.created_by?.email || "N/A"}</p>
          <p className="text-sm text-gray-500">{prediction.created_by?.phone_number || "N/A"}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            prediction.status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {prediction.status || "Unknown"}
          </span>
          <p className="text-xs text-gray-500">{formatDate(prediction.created_at)}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <button
          onClick={() => handleViewDetails(prediction.id)}
          className="p-2 text-green-700 hover:text-blue-800 rounded-lg hover:bg-blue-50"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDelete(prediction.id)}
          className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderCharts = () => {
    const temperatureData = predictions.map(p => ({
      location: p.location || 'Unknown',
      temperature: parseFloat(p.temperature) || 0,
    }));
  
    const humidityData = predictions.map(p => ({
      location: p.location || 'Unknown',
      humidity: parseFloat(p.humidity) || 0,
    }));
  
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow h-64">
          <h3 className="text-sm font-semibold mb-2">Temperature Trends</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#3b82f6" 
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
  
        <div className="bg-white p-4 rounded-lg shadow h-64">
          <h3 className="text-sm font-semibold mb-2">Humidity Trends</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#10b981" 
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-12 ml-4">
      <h1 className="text-xl font-bold mb-4 text-green-700 text-center">
        IRRIGATION STRATEGY PREDICTIONS MANAGEMENT
      </h1>

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Prediction</span>
          </button>

          <div className="relative group">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)} // Add this line
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            {showDownloadOptions && (
              <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      downloadPDF();
                      setShowDownloadOptions(false); // Changed to false to close dropdown after click
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={() => {
                      downloadExcel();
                      setShowDownloadOptions(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download as Excel
                  </button>
                  <button
                    onClick={() => {
                      downloadCSV();
                      setShowDownloadOptions(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download as CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full md:w-auto text-gray-700 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>


      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && predictions.length > 0 && (
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Table and Chart Wrapper */}
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      
      {/* Table */}
      <div className="lg:w-2/3">
        {/* Mobile view */}
        <div className="lg:hidden space-y-4">
          {paginatedPredictions.map((prediction) => renderMobileCard(prediction))}
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead className="bg-green-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Soil Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Crop & Water Requirement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {prediction.location || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-gray-900">
                        {prediction.created_by?.phone_number || "N/A"}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {prediction.created_by?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        prediction.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {prediction.soil_type || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-gray-900">
                        {prediction.predicted_crop || "N/A"}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {prediction.water_requirement + ' mm/day' || "N/A"}
                      </div>
                      <div className="text-green-700 text-sm">
                        {prediction.irrigation_strategy || "N/A"}
                      </div>
                    </div>
                  </td>
          
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <span className="text-gray-700">{formatDate(prediction.created_at)}</span>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(prediction.id)}
                        className="p-2 text-green-700 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prediction.id)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="lg:w-1/3">
        {renderCharts()}
      </div>
    </div>
  </div>
)}

      {/* ... [Keep existing pagination, modals, and dialog code] ... */}
      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0">
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border rounded-md px-2 py-1 text-gray-700"
        >
          {rowsOptions.map((option) => (
            <option key={option} value={option}>
              {option} rows
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-blue-700" />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-blue-700" />
          </button>
        </div>
      </div>

      {/* Create Prediction Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-green-900">
          {predictionResult ? 'Prediction Results' : 'Create New Prediction'}
        </DialogTitle>
      </DialogHeader>
      
      {!predictionResult ? (
        <form onSubmit={handleCreatePrediction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            District
          </label>
          <input
            type="text"
            value={district}
            onChange={handleDistrictChange}
            className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isLoading}
            placeholder="Enter district name"
            list="districts"
          />
          <datalist id="districts">
            {Object.keys(districtCrops).map((dist) => (
              <option key={dist} value={dist} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Crop
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-blue-500 focus:ring-blue-500 text-gray-700
              ${!district && 'bg-gray-100 cursor-not-allowed'}`}
            required
            disabled={!district || isLoading}
          >
            <option value="">Select a crop</option>
            {getAvailableCrops().map((cropOption) => (
              <option key={cropOption} value={cropOption}>
                {cropOption}
              </option>
            ))}
          </select>
          {!district && (
            <p className="mt-1 text-sm text-gray-500">
              Please select a district first
            </p>
          )}
        </div>
        
        {createError && (
          <p className="text-red-500 text-sm">{createError}</p>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-black disabled:opacity-50"
            disabled={isLoading || !district || !crop}
          >
            {isLoading ? 'Processing...' : 'Create'}
          </button>
        </div>
      </form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-gray-500">Location:</div>
              <div className="text-sm text-gray-900">{predictionResult.location}</div>
              
              <div className="text-sm font-medium text-gray-500">Soil Type:</div>
              <div className="text-sm text-gray-900">{predictionResult.soil_type}</div>
              
              <div className="text-sm font-medium text-gray-500">Submitted Crop:</div>
              <div className="text-sm text-gray-900">{predictionResult.predicted_crop}</div>
              
              <div className="text-sm font-medium text-gray-500">Water Requirement:</div>
              <div className="text-sm text-gray-900">{predictionResult.water_requirement} mm/day</div>
              
              <div className="text-sm font-medium text-gray-500">Irrigation Strategy:</div>
              <div className="text-sm text-gray-900">{predictionResult.irrigation_strategy}</div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl h-full overflow-y-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10 mt-16">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Prediction Details
              </DialogTitle>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {selectedPrediction && (
            <div className="p-6 space-y-6 mt-24">
              {/* Location Information */}
              <div className="bg-gray-50 p-4 rounded-lg py-12">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Location Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.latitude)},{" "}
                      {formatValue(selectedPrediction.longitude)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Elevation</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.elevation)} m
                    </p>
                  </div>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Weather Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.temperature)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.humidity)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wind Speed</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.wind_speed)} m/s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rainfall</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.rainfall)} mm
                    </p>
                  </div>
                </div>
              </div>

              {/* Soil Properties */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Soil Properties
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Soil Type</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.soil_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">pH</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.ph)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Water Holding Capacity
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.water_holding_capacity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Electrical Conductivity
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.electrical_conductivity)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrients */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Soil Nutrients
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nitrogen</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.nitrogen)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phosphorus</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.phosphorus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potassium</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.potassium)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zinc</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.zinc)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Predictions & Recommendations
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Predicted Crop</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.predicted_crop}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Water Requirement</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.water_requirement)} mm/day
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Irrigation Strategy</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.irrigation_strategy}
                    </p>
                  </div>
                </div>
              </div>
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-700">
                  User Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-blue-700">
                      {selectedPrediction.created_by?.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-blue-700">
                      {selectedPrediction.created_by?.email}
                    </p>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-blue-700">
                      {formatDate(selectedPrediction.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dispatcher_ManageIrrigationPredictions;