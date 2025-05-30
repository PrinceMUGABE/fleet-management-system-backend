/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faChartPie,
  faUserPlus,
  faFilter,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faSortAmountDown,
  faSortAmountUp,
  faChartBar,
  faBox,
  faWarehouse,
  faBoxes,
  faDollarSign,
  faTruck,
  faUser,
  faBoxOpen,
  faCheck,
  faBan,
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

// ErrorBoundary component remains the same
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

// Summary Card Component
const SummaryCard = ({ icon, title, value, bgColor, textColor }) => (
  <div
    className={`${bgColor} rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-500 dark:text-blue-400">
          {title}
        </p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${textColor} bg-opacity-10`}>
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const statusClasses = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    confirmed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusIcons = {
    pending: faBoxOpen,
    confirmed: faCheckCircle,
    rejected: faTimesCircle,
  };

  const statusText = {
    pending: "Pending",
    confirmed: "Confirmed",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}
    >
      <FontAwesomeIcon icon={statusIcons[status]} className="mr-1" />
      {statusText[status]}
    </span>
  );
};

// Availability status badge component
const AvailabilityBadge = ({ status }) => {
  const statusClasses = {
    waiting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    imported:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    exported:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  };

  const statusText = {
    waiting: "Waiting",
    imported: "Imported",
    exported: "Exported",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}
    >
      {statusText[status]}
    </span>
  );
};

function Driver_OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    id: null,
    origin: "",
    cost_charged: "",
    warehouse: "",
    category: "",
    commodity: "",
    quantity: "",
    status: "pending",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    warehouse: "",
    category: "",
    sortField: "created_at",
    sortDirection: "desc",
  });
  const navigate = useNavigate();

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
  const token = localStorage.getItem("token");
  const [categories, setCategories] = useState([]); // Initialize as empty array

  // Add these state variables
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [costData, setCostData] = useState([]);

  // Fetch cost data on component mount
  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/storage/costs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCostData(res.data);
      // Extract unique countries
      const uniqueCountries = [
        ...new Set(res.data.map((item) => item.country)),
      ];
      setCountries(uniqueCountries);
    } catch (err) {
      console.error("Error fetching cost data:", err);
    }
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedWarehouse("");
    setSelectedCategory("");
    setSelectedCommodity("");
    setCurrentOrder({
      ...currentOrder,
      warehouse: "",
      category: "",
      commodity: "",
      cost_charged: "",
    });
  };

  const handleWarehouseChange = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    setSelectedCategory("");
    setSelectedCommodity("");
    setCurrentOrder({
      ...currentOrder,
      category: "",
      commodity: "",
      cost_charged: "",
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedCommodity("");
    setCurrentOrder({
      ...currentOrder,
      commodity: "",
      cost_charged: "",
    });
  };

  const handleCommodityChange = (commodityId) => {
    setSelectedCommodity(commodityId);
    setCurrentOrder({
      ...currentOrder,
      commodity: commodityId,
      cost_charged: "",
    });
  };

  const calculateTotalCost = () => {
    if (
      !selectedCountry ||
      !selectedWarehouse ||
      !selectedCategory ||
      !selectedCommodity ||
      !currentOrder.quantity
    ) {
      return;
    }

    // Find the cost record that matches all selections
    const costRecord = costData.find(
      (item) =>
        item.country === selectedCountry &&
        item.warehouse === parseInt(selectedWarehouse) &&
        item.category === parseInt(selectedCategory) &&
        item.commodity === parseInt(selectedCommodity)
    );

    if (costRecord) {
      const totalCost =
        parseFloat(costRecord.price_per_unit) *
        parseFloat(currentOrder.quantity);
      setCurrentOrder({
        ...currentOrder,
        cost_charged: totalCost.toFixed(2),
      });
    }
  };

  // Call calculateTotalCost whenever quantity changes
  useEffect(() => {
    if (currentOrder.quantity && selectedCommodity) {
      calculateTotalCost();
    }
  }, [currentOrder.quantity, selectedCommodity]);

  // Status options for dropdowns
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rejected", label: "Rejected" },
  ];

  const availabilityStatusOptions = [
    { value: "waiting", label: "Waiting" },
    { value: "imported", label: "Imported" },
    { value: "exported", label: "Exported" },
  ];

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    fetchOrders();
    fetchWarehouses();
    fetchDrivers();
    fetchVehicles();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/order/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched orders:", res.data);
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setMessage("Failed to fetch orders");
      setMessageType("error");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/warehouse/warehouses/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  const fetchCategories = async (warehouseId) => {
    try {
      const url = warehouseId
        ? `http://127.0.0.1:8000/warehouse/warehouses/${warehouseId}/categories/`
        : `http://127.0.0.1:8000/warehouse/categories/`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched categories:", res.data);
      // Extract categories from the nested response
      const categoriesData = res.data.categories || res.data; // Fallback to direct array if no nesting
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchCommodities = async (categoryId) => {
    try {
      const url = categoryId
        ? `http://127.0.0.1:8000/warehouse/categories/${categoryId}/commodities/`
        : `http://127.0.0.1:8000/warehouse/commodities/`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched commodities:", res.data);
      // Extract commodities from the nested response
      const commoditiesData = res.data.commodities || res.data; // Fallback to direct array if no nesting
      setCommodities(Array.isArray(commoditiesData) ? commoditiesData : []);
    } catch (err) {
      console.error("Error fetching commodities:", err);
      setCommodities([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/driver/drivers/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/vehicle/list_vehicles/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVehicles(res.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/order/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchOrders();
      setMessage("Order deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "Failed to delete order");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.text("Order Management Report", 15, 15);
      doc.autoTable({
        html: "#order-table",
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
      doc.save("orders_report.pdf");
    },
    Excel: () => {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredSortedData.map((order) => ({
          ID: order.id,
          Origin: order.origin,
          Cost: order.cost_charged,
          Status: order.status,
          Warehouse: order.warehouse?.location || "N/A",
          Commodity: order.commodity?.name || "N/A",
          Quantity: order.quantity,
          Created: new Date(order.created_at).toLocaleDateString(),
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      XLSX.writeFile(workbook, "orders_report.xlsx");
    },
    CSV: () => {
      const csvData = [
        [
          "ID",
          "Origin",
          "Cost",
          "Status",
          "Warehouse",
          "Commodity",
          "Quantity",
          "Created",
        ],
        ...filteredSortedData.map((order) => [
          order.id,
          order.origin,
          order.cost_charged,
          order.status,
          order.warehouse?.location || "N/A",
          order.commodity?.name || "N/A",
          order.quantity,
          new Date(order.created_at).toLocaleDateString(),
        ]),
      ];
      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "orders_report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentOrder({
      id: null,
      origin: "",
      cost_charged: "",
      warehouse: "",
      category: "",
      commodity: "",
      quantity: "",
      status: "pending",
    });
    fetchCategories();
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setIsEditMode(true);
    setCurrentOrder({
      id: order.id,
      origin: order.origin,
      cost_charged: order.cost_charged,
      warehouse: order.warehouse?.id || "",
      category: order.category?.id || "",
      commodity: order.commodity?.id || "",
      quantity: order.quantity,
      status: order.status,
      phone_number: order.phone_number || "",
    });

    // Set the selected values from the order data
    setSelectedCountry(order.origin);
    setSelectedWarehouse(order.warehouse?.id?.toString() || "");
    setSelectedCategory(order.category?.id?.toString() || "");
    setSelectedCommodity(order.commodity?.id?.toString() || "");

    // Fetch categories and commodities based on the order's warehouse and category
    if (order.warehouse?.id) {
      fetchCategories(order.warehouse.id);
    }
    if (order.category?.id) {
      fetchCommodities(order.category.id);
    }

    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({
      ...currentOrder,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        origin: selectedCountry,
        cost_charged: currentOrder.cost_charged,
        warehouse: selectedWarehouse,
        category: selectedCategory,
        commodity: selectedCommodity,
        quantity: currentOrder.quantity,
        status: currentOrder.status,
        phone_number: currentOrder.phone_number, // Add phone number
      };

      if (isEditMode) {
        await axios.put(
          `http://127.0.0.1:8000/order/${currentOrder.id}/update/`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Order updated successfully");
      } else {
        await axios.post("http://127.0.0.1:8000/order/create/", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Order created successfully");
      }
      setMessageType("success");
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data.message || "Failed to save order");
      setMessageType("error");
    }
  };

  const confirmOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to confirm this order?")) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/order/${orderId}/confirm/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Order confirmed successfully");
      setMessageType("success");
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data.message || "Failed to confirm order");
      setMessageType("error");
    }
  };

  const rejectOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to reject this order?")) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/order/${orderId}/reject/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Order rejected successfully");
      setMessageType("success");
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data.message || "Failed to reject order");
      setMessageType("error");
    }
  };

  const exportOrder = async (orderId) => {
    if (!window.confirm("Mark this order as exported?")) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/order/${orderId}/export/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Order marked as exported");
      setMessageType("success");
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data.message || "Failed to export order");
      setMessageType("error");
    }
  };

  const filteredSortedData = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch = [
          order.origin,
          order.cost_charged,
          order.status,
          order.commodity_detail?.name,
        ].some((field) =>
          field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesStatus =
          !filters.status || order.status === filters.status;
        const matchesWarehouse =
          !filters.warehouse ||
          (order.warehouse_detail &&
            order.warehouse_detail.id.toString() === filters.warehouse);
        const matchesCategory =
          !filters.category ||
          (order.category_detail &&
            order.category_detail.id.toString() === filters.category);

        return (
          matchesSearch && matchesStatus && matchesWarehouse && matchesCategory
        );
      })
      .sort((a, b) => {
        const fieldA = a[filters.sortField];
        const fieldB = b[filters.sortField];

        if (filters.sortDirection === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
  }, [orders, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const confirmedCount = orders.filter(
      (o) => o.status === "confirmed"
    ).length;
    const rejectedCount = orders.filter((o) => o.status === "rejected").length;
    const totalValue = orders.reduce(
      (sum, order) => sum + parseFloat(order.cost_charged || 0),
      0
    );

    return {
      total: orders.length,
      pending: pendingCount,
      confirmed: confirmedCount,
      rejected: rejectedCount,
      totalValue: totalValue.toFixed(2),
      warehouses: [
        ...new Set(
          orders
            .filter((o) => o.warehouse_detail)
            .map((o) => o.warehouse_detail.id)
        ),
      ].length,
    };
  }, [orders]);

  const renderCharts = () => {
    if (!orders.length) return null;

    const statusData = [
      { name: "Pending", value: summaryMetrics.pending },
      { name: "Confirmed", value: summaryMetrics.confirmed },
      { name: "Rejected", value: summaryMetrics.rejected },
    ];

    const warehouseData = Object.entries(
      orders.reduce((acc, order) => {
        const warehouse = order.warehouse?.location || "Unknown";
        acc[warehouse] = (acc[warehouse] || 0) + 1;
        return acc;
      }, {})
    ).map(([warehouse, count]) => ({ warehouse, count }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ErrorBoundary>
          <div className="bg-gray-700 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200 flex items-center">
              <FontAwesomeIcon
                icon={faChartPie}
                className="mr-2 text-blue-500"
              />
              Order Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
                      `${name}: ${(percent * 100).toFixed(0)}%`
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
                    formatter={(value) => [`${value} orders`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-700 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200 flex items-center">
              <FontAwesomeIcon
                icon={faChartBar}
                className="mr-2 text-blue-500"
              />
              Orders by Warehouse
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="warehouse"
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                  />
                  <YAxis tick={{ fill: "#6b7280" }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#1f2937" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Orders"
                    radius={[4, 4, 0, 0]}
                    fill="#3B82F6"
                  />
                </BarChart>
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
        {/* Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-700 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
                  {isEditMode ? "Edit Order" : "Create New Order"}
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* Country Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Country/Origin
                    </label>
                    <select
                      name="origin"
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warehouse Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Warehouse
                    </label>
                    <select
                      name="warehouse"
                      value={selectedWarehouse}
                      onChange={(e) => handleWarehouseChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      required
                      disabled={!selectedCountry}
                    >
                      <option value="">Select Warehouse</option>
                      {costData
                        .filter((item) => item.country === selectedCountry)
                        .map((item) => (
                          <option
                            key={item.warehouse}
                            value={item.warehouse.toString()} // Ensure string comparison
                          >
                            {item.warehouse_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Category Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Category
                    </label>
                    <select
                      name="category"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      required
                      disabled={!selectedWarehouse}
                    >
                      <option value="">Select Category</option>
                      {costData
                        .filter(
                          (item) =>
                            item.country === selectedCountry &&
                            item.warehouse === parseInt(selectedWarehouse)
                        )
                        .map((item) => (
                          <option
                            key={item.category}
                            value={item.category.toString()} // Ensure string comparison
                          >
                            {item.category_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Commodity Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Commodity
                    </label>
                    <select
                      name="commodity"
                      value={selectedCommodity}
                      onChange={(e) => handleCommodityChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      required
                      disabled={!selectedCategory}
                    >
                      <option value="">Select Commodity</option>
                      {costData
                        .filter(
                          (item) =>
                            item.country === selectedCountry &&
                            item.warehouse === parseInt(selectedWarehouse) &&
                            item.category === parseInt(selectedCategory)
                        )
                        .map((item) => (
                          <option
                            key={item.commodity}
                            value={item.commodity.toString()} // Ensure string comparison
                          >
                            {item.commodity_name} ({item.commodity_unit})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Quantity Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={currentOrder.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  {/* Total Cost Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Total Cost
                    </label>

                    <input
                      type="text"
                      name="cost_charged"
                      value={currentOrder.cost_charged || ""}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-blue-700 dark:text-blue-300"
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                      Phone Number (for payment)
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={currentOrder.phone_number || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      required
                    />
                  </div>

                  {/* Status Dropdown (only in edit mode) */}
                  {isEditMode && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                        Status
                      </label>
                      <select
                        name="status"
                        value={currentOrder.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
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
            <h1 className="text-3xl font-bold text-blue-800 dark:text-white mb-2">
              Order Management
            </h1>
            <p className="text-blue-600 dark:text-blue-400 max-w-2xl mx-auto">
              Manage and track warehouse commodity orders, from creation to
              fulfillment
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <SummaryCard
              icon={faBox}
              title="Total Orders"
              value={summaryMetrics.total}
              bgColor="bg-gray-700 dark:bg-gray-800"
              textColor="text-blue-600 dark:text-blue-400"
            />
            <SummaryCard
              icon={faCheckCircle}
              title="Confirmed"
              value={summaryMetrics.confirmed}
              bgColor="bg-gray-700 dark:bg-gray-800"
              textColor="text-green-600 dark:text-green-400"
            />
            <SummaryCard
              icon={faTimesCircle}
              title="Rejected"
              value={summaryMetrics.rejected}
              bgColor="bg-gray-700 dark:bg-gray-800"
              textColor="text-red-600 dark:text-red-400"
            />
            <SummaryCard
              icon={faDollarSign}
              title="Total Value"
              value={`$${summaryMetrics.totalValue}`}
              bgColor="bg-gray-700 dark:bg-gray-800"
              textColor="text-yellow-600 dark:text-yellow-400"
            />
          </div>

          {/* Main Content Area */}
          <div className="bg-gray-700 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            {/* Controls Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-blue-400"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full text-blue-700 dark:text-blue-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuVisible(!filterMenuVisible)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-blue-700 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Filters</span>
                  </button>
                  {filterMenuVisible && (
                    <div className="absolute right-0 mt-2 bg-gray-700 dark:bg-gray-700 shadow-lg rounded-lg p-4 z-10 border border-gray-200 dark:border-gray-600 w-64">
                      <h4 className="font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-600 text-blue-800 dark:text-blue-200">
                        Advanced Filters
                      </h4>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                        >
                          <option value="">All Statuses</option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                          Warehouse
                        </label>
                        <select
                          value={filters.warehouse}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              warehouse: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                        >
                          <option value="">All Warehouses</option>
                          {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                          Category
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                          Sort By
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={filters.sortField}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                sortField: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-700 dark:text-blue-300"
                          >
                            <option value="created_at">Date Created</option>
                            <option value="cost_charged">Order Value</option>
                            <option value="status">Status</option>
                          </select>
                          <button
                            onClick={() =>
                              setFilters({
                                ...filters,
                                sortDirection:
                                  filters.sortDirection === "asc"
                                    ? "desc"
                                    : "asc",
                              })
                            }
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 text-blue-700 dark:text-blue-300"
                            title={
                              filters.sortDirection === "asc"
                                ? "Ascending"
                                : "Descending"
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                filters.sortDirection === "asc"
                                  ? faSortAmountUp
                                  : faSortAmountDown
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => {
                            setFilters({
                              status: "",
                              warehouse: "",
                              category: "",
                              sortField: "created_at",
                              sortDirection: "desc",
                            });
                            setFilterMenuVisible(false);
                          }}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-blue-700 dark:text-blue-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
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
                    <div className="absolute right-0 mt-2 bg-gray-700 dark:bg-gray-700 shadow-lg rounded-lg p-2 z-10 border border-gray-200 dark:border-gray-600 w-32">
                      {Object.keys(handleDownload).map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            handleDownload[format]();
                            setDownloadMenuVisible(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-blue-700 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition text-sm"
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>New Order</span>
                </button> */}
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.status || filters.warehouse || filters.category) && (
              <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-blue-500 dark:text-blue-400 text-sm">
                  Active Filters:
                </span>
                {filters.status && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Status:{" "}
                    {
                      statusOptions.find((s) => s.value === filters.status)
                        ?.label
                    }
                    <button
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({ ...filters, status: "" })}
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.warehouse && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Warehouse:{" "}
                    {
                      warehouses.find(
                        (w) => w.id.toString() === filters.warehouse
                      )?.location
                    }
                    <button
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({ ...filters, warehouse: "" })}
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Category:{" "}
                    {
                      categories.find(
                        (c) => c.id.toString() === filters.category
                      )?.name
                    }
                    <button
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({ ...filters, category: "" })}
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  onClick={() =>
                    setFilters({
                      status: "",
                      warehouse: "",
                      category: "",
                      sortField: "created_at",
                      sortDirection: "desc",
                    })
                  }
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700 dark:border-gray-700 mb-6">
              <table
                id="order-table"
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
              >
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider rounded-tl-lg"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBox} className="mr-2" />
                        Origin
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                        Cost
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                        Warehouse
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                        Commodity
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      Paid BY
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2"
                        />
                        Created
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider rounded-tr-lg"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-700 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.length > 0 ? (
                    currentItems.map((order, index) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">
                          {order.origin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">
                          ${order.cost_charged}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            {order.warehouse_detail ? (
                              <span className="inline-flex items-center">
                                <FontAwesomeIcon
                                  icon={faWarehouse}
                                  className="mr-1 text-blue-500 dark:text-blue-400"
                                />
                                {order.warehouse_detail.location}
                              </span>
                            ) : (
                              <span className="text-blue-500 dark:text-blue-400 italic">
                                N/A
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            {order.commodity_detail ? (
                              <span>
                                {order.commodity_detail.name} (
                                {order.commodity_detail.unit_of_measurement})
                              </span>
                            ) : (
                              <span className="text-blue-500 dark:text-blue-400 italic">
                                N/A
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">
                          {order.quantity}{" "}
                          {order.commodity_detail?.unit_of_measurement || ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">
                          {order.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(order)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            {/* {order.status === "pending" && (
                              <>
                                <button
                                  onClick={() => confirmOrder(order.id)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                                  title="Confirm"
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button
                                  onClick={() => rejectOrder(order.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                  title="Reject"
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </button>
                              </>
                            )} */}
                            {/* {order.status === "confirmed" &&
                              order.availability_status === "imported" && (
                                <button
                                  onClick={() => exportOrder(order.id)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                                  title="Mark as Exported"
                                >
                                  <FontAwesomeIcon icon={faTruck} />
                                </button>
                              )} */}
                            <button
                              onClick={() => handleDelete(order.id)}
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
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-blue-500 dark:text-blue-400">
                          <FontAwesomeIcon
                            icon={faBox}
                            className="text-4xl mb-4 opacity-50"
                          />
                          <p className="text-lg font-medium mb-2">
                            No orders found
                          </p>
                          <p className="text-sm">
                            Try adjusting your search or filters, or create a
                            new order.
                          </p>
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
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Show
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 bg-gray-700 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    entries (showing{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      filteredSortedData.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredSortedData.length
                    )}{" "}
                    of {filteredSortedData.length})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-gray-700 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Previous
                  </button>

                  {Array.from(
                    {
                      length: Math.ceil(
                        filteredSortedData.length / itemsPerPage
                      ),
                    },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page ===
                          Math.ceil(filteredSortedData.length / itemsPerPage) ||
                        Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-blue-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm border rounded-lg transition ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-700 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-blue-700 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          Math.ceil(filteredSortedData.length / itemsPerPage),
                          currentPage + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredSortedData.length / itemsPerPage)
                    }
                    className="px-3 py-2 text-sm bg-gray-700 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          {/* {renderCharts()} */}

          {/* Success/Error Messages */}
          {message && (
            <div
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                messageType === "success"
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">
                  {messageType === "success" ? "✓" : "⚠"}
                </span>
                {message}
                <button
                  onClick={() => setMessage("")}
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

export default Driver_OrderManagement;
