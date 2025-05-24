/* eslint-disable no-case-declarations */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
// src/components/CategoryManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faTags,
  faBoxes,
  faInfoCircle,
  faSearch,
  faFilter,
  faTimes,
  faCalendar
} from "@fortawesome/free-solid-svg-icons";
import WarehouseModal from "./manage_warehouses.jsx";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  
  // Advanced Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    hasDescription: "all", // all, yes, no
    commodityCount: "all", // all, none, low, medium, high
    dateRange: "all", // all, today, week, month, year
    customStartDate: "",
    customEndDate: ""
  });

  const BASE_URL = "http://127.0.0.1:8000/warehouse/";
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setMessage("Failed to fetch categories");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Enhanced filtering logic
  useEffect(() => {
    let result = categories;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply advanced filters
    result = applyAdvancedFilters(result);
    
    // Apply sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredCategories(result);
  }, [categories, searchTerm, sortConfig, filters]);

  const applyAdvancedFilters = (data) => {
    let filtered = [...data];

    // Filter by description
    if (filters.hasDescription === "yes") {
      filtered = filtered.filter(cat => cat.description && cat.description.trim() !== "");
    } else if (filters.hasDescription === "no") {
      filtered = filtered.filter(cat => !cat.description || cat.description.trim() === "");
    }

    // Filter by commodity count
    if (filters.commodityCount !== "all") {
      filtered = filtered.filter(cat => {
        const count = cat.commodities_count || 0;
        switch (filters.commodityCount) {
          case "none": return count === 0;
          case "low": return count >= 1 && count <= 5;
          case "medium": return count >= 6 && count <= 20;
          case "high": return count > 20;
          default: return true;
        }
      });
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(cat => {
        const catDate = new Date(cat.created_at);
        
        switch (filters.dateRange) {
          case "today":
            return catDate >= startOfDay;
          case "week":
            const weekAgo = new Date(startOfDay);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return catDate >= weekAgo;
          case "month":
            const monthAgo = new Date(startOfDay);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return catDate >= monthAgo;
          case "year":
            const yearAgo = new Date(startOfDay);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return catDate >= yearAgo;
          case "custom":
            let isValid = true;
            if (filters.customStartDate) {
              isValid = catDate >= new Date(filters.customStartDate);
            }
            if (filters.customEndDate && isValid) {
              const endDate = new Date(filters.customEndDate);
              endDate.setHours(23, 59, 59, 999);
              isValid = catDate <= endDate;
            }
            return isValid;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      hasDescription: "all",
      commodityCount: "all", 
      dateRange: "all",
      customStartDate: "",
      customEndDate: ""
    });
    setSearchTerm("");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.hasDescription !== "all") count++;
    if (filters.commodityCount !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (searchTerm) count++;
    return count;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}categories/${id}/`, {
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

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      if (currentCategory) {
        await axios.put(
          `${BASE_URL}categories/${currentCategory.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Category updated successfully");
      } else {
        await axios.post(`${BASE_URL}categories/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Category created successfully");
      }
      await fetchCategories();
      setIsModalOpen(false);
      setCurrentCategory(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "An error occurred");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-white">
                Category Management
              </h1>
              <p className="text-gray-400">
                Manage all product categories for your warehouses
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setCurrentCategory(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-sm transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg shadow-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={faInfoCircle} 
                  className="mr-2" 
                />
                {message}
              </div>
              <button onClick={() => setMessage("")} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-3 md:mb-0">
                <div className="relative mr-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-3 py-2 border rounded-lg flex items-center text-white hover:bg-gray-600 transition-colors relative ${
                    showAdvancedFilters ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                  }`}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">
                  <FontAwesomeIcon icon={faTags} className="mr-1" />
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Advanced Filters</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowAdvancedFilters(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Description Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Has Description</label>
                    <select
                      value={filters.hasDescription}
                      onChange={(e) => handleFilterChange('hasDescription', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="yes">With Description</option>
                      <option value="no">Without Description</option>
                    </select>
                  </div>

                  {/* Commodity Count Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Commodity Count</label>
                    <select
                      value={filters.commodityCount}
                      onChange={(e) => handleFilterChange('commodityCount', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Counts</option>
                      <option value="none">No Commodities (0)</option>
                      <option value="low">Low (1-5)</option>
                      <option value="medium">Medium (6-20)</option>
                      <option value="high">High (20+)</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Created Date</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="year">Past Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {/* Custom Date Range */}
                  {filters.dateRange === 'custom' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={filters.customStartDate}
                          onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Start Date"
                        />
                        <input
                          type="date"
                          value={filters.customEndDate}
                          onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                          placeholder="End Date"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('id')}
                  >
                    <div className="flex items-center">
                      ID {getSortIndicator('id')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Name {getSortIndicator('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('description')}
                  >
                    <div className="flex items-center">
                      Description {getSortIndicator('description')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('commodities_count')}
                  >
                    <div className="flex items-center">
                      Commodities {getSortIndicator('commodities_count')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('created_at')}
                  >
                    <div className="flex items-center text-white">
                      Created {getSortIndicator('created_at')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FontAwesomeIcon
                          icon={faTags}
                          className="text-4xl mb-3 text-blue-800"
                        />
                        <p className="text-lg font-medium text-gray-400">No categories found</p>
                        {(searchTerm || getActiveFilterCount() > 0) && (
                          <p className="text-sm mt-2 text-gray-400">
                            {searchTerm && `No results for "${searchTerm}"`}
                            {getActiveFilterCount() > 0 && " with current filters"}
                          </p>
                        )}
                        <div className="mt-4 space-x-2">
                          {(searchTerm || getActiveFilterCount() > 0) && (
                            <button
                              onClick={clearAllFilters}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              Clear Filters
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCurrentCategory(null);
                              setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Add New Category
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-blue-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #{category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faTags} className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white max-w-xs truncate">
                        {category.description || <span className="text-gray-400">No description</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.commodities_count > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.commodities_count || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => {
                              setCurrentCategory(category);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          {/* <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button> */}
                          <Link
                            to={`/categories/${category.id}/commodities`}
                            className="text-green-600 hover:text-green-900"
                            title="View Commodities"
                          >
                            <FontAwesomeIcon icon={faBoxes} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-gray-800 rounded-xl shadow-xl transform transition-all max-w-lg w-full z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {currentCategory ? "Update Category" : "Create New Category"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSubmit({
                  name: formData.get("name"),
                  description: formData.get("description")
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={currentCategory?.name || ""}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={currentCategory?.description || ""}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
                      rows="3"
                      placeholder="Optional description"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {currentCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;