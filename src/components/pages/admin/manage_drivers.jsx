/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react";

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
        <div className="p-4 text-red-700 bg-red-100 rounded-lg border border-red-300">
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

function DriverManagement() {
  const [driversData, setDriversData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverLicense, setNewDriverLicense] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editStatus, setEditStatus] = useState("available");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const BASE_URL = "http://127.0.0.1:8000/driver/";

  // Show message helper function
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Fetch all drivers from API
  const handleFetch = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${BASE_URL}drivers/`);
      
      if (response.ok) {
        const data = await response.json();
        setDriversData(Array.isArray(data) ? data : []);
        
        if (isRefresh) {
          showMessage("Drivers list refreshed successfully", "success");
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || "Failed to fetch drivers";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
      showMessage(err.message || "Failed to load drivers. Please check your connection.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load drivers on component mount
  useEffect(() => {
    handleFetch();
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    handleFetch(true);
  };

  // Delete driver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}delete/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Auto-refresh the drivers list
        await handleFetch();
        showMessage("Driver deleted successfully", "success");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || "Failed to delete driver";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error deleting driver:", err);
      showMessage(err.message || "An error occurred while deleting the driver", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add new driver
  const handleAddDriver = async () => {
    // Client-side validation
    if (!newDriverName.trim()) {
      showMessage("Driver name is required", "error");
      return;
    }

    if (!newDriverLicense.trim()) {
      showMessage("License number is required", "error");
      return;
    }

    try {
      setLoading(true);
      const driverData = {
        names: newDriverName.trim(), // Note: backend expects 'names'
        license_number: newDriverLicense.trim(),
        status: "available",
      };

      const response = await fetch(`${BASE_URL}create/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driverData)
      });
      
      if (response.ok) {
        // Auto-refresh the drivers list
        await handleFetch();
        showMessage("Driver created successfully", "success");
        
        // Clear form
        setNewDriverName("");
        setNewDriverLicense("");
      } else {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          showMessage(`Validation errors: ${errorData.errors.join(', ')}`, "error");
        } else {
          const errorMessage = errorData.error || errorData.message || "Failed to create driver";
          showMessage(errorMessage, "error");
        }
      }
    } catch (err) {
      console.error("Error creating driver:", err);
      showMessage(err.message || "An error occurred while creating the driver", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update driver
  const handleUpdateDriver = async () => {
    // Client-side validation
    if (!editName.trim()) {
      showMessage("Driver name is required", "error");
      return;
    }

    if (!editLicense.trim()) {
      showMessage("License number is required", "error");
      return;
    }

    try {
      setLoading(true);
      const driverData = {
        name: editName.trim(),
        license_number: editLicense.trim(),
        status: editStatus,
      };

      const response = await fetch(`${BASE_URL}update/${currentDriver.id}/`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driverData)
      });
      
      if (response.ok) {
        // Auto-refresh the drivers list
        await handleFetch();
        showMessage("Driver updated successfully", "success");
        
        // Close modal
        setIsModalOpen(false);
        setCurrentDriver(null);
      } else {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          showMessage(`Validation errors: ${errorData.errors.join(', ')}`, "error");
        } else {
          const errorMessage = errorData.error || errorData.message || "Failed to update driver";
          showMessage(errorMessage, "error");
        }
      }
    } catch (err) {
      console.error("Error updating driver:", err);
      showMessage(err.message || "An error occurred while updating the driver", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (driver) => {
    setCurrentDriver(driver);
    setEditName(driver.name || "");
    setEditLicense(driver.license_number || "");
    setEditStatus(driver.status || "available");
    setIsModalOpen(true);
  };

  // Filter drivers based on search query
  const filteredData = driversData.filter((driver) =>
    [driver.name, driver.license_number, driver.status].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Render edit modal
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
        <div className="bg-white rounded-lg shadow-xl p-6 z-50 w-96 border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Update Driver
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Driver Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2 text-gray-500 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">License Number *</label>
              <input
                type="text"
                value={editLicense}
                onChange={(e) => setEditLicense(e.target.value)}
                className="w-full p-2 border text-gray-500 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., RWA12345"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full p-2 border text-gray-500 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateDriver}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-700">Driver Management</h1>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Add New Driver Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Add New Driver</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-gray-700 mb-2">Driver Name *</label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full p-3 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  className="w-full p-3 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., RWA12345"
                  disabled={loading}
                />
              </div>
              <div>
                <button
                  onClick={handleAddDriver}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Driver"}
                </button>
              </div>
            </div>
          </div>

          {/* Current Drivers Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-700">
                Current Drivers ({filteredData.length})
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 text-gray-500 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && !refreshing && (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Loading drivers...
                </div>
              </div>
            )}

            {/* Drivers Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {searchQuery ? "No drivers found matching your search" : "No drivers found. Add your first driver above."}
                  </div>
                ) : (
                  filteredData.map((driver) => (
                    <div key={driver.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                          {driver.name || `Driver ${driver.id}`}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(driver)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit Driver"
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Driver"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">ID:</span> {driver.id}</p>
                        <p><span className="font-medium">Names:</span> {driver.name || "Not provided"}</p>
                        <p><span className="font-medium">License:</span> {driver.license_number || "Not provided"}</p>
                        <p>
                          <span className="font-medium">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            driver.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {driver.status === "available" ? "Available" : "Assigned"}
                          </span>
                        </p>
                        <p><span className="font-medium">Trips Covered:</span> {driver.trips_covered || 0}</p>
                        {driver.created_at && (
                          <p><span className="font-medium">Added:</span> {new Date(driver.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {renderModal()}
      </div>
    </ErrorBoundary>
  );
}

export default DriverManagement;