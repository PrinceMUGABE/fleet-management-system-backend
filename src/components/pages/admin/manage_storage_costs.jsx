/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, faTrash, faDownload, faSearch, faUsers, faChartPie, 
  faUserPlus, faFilter, faCalendarAlt, faEnvelope, faPhone,
  faUserShield, faUserTie, faUserCheck, faSortAmountDown, faSortAmountUp,
  faChartBar, faChartArea, faWarehouse, faBoxes, faTag, faDollarSign
} from "@fortawesome/free-solid-svg-icons";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Pie, Cell } from 'recharts';

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
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Summary Card Component with new design
const SummaryCard = ({ icon, title, value, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${textColor} bg-opacity-10`}>
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
    </div>
  </div>
);

function StorageCosts() {
  const [costData, setCostData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCost, setCurrentCost] = useState({
    id: null,
    country: "",
    price_per_unit: "",
    currency: "USD",
    warehouse: "",
    category: "",
    commodity: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    warehouse: '',
    category: '',
    sortField: 'created_at',
    sortDirection: 'desc'
  });
  const navigate = useNavigate();
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
    fetchWarehouses();
  }, [navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/storage/costs/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCostData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching storage costs:", err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/warehouse/warehouses/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  const fetchCategories = async (warehouseId) => {
    try {
      let url = "http://127.0.0.1:8000/warehouse/categories/";
      if (warehouseId) {
        url = `http://127.0.0.1:8000/warehouse/warehouses/${warehouseId}/commodities/`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Extract unique categories from warehouse commodities
        const uniqueCategories = [...new Set(res.data.map(item => item.category_name))].map(name => {
          const item = res.data.find(i => i.category_name === name);
          return {
            id: item.commodity.category,
            name: item.category_name
          };
        });
        setCategories(uniqueCategories);
      } else {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCommodities = async (categoryId) => {
    try {
      const url = `http://127.0.0.1:8000/warehouse/commodities/`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (categoryId) {
        setCommodities(res.data.filter(item => item.category === categoryId));
      } else {
        setCommodities(res.data);
      }
    } catch (err) {
      console.error("Error fetching commodities:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this storage cost?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/storage/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await handleFetch();
      setMessage("Storage cost deleted successfully");
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
      doc.autoTable({ html: '#cost-table' });
      doc.save('storage_costs.pdf');
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredSortedData), "Storage Costs");
      XLSX.writeFile(workbook, "storage_costs.xlsx");
    },
    CSV: () => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(filteredSortedData[0]).join(",") + "\n" +
        filteredSortedData.map(row => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "storage_costs.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentCost({
      id: null,
      country: "",
      price_per_unit: "",
      currency: "USD",
      warehouse: "",
      category: "",
      commodity: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cost) => {
    setIsEditMode(true);
    setCurrentCost({
      id: cost.id,
      country: cost.country,
      price_per_unit: cost.price_per_unit,
      currency: cost.currency,
      warehouse: cost.warehouse?.id || "",
      category: cost.category?.id || "",
      commodity: ""
    });
    if (cost.warehouse?.id) {
      fetchCategories(cost.warehouse.id);
    }
    if (cost.category?.id) {
      fetchCommodities(cost.category.id);
    }
    setIsModalOpen(true);
  };

  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value;
    setCurrentCost({
      ...currentCost,
      warehouse: warehouseId,
      category: "",
      commodity: ""
    });
    fetchCategories(warehouseId);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setCurrentCost({
      ...currentCost,
      category: categoryId,
      commodity: ""
    });
    fetchCommodities(categoryId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCost({
      ...currentCost,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const costData = {
        country: currentCost.country,
        price_per_unit: currentCost.price_per_unit,
        currency: currentCost.currency,
        warehouse: currentCost.warehouse || null,
        category: currentCost.category || null
      };

      if (isEditMode) {
        await axios.put(`http://127.0.0.1:8000/storage/update/${currentCost.id}/`, costData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Storage cost updated successfully");
      } else {
        await axios.post("http://127.0.0.1:8000/storage/create/", costData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Storage cost created successfully");
      }
      setMessageType("success");
      setIsModalOpen(false);
      handleFetch();
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return costData
      .filter(cost => {
        const matchesSearch = [cost.country, cost.price_per_unit, cost.currency, cost.created_at]
          .some(field => field?.toString().toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCountry = !filters.country || cost.country.toLowerCase().includes(filters.country.toLowerCase());
        const matchesWarehouse = !filters.warehouse || 
          (cost.warehouse && cost.warehouse.id.toString() === filters.warehouse);
        const matchesCategory = !filters.category || 
          (cost.category && cost.category.id.toString() === filters.category);
        
        return matchesSearch && matchesCountry && matchesWarehouse && matchesCategory;
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];
        
        if (filters.sortDirection === 'asc') {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
  }, [costData, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const countryCount = [...new Set(costData.map(cost => cost.country))].length;
    const averagePrice = costData.reduce((sum, cost) => sum + parseFloat(cost.price_per_unit), 0) / costData.length || 0;
    
    return {
      total: costData.length,
      countries: countryCount,
      averagePrice: averagePrice.toFixed(2),
      warehouses: [...new Set(costData.filter(cost => cost.warehouse).map(cost => cost.warehouse.id))].length
    };
  }, [costData]);

  const renderCharts = () => {
    if (!costData.length) return null;

    const countryData = Object.entries(
      costData.reduce((acc, cost) => {
        acc[cost.country] = (acc[cost.country] || 0) + 1;
        return acc;
      }, {})
    ).map(([country, count]) => ({ country, count }));

    const priceDistribution = costData.map(cost => ({
      id: cost.id,
      price: parseFloat(cost.price_per_unit),
      country: cost.country,
      warehouse: cost.warehouse?.location || 'Global'
    })).sort((a, b) => a.price - b.price);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-2 text-blue-500" />
              Cost by Country
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="country" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Costs"
                    radius={[4, 4, 0, 0]}
                    fill="#3B82F6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <FontAwesomeIcon icon={faChartArea} className="mr-2 text-blue-500" />
              Price Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceDistribution}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="warehouse" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    name="Price per Unit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const currentItems = filteredSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        {/* Cost Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  {isEditMode ? "Edit Storage Cost" : "Create New Storage Cost"}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={currentCost.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Price Per Unit
                    </label>
                    <input
                      type="number"
                      name="price_per_unit"
                      value={currentCost.price_per_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={currentCost.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="RWF">RWF</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Warehouse (Optional)
                    </label>
                    <select
                      name="warehouse"
                      value={currentCost.warehouse}
                      onChange={handleWarehouseChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                    >
                      <option value="">Select Warehouse (Optional)</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Category (Optional)
                    </label>
                    <select
                      name="category"
                      value={currentCost.category}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                      disabled={!currentCost.warehouse}
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {isEditMode ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Storage Cost Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage and analyze storage costs for commodities based on origin country and warehouse
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <SummaryCard 
              icon={faDollarSign} 
              title="Total Costs" 
              value={summaryMetrics.total} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-blue-600 dark:text-blue-400" 
            />
            <SummaryCard 
              icon={faWarehouse} 
              title="Warehouses" 
              value={summaryMetrics.warehouses} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-green-600 dark:text-green-400" 
            />
            <SummaryCard 
              icon={faTag} 
              title="Countries" 
              value={summaryMetrics.countries} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-yellow-600 dark:text-yellow-400" 
            />
            <SummaryCard 
              icon={faChartPie} 
              title="Avg Price" 
              value={`$${summaryMetrics.averagePrice}`} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-red-600 dark:text-red-400" 
            />
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            {/* Controls Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search costs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuVisible(!filterMenuVisible)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Filters</span>
                  </button>
                  {filterMenuVisible && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-4 z-10 border border-gray-200 dark:border-gray-600 w-64">
                      <h4 className="font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">Advanced Filters</h4>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Country</label>
                        <input
                          type="text"
                          value={filters.country}
                          onChange={e => setFilters({...filters, country: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Warehouse</label>
                        <select
                          value={filters.warehouse}
                          onChange={e => setFilters({...filters, warehouse: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        >
                          <option value="">All Warehouses</option>
                          {warehouses.map(warehouse => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.location}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                        <select
                          value={filters.category}
                          onChange={e => setFilters({...filters, category: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sort By</label>
                        <div className="flex gap-2">
                          <select
                            value={filters.sortField}
                            onChange={e => setFilters({...filters, sortField: e.target.value})}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                          >
                            <option value="created_at">Date Created</option>
                            <option value="country">Country</option>
                            <option value="price_per_unit">Price</option>
                          </select>
                          <button
                            onClick={() => setFilters({
                              ...filters, 
                              sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
                            })}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                            title={filters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                          >
                            <FontAwesomeIcon icon={filters.sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => {
                            setFilters({
                              country: '',
                              warehouse: '',
                              category: '',
                              sortField: 'created_at',
                              sortDirection: 'desc'
                            });
                            setFilterMenuVisible(false);
                          }}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setFilterMenuVisible(false)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Export</span>
                  </button>
                  {downloadMenuVisible && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-10 border border-gray-200 dark:border-gray-600 w-32">
                      {Object.keys(handleDownload).map(format => (
                        <button
                          key={format}
                          onClick={() => {
                            handleDownload[format]();
                            setDownloadMenuVisible(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-sm"
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Add Cost</span>
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.country || filters.warehouse || filters.category) && (
              <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Active Filters:</span>
                {filters.country && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Country: {filters.country}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, country: ''})}>
                      ×
                    </button>
                  </span>
                )}
                {filters.warehouse && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Warehouse: {warehouses.find(w => w.id.toString() === filters.warehouse)?.location}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, warehouse: ''})}>
                      ×
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Category: {categories.find(c => c.id.toString() === filters.category)?.name}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, category: ''})}>
                      ×
                    </button>
                  </span>
                )}
                <button 
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  onClick={() => setFilters({
                    country: '',
                    warehouse: '',
                    category: '',
                    sortField: 'created_at',
                    sortDirection: 'desc'
                  })}>
                  Clear All
                </button>
              </div>
            )}

            {/* Costs Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <table id="cost-table" className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">#</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faTag} className="mr-2" />
                        Country
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                        Price/Unit
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                        Warehouse
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                        Category
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        Created
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.length > 0 ? (
                    currentItems.map((cost, index) => (
                      <tr key={cost.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {cost.country}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                            {cost.currency} {parseFloat(cost.price_per_unit).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {cost.warehouse ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {cost.warehouse.location}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 italic">Global</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {cost.category ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {cost.category.name}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 italic">All Categories</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(cost.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(cost)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDelete(cost.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <FontAwesomeIcon icon={faDollarSign} className="text-4xl mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">No storage costs found</p>
                          <p className="text-sm">Try adjusting your search or filters, or create a new storage cost.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredSortedData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={e => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    entries (showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSortedData.length)} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredSortedData.length)} of {filteredSortedData.length})
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.ceil(filteredSortedData.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === Math.ceil(filteredSortedData.length / itemsPerPage) || 
                      Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm border rounded-lg transition ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(Math.ceil(filteredSortedData.length / itemsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(filteredSortedData.length / itemsPerPage)}
                    className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          {renderCharts()}

          {/* Success/Error Messages */}
          {message && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              messageType === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {messageType === 'success' ? '✓' : '⚠'}
                </span>
                {message}
                <button 
                  onClick={() => setMessage('')}
                  className="ml-4 text-lg leading-none hover:opacity-70"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default StorageCosts;