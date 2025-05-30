/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
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
  faBoxOpen, 
  faChartPie, 
  faPlus, 
  faFilter,
  faInfoCircle,
  faExclamationTriangle,
  faSortAmountDown,
  faSortAmountUp,
  faTimes,
  faTable,
  faSync,
  faTh
} from "@fortawesome/free-solid-svg-icons";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
// import { FaSync, FaTable } from "react-icons/fa";

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
        <div className="p-4 text-red-100 bg-red-900 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Add Inventory Modal Component
const InventoryModal = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Packing Material",
    unit_price: 0,
    stock: {
      quantity_available: 0,
      reorder_threshold: 5
    }
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "Packing Material",
        unit_price: initialData.unit_price || 0,
        stock: {
          quantity_available: initialData.stock?.quantity_available || 0,
          reorder_threshold: initialData.stock?.reorder_threshold || 5
        }
      });
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('stock.')) {
      const stockField = name.split('.')[1];
      setFormData({
        ...formData,
        stock: {
          ...formData.stock,
          [stockField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.unit_price < 0) newErrors.unit_price = "Price cannot be negative";
    if (formData.stock.quantity_available < 0) newErrors.quantity_available = "Quantity cannot be negative";
    if (formData.stock.reorder_threshold < 0) newErrors.reorder_threshold = "Threshold cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Item Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-red-500`}
              placeholder="Enter item name"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter item description"
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Category*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="Packing Material">Packing Material</option>
              <option value="Storage Unit">Storage Unit</option>
              <option value="Moving Equipment">Moving Equipment</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Unit Price (USD)*</label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${errors.unit_price ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-red-500`}
              placeholder="0.00"
            />
            {errors.unit_price && <p className="text-red-500 text-xs">{errors.unit_price}</p>}
          </div>
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-medium text-white mb-3">Stock Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">Quantity Available*</label>
                <input
                  type="number"
                  name="stock.quantity_available"
                  value={formData.stock.quantity_available}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${errors.quantity_available ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="0"
                />
                {errors.quantity_available && <p className="text-red-500 text-xs">{errors.quantity_available}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-medium">Reorder Threshold*</label>
                <input
                  type="number"
                  name="stock.reorder_threshold"
                  value={formData.stock.reorder_threshold}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${errors.reorder_threshold ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="5"
                />
                {errors.reorder_threshold && <p className="text-red-500 text-xs">{errors.reorder_threshold}</p>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {isEditing ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inventory Item Card Component
const InventoryCard = ({ item, onEdit, onDelete }) => {
  const isLowStock = item.stock.quantity_available <= item.stock.reorder_threshold;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden transition duration-300 hover:shadow-xl hover:border-gray-600">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.category === 'Packing Material' ? 'bg-blue-600 text-white' :
            item.category === 'Storage Unit' ? 'bg-purple-600 text-white' :
            'bg-yellow-500 text-gray-900'
          }`}>
            {item.category}
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2 h-12 overflow-hidden">
          {item.description || "No description available"}
        </p>
      </div>
      
      <div className="border-t border-gray-700 px-4 py-3 bg-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs">Price</p>
            <p className="text-white font-medium">${parseFloat(item.unit_price).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Stock</p>
            <p className={`font-medium ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
              {item.stock.quantity_available} units
              {isLowStock && <FontAwesomeIcon icon={faExclamationTriangle} className="ml-1 text-yellow-500" />}
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 px-4 py-3 flex justify-between items-center">
        <button 
          onClick={() => onEdit(item)}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FontAwesomeIcon icon={faTrash} /> Delete
        </button>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, title, value, bgColor, textColor }) => {
  return (
    <div className={`rounded-lg shadow-lg p-5 ${bgColor}`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${textColor} bg-opacity-20`}>
          <FontAwesomeIcon icon={icon} size="lg" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

function Dispatcher_Manage_Inventory() {
  const [inventoryData, setInventoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table", "grid"
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    stockStatus: "" // "all", "low", "normal"
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc"
  });
  
  const navigate = useNavigate();
  
  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#F9F871'];
  const token = localStorage.getItem("token");
  const BASE_URL = "http://127.0.0.1:8000/inventory/";

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    fetchInventory();
  }, [navigate]);

  const fetchInventory = async () => {
    try {
      setMessage("");
      const res = await axios.get(`${BASE_URL}inventories/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform the data to include stock info
      const transformedData = Array.isArray(res.data) ? res.data.map(item => ({
        ...item,
        stock: item.stock || { quantity_available: 0, reorder_threshold: 5 }
      })) : [];
      
      setInventoryData(transformedData);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setMessage("Failed to load inventory data");
      setMessageType("error");
    }
  };

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmitInventory = async (formData) => {
    try {
      if (currentItem) {
        // Update existing item
        await axios.put(`${BASE_URL}update/${currentItem.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update stock
        await axios.put(`${BASE_URL}update/${currentItem.id}/`, formData.stock, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMessage("Inventory item updated successfully");
      } else {
        // Create new item
        const { stock, ...itemData } = formData;
        const response = await axios.post(`${BASE_URL}create/`, itemData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Create stock for new item
        if (response.data && response.data.id) {
          await axios.put(`${BASE_URL}update/${response.data.id}/`, stock, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        setMessage("Inventory item added successfully");
      }
      
      setMessageType("success");
      handleCloseModal();
      fetchInventory();
    } catch (err) {
      console.error("Error saving inventory:", err);
      setMessage(err.response?.data?.error || "An error occurred while saving");
      setMessageType("error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this inventory item?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchInventory();
      setMessage("Inventory item deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data?.error || "An error occurred while deleting");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      // Add title
      doc.setFontSize(20);
      doc.text("Inventory Report", 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
      
      // Define the columns for the table
      const columns = [
        { header: 'Name', dataKey: 'name' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Price ($)', dataKey: 'unit_price' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Threshold', dataKey: 'threshold' }
      ];
      
      // Transform data for the table
      const data = filteredData.map(item => ({
        name: item.name,
        category: item.category,
        unit_price: parseFloat(item.unit_price).toFixed(2),
        quantity: item.stock.quantity_available,
        threshold: item.stock.reorder_threshold
      }));
      
      // Create the table
      doc.autoTable({
        startY: 30,
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey])),
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      doc.save('inventory_report.pdf');
    },
    Excel: () => {
      // Transform data for Excel
      const data = filteredData.map(item => ({
        Name: item.name,
        Description: item.description,
        Category: item.category,
        'Unit Price ($)': parseFloat(item.unit_price).toFixed(2),
        'Quantity Available': item.stock.quantity_available,
        'Reorder Threshold': item.stock.reorder_threshold,
        'Low Stock': item.stock.quantity_available <= item.stock.reorder_threshold ? 'Yes' : 'No',
        'Creation Date': new Date(item.created_at).toLocaleDateString()
      }));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "Inventory");
      XLSX.writeFile(workbook, "inventory_report.xlsx");
    },
    CSV: () => {
      // Transform data for CSV
      const data = filteredData.map(item => ({
        Name: item.name,
        Description: item.description,
        Category: item.category,
        UnitPrice: parseFloat(item.unit_price).toFixed(2),
        QuantityAvailable: item.stock.quantity_available,
        ReorderThreshold: item.stock.reorder_threshold,
        LowStock: item.stock.quantity_available <= item.stock.reorder_threshold ? 'Yes' : 'No',
        CreationDate: new Date(item.created_at).toLocaleDateString()
      }));
      
      const csvRows = [];
      // Add header row
      const headers = Object.keys(data[0]);
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Handle values that contain commas or quotes
          return `"${val}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "inventory_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      stockStatus: ""
    });
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting
  const filteredData = inventoryData.filter(item => {
    // Search query
    const searchMatch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Category filter
    const categoryMatch = !filters.category || item.category === filters.category;
    
    // Price filter
    const priceMatch = (
      (!filters.minPrice || parseFloat(item.unit_price) >= parseFloat(filters.minPrice)) &&
      (!filters.maxPrice || parseFloat(item.unit_price) <= parseFloat(filters.maxPrice))
    );
    
    // Stock status filter
    let stockMatch = true;
    if (filters.stockStatus === "low") {
      stockMatch = item.stock.quantity_available <= item.stock.reorder_threshold;
    } else if (filters.stockStatus === "normal") {
      stockMatch = item.stock.quantity_available > item.stock.reorder_threshold;
    }
    
    return searchMatch && categoryMatch && priceMatch && stockMatch;
  }).sort((a, b) => {
    if (sortConfig.key === 'unit_price') {
      return sortConfig.direction === 'asc' 
        ? parseFloat(a.unit_price) - parseFloat(b.unit_price)
        : parseFloat(b.unit_price) - parseFloat(a.unit_price);
    } else if (sortConfig.key === 'stock') {
      return sortConfig.direction === 'asc'
        ? a.stock.quantity_available - b.stock.quantity_available
        : b.stock.quantity_available - a.stock.quantity_available;
    } else {
      // For text fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
  });

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const renderInventoryCharts = () => {
    if (!inventoryData.length) return null;

    // Category distribution data
    const categoryData = Object.entries(
      inventoryData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    ).map(([category, count]) => ({ name: category, value: count }));

    // Stock level data
    const stockData = inventoryData.map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      stock: item.stock.quantity_available,
      threshold: item.stock.reorder_threshold
    })).sort((a, b) => a.stock - b.stock).slice(0, 10); // Show top 10 lowest stock

    // Inventory value by category
    const valueData = Object.entries(
      inventoryData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (parseFloat(item.unit_price) * item.stock.quantity_available);
        return acc;
      }, {})
    ).map(([category, value]) => ({ name: category, value: parseFloat(value.toFixed(2)) }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Inventory by Category
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  label={{
                    position: 'outside',
                    offset: 10,
                    fill: '#e5e7eb'
                  }}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
              Stock Levels (Lowest 10)
            </h3>
            <ResponsiveContainer>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#e5e7eb' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#e5e7eb' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e5e7eb' }} />
                <Bar dataKey="stock" name="Current Stock" fill="#4ECDC4" />
                <Bar dataKey="threshold" name="Reorder Threshold" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Inventory Value by Category
            </h3>
            <ResponsiveContainer>
              <BarChart data={valueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#e5e7eb' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
                  formatter={(value) => [`$${value}`, 'Value']}
                />
                <Bar dataKey="value" name="Total Value ($)" fill="#FFD166">
                  {valueData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  // Summary cards for inventory overview
  const renderSummaryCards = () => {
    // Calculate summary metrics
    const totalItems = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.stock.quantity_available), 0).toFixed(2);
    const lowStockCount = inventoryData.filter(item => item.stock.quantity_available <= item.stock.reorder_threshold).length;
    const uniqueCategories = [...new Set(inventoryData.map(item => item.category))].length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard 
          icon={faBoxOpen} 
          title="Total Inventory Items" 
          value={totalItems} 
          bgColor="bg-gray-800" 
          textColor="text-blue-400" 
        />
        <SummaryCard 
          icon={faChartPie} 
          title="Inventory Value" 
          value={`$${totalValue}`} 
          bgColor="bg-gray-800" 
          textColor="text-green-400" 
        />
        <SummaryCard 
          icon={faExclamationTriangle} 
          title="Low Stock Items" 
          value={lowStockCount} 
          bgColor="bg-gray-800" 
          textColor="text-red-400" 
        />
        <SummaryCard 
          icon={faFilter} 
          title="Categories" 
          value={uniqueCategories} 
          bgColor="bg-gray-800" 
          textColor="text-purple-400" 
        />
      </div>
    );
  };

  // Render inventory table view
  const renderTableView = () => {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortConfig.key === 'name' && (
                      <FontAwesomeIcon 
                        icon={sortConfig.direction === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        size="sm"
                        className="text-red-400" 
                      />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {sortConfig.key === 'category' && (
                      <FontAwesomeIcon 
                        icon={sortConfig.direction === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        size="sm" 
                        className="text-red-400"
                      />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('unit_price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    {sortConfig.key === 'unit_price' && (
                      <FontAwesomeIcon 
                        icon={sortConfig.direction === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        size="sm" 
                        className="text-red-400"
                      />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock</span>
                    {sortConfig.key === 'stock' && (
                      <FontAwesomeIcon 
                        icon={sortConfig.direction === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        size="sm" 
                        className="text-red-400"
                      />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Threshold
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.category === 'Packing Material' ? 'bg-blue-800 text-blue-100' :
                        item.category === 'Storage Unit' ? 'bg-purple-800 text-purple-100' :
                        'bg-yellow-800 text-yellow-100'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        item.stock.quantity_available <= item.stock.reorder_threshold 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {item.stock.quantity_available}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.stock.reorder_threshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.stock.quantity_available <= item.stock.reorder_threshold ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 transition"
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
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                    {searchQuery || filters.category || filters.minPrice || filters.maxPrice || filters.stockStatus
                      ? "No items match the current filters"
                      : "No inventory items found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render inventory grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleOpenModal(item)} 
              onDelete={() => handleDelete(item.id)} 
            />
          ))
        ) : (
          <div className="col-span-full p-6 text-center text-gray-400 bg-gray-800 rounded-lg">
            {searchQuery || filters.category || filters.minPrice || filters.maxPrice || filters.stockStatus
              ? "No items match the current filters"
              : "No inventory items found"}
          </div>
        )}
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    return (
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <span className="text-gray-400 text-sm">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} items
          </span>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-l-md ${
              currentPage === 1 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border-l border-gray-600 ${
              currentPage === 1 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Prev
          </button>
          
          {/* Page numbers */}
          {[...Array(totalPages).keys()].map(number => {
            // Show 5 pages around current page
            if (
              number === 0 || 
              number === totalPages - 1 || 
              (number >= currentPage - 2 && number <= currentPage + 2)
            ) {
              return (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number + 1)}
                  className={`px-3 py-1 border-l border-gray-600 ${
                    currentPage === number + 1
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {number + 1}
                </button>
              );
            } else if (
              number === currentPage - 3 || 
              number === currentPage + 3
            ) {
              return (
                <span key={number} className="px-3 py-1 border-l border-gray-600 bg-gray-700 text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          })}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border-l border-gray-600 ${
              currentPage === totalPages 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-r-md border-l border-gray-600 ${
              currentPage === totalPages 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  // Filter panel
  const renderFilterPanel = () => {
    return (
      <div className={`bg-gray-800 rounded-lg shadow-lg p-6 mb-6 ${isFiltersOpen ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              <option value="Packing Material">Packing Material</option>
              <option value="Storage Unit">Storage Unit</option>
              <option value="Moving Equipment">Moving Equipment</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Min Price ($)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Min"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Max Price ($)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Max"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Stock Status</label>
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Items</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700 transition"
          >
            Reset
          </button>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-gray-400 mt-1">Manage your inventory items, track stock levels, and generate reports</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Item
            </button>
            
            <div className="relative">
              <button
                onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export
              </button>
              
              {downloadMenuVisible && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleDownload.PDF();
                        setDownloadMenuVisible(false);
                      }}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        handleDownload.Excel();
                        setDownloadMenuVisible(false);
                      }}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => {
                        handleDownload.CSV();
                        setDownloadMenuVisible(false);
                      }}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                    >
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => fetchInventory()}
              title="Refresh Data"
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              <FontAwesomeIcon icon={faSync} />
            </button>
          </div>
        </div>
        
        {/* Alert Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={messageType === 'success' ? faInfoCircle : faExclamationTriangle} 
                className="mr-3"
              />
              <p>{message}</p>
            </div>
          </div>
        )}
        
        {/* Summary Cards */}
        {renderSummaryCards()}
        
        {/* Search and Filters Section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, description or category..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between lg:justify-end space-x-3">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <div className="flex space-x-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${viewMode === "table" ? "bg-gray-700" : ""}`}
                title="Table View"
              >
                <FontAwesomeIcon icon={faTable} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-700" : ""}`}
                title="Grid View"
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Panel */}
        {renderFilterPanel()}
        
        {/* Inventory Visualization - Conditional Rendering */}
        {inventoryData.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Inventory Analytics</h2>
            </div>
            {renderInventoryCharts()}
          </div>
        )}
        
        {/* Inventory Items Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Inventory Items</h2>
            <div className="text-sm text-gray-400">
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'} found
            </div>
          </div>
          
          {viewMode === "table" ? renderTableView() : renderGridView()}
        </div>
        
        {/* Pagination */}
        {filteredData.length > itemsPerPage && renderPagination()}
      </div>
      
      {/* Inventory Modal */}
      <InventoryModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitInventory}
        initialData={currentItem}
        isEditing={!!currentItem}
      />
    </div>
  );
}

export default Dispatcher_Manage_Inventory;