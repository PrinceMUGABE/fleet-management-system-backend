/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faPlus, faEdit, faTrash, faBox } from '@fortawesome/free-solid-svg-icons';

const CommodityManagement = ({ warehouseId }) => {
  const [commodities, setCommodities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentCommodity, setCurrentCommodity] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const token = localStorage.getItem("token");

  const fetchCommodities = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/warehouse/commodities/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommodities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching commodities:", err);
      setMessage("Failed to fetch commodities");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/warehouse/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setMessage("Failed to fetch categories");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchCommodities();
    fetchCategories();
  }, []);

  const handleAddCommodity = async (formData) => {
    try {
      setIsLoading(true);
      await axios.post(`http://127.0.0.1:8000/warehouse/commodities/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchCommodities();
      setIsAddModalOpen(false);
      setMessage("Commodity added successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add commodity");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommodity = async (formData) => {
    try {
      setIsLoading(true);
      await axios.put(
        `http://127.0.0.1:8000/warehouse/commodities/${currentCommodity.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchCommodities();
      setIsAddModalOpen(false);
      setCurrentCommodity(null);
      setMessage("Commodity updated successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update commodity");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCommodity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this commodity?")) return;
    try {
      setIsLoading(true);
      await axios.delete(`http://127.0.0.1:8000/warehouse/commodities/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCommodities();
      setMessage("Commodity deleted successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete commodity");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (formData) => {
    try {
      setIsLoading(true);
      await axios.post(`http://127.0.0.1:8000/warehouse/categories/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchCategories();
      setIsCategoryModalOpen(false);
      setMessage("Category added successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add category");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (formData) => {
    try {
      setIsLoading(true);
      await axios.put(
        `http://127.0.0.1:8000/warehouse/categories/${currentCategory.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchCategories();
      setIsCategoryModalOpen(false);
      setCurrentCategory(null);
      setMessage("Category updated successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update category");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      setIsLoading(true);
      await axios.delete(`http://127.0.0.1:8000/warehouse/categories/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCategories();
      setMessage("Category deleted successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete category");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommoditySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (currentCommodity) {
      await handleUpdateCommodity(data);
    } else {
      await handleAddCommodity(data);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (currentCategory) {
      await handleUpdateCategory(data);
    } else {
      await handleAddCategory(data);
    }
  };

  const filteredCommodities = commodities.filter((commodity) => {
    const matchesSearch = commodity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commodity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commodity.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (commodity.category && commodity.category.id.toString() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-center text-blue-500 font-bold text-xl mb-2">
            Commodity Management
          </h1>
          <p className="text-center text-gray-400 text-sm">
            Manage all commodities and categories
          </p>
        </div>

        {/* Message */}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Section */}
          <div className="lg:col-span-1 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-blue-400">
                <FontAwesomeIcon icon={faTags} className="mr-2" />
                Categories
              </h2>
              <button
                onClick={() => {
                  setCurrentCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left p-2 rounded ${
                  selectedCategory === "all" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCategory(category.id.toString())}
                    className={`flex-1 text-left p-2 rounded ${
                      selectedCategory === category.id.toString()
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {category.name}
                  </button>
                  <div className="ml-2 space-x-1">
                    <button
                      onClick={() => {
                        setCurrentCategory(category);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <FontAwesomeIcon icon={faEdit} size="sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commodities Section */}
          <div className="lg:col-span-3">
            {/* Search and Add */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search commodities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentCommodity(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Commodity
                </button>
              </div>
            </div>

            {/* Commodities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCommodities.map((commodity) => (
                <div key={commodity.id} className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBox} className="text-blue-400 mr-2" />
                      <h3 className="font-semibold text-gray-200">{commodity.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentCommodity(commodity);
                          setIsAddModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FontAwesomeIcon icon={faEdit} size="sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommodity(commodity.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p><span className="text-gray-300">Category:</span> {commodity.category_name || 'Not found'}</p>
                    <p><span className="text-gray-300">Unit:</span> {commodity.unit_of_measurement}</p>
                    {commodity.description && (
                      <p><span className="text-gray-300">Description:</span> {commodity.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCommodities.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No commodities found matching your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Commodity Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">
                {currentCommodity ? "Update Commodity" : "Add New Commodity"}
              </h3>
              <form onSubmit={handleCommoditySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentCommodity?.name || ""}
                      required
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    />
                  </div>
                  <div>
  <label className="block text-gray-300 mb-2">Category</label>
  <select
    name="category"
    defaultValue={currentCommodity?.category || ""}
    required
    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
  >
    <option value="">Select Category</option>
    {categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ))}
  </select>
</div>
                  <div>
                    <label className="block text-gray-300 mb-2">Unit of Measurement</label>
                    <select
                      name="unit_of_measurement"
                      defaultValue={currentCommodity?.unit_of_measurement || "kg"}
                      required
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    >
                      <option value="kg">Kilograms</option>
                      <option value="tons">Tons</option>
                      <option value="liters">Liters</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="pallets">Pallets</option>
                      <option value="cubic_meters">Cubic Meters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      defaultValue={currentCommodity?.description || ""}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCurrentCommodity(null);
                    }}
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {currentCommodity ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">
                {currentCategory ? "Update Category" : "Add New Category"}
              </h3>
              <form onSubmit={handleCategorySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentCategory?.name || ""}
                      required
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      defaultValue={currentCategory?.description || ""}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setCurrentCategory(null);
                    }}
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {currentCategory ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommodityManagement;