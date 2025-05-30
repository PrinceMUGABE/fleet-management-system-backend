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
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faComment,
  faChartPie,
  faPlus,
  faStar,
  faEye,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
        <div className="p-4 text-blue-100 bg-gray-900 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Customer_Manage_Feedbacks() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [orders, setorders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage, setFeedbacksPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentToView, setCommentToView] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const navigate = useNavigate();

  // New states for enhanced filtering and sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterConfig, setFilterConfig] = useState({
    rating: [],
    dateRange: { start: "", end: "" },
    order: "",
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const [summaryStats, setSummaryStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    highestRated: null,
    lowestRated: null,
  });

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#F9F871", "#A58FE3"];
  const BASE_URL = "http://127.0.0.1:8000/feedback/";
  const orderS_URL = "http://127.0.0.1:8000/order/user/";
  const token = localStorage.getItem("token");

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
    fetchorders();
  }, [navigate]);

  useEffect(() => {
    if (feedbackData.length > 0) {
      calculateSummaryStats();
    }
  }, [feedbackData]);

  const calculateSummaryStats = () => {
    const totalRating = feedbackData.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );
    const average = totalRating / feedbackData.length;

    // Find highest and lowest rated feedback
    let highest = feedbackData[0];
    let lowest = feedbackData[0];

    feedbackData.forEach((feedback) => {
      if (feedback.rating > highest.rating) highest = feedback;
      if (feedback.rating < lowest.rating) lowest = feedback;
    });

    setSummaryStats({
      averageRating: average.toFixed(1),
      totalFeedbacks: feedbackData.length,
      highestRated: highest,
      lowestRated: lowest,
    });
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}customer/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const fetchorders = async () => {
    try {
      const res = await axios.get(orderS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched orders:", res.data);
      setorders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this feedback?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Feedback deleted successfully");
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
      doc.autoTable({ html: "#feedback-table" });
      doc.save("feedbacks.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feedbackData),
        "Feedbacks"
      );
      XLSX.writeFile(workbook, "feedbacks.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(feedbackData[0]).join(",") +
        "\n" +
        feedbackData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "feedbacks.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const handleAddUpdateFeedback = async (e) => {
    e.preventDefault();
    try {
      const feedbackData = {
        rating: parseInt(e.target.rating.value),
        comment: e.target.comment.value,
        order: e.target.order.value,
      };

      if (currentFeedback) {
        // Update existing feedback
        await axios.put(
          `${BASE_URL}update/${currentFeedback.id}/`,
          feedbackData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Feedback updated successfully");
      } else {
        // Create new feedback
        await axios.post(`${BASE_URL}create/`, feedbackData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Feedback created successfully");
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentFeedback(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const openModal = (feedback = null) => {
    setCurrentFeedback(feedback);
    setIsModalOpen(true);
  };

  const openCommentModal = (comment) => {
    setCommentToView(comment);
    setIsCommentModalOpen(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i < rating ? "text-yellow-400" : "text-blue-500"}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Sorting functions
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-blue-500" />;
    }
    return sortConfig.direction === "ascending" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-400" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-400" />
    );
  };

  // Filtering functions
  const handleFilterChange = (field, value) => {
    setFilterConfig((prev) => {
      const newConfig = { ...prev };

      if (field === "rating") {
        // Toggle rating in the array
        if (newConfig.rating.includes(value)) {
          newConfig.rating = newConfig.rating.filter((r) => r !== value);
        } else {
          newConfig.rating = [...newConfig.rating, value];
        }
      } else if (field === "dateRange") {
        newConfig.dateRange = { ...newConfig.dateRange, ...value };
      } else {
        newConfig[field] = value;
      }

      // Calculate active filters
      let activeCount = 0;
      if (newConfig.rating.length > 0) activeCount++;
      if (newConfig.dateRange.start || newConfig.dateRange.end) activeCount++;
      if (newConfig.order) activeCount++;

      setActiveFilters(activeCount);
      return newConfig;
    });
  };

  const resetFilters = () => {
    setFilterConfig({
      rating: [],
      dateRange: { start: "", end: "" },
      order: "",
    });
    setActiveFilters(0);
  };

  // Apply filters and sorting
  const applyFiltersAndSort = (data) => {
    // First apply search filter
    let filteredData = data.filter((feedback) =>
      [
        feedback.comment,
        feedback.rating?.toString(),
        feedback.created_by?.phone_number,
        feedback.created_by?.email,
      ].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Apply specific filters
    if (filterConfig.rating.length > 0) {
      filteredData = filteredData.filter((feedback) =>
        filterConfig.rating.includes(feedback.rating)
      );
    }

    if (filterConfig.dateRange.start) {
      const startDate = new Date(filterConfig.dateRange.start);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) >= startDate
      );
    }

    if (filterConfig.dateRange.end) {
      const endDate = new Date(filterConfig.dateRange.end);
      endDate.setHours(23, 59, 59);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) <= endDate
      );
    }

    if (filterConfig.order) {
      filteredData = filteredData.filter(
        (feedback) =>
          feedback.order &&
          feedback.order.id === parseInt(filterConfig.order)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        let aValue, bValue;

        // Handle nested properties
        if (sortConfig.key === "user") {
          aValue = a.created_by ? a.created_by.phone_number : "";
          bValue = b.created_by ? b.created_by.phone_number : "";
        } else if (sortConfig.key === "order") {
          aValue = a.order ? a.order.start_point : "";
          bValue = b.order ? b.order.start_point : "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (sortConfig.direction === "ascending") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filteredData;
  };

  const filteredData = applyFiltersAndSort(feedbackData);
  const totalPages = Math.ceil(filteredData.length / feedbacksPerPage);

  const currentFeedbacks = filteredData.slice(
    (currentPage - 1) * feedbacksPerPage,
    currentPage * feedbacksPerPage
  );

  const renderCharts = () => {
    if (!feedbackData.length) return null;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      name: `${rating} Star${rating > 1 ? "s" : ""}`,
      value: feedbackData.filter((feedback) => feedback.rating === rating)
        .length,
    }));

    // Average rating by date (month)
    const ratingsByDate = feedbackData.reduce((acc, feedback) => {
      const date = new Date(feedback.created_at);
      const month = date.toLocaleString("default", { month: "short" });

      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }

      acc[month].total += feedback.rating;
      acc[month].count += 1;

      return acc;
    }, {});

    const ratingTrendData = Object.entries(ratingsByDate).map(
      ([month, data]) => ({
        name: month,
        rating: data.total / data.count,
      })
    );

    // order ratings
    const orderRatings = {};
    feedbackData.forEach((feedback) => {
      if (feedback.order) {
        const orderName = `${feedback.order.origin} to ${feedback.order.warehouse_detail?.location}`;
        if (!orderRatings[orderName]) {
          orderRatings[orderName] = { total: 0, count: 0 };
        }
        orderRatings[orderName].total += feedback.rating;
        orderRatings[orderName].count += 1;
      }
    });

    const orderData = Object.entries(orderRatings)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        rating: (data.total / data.count).toFixed(1),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 orders

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xs uppercase font-semibold text-blue-500 mb-1">
              Average Rating
            </h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">
                {summaryStats.averageRating}
              </span>
              <div className="ml-2">
                {renderStars(Math.round(summaryStats.averageRating))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-xs uppercase font-semibold text-blue-500 mb-1">
              Total Feedbacks
            </h3>
            <span className="text-2xl font-bold text-blue-400">
              {summaryStats.totalFeedbacks}
            </span>
          </div>
        </div>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              Rating Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ratingDistribution}
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
                  {ratingDistribution.map((_, index) => (
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
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Average Rating Trend
            </h3>
            <ResponsiveContainer>
              <LineChart data={ratingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  domain={[0, 5]}
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
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#FF6B6B"
                  name="Average Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faTruck} className="mr-2" />
              Top order Feedbacks 
            </h3>
            <ResponsiveContainer>
              <BarChart data={orderData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                  formatter={(value, name, props) => {
                    return [
                      `Rating: ${value} (${props.payload.count} reviews)`,
                      props.payload.fullName,
                    ];
                  }}
                />
                <Bar
                  dataKey="rating"
                  fill="#4ECDC4"
                  name="Avg Rating"
                  label={{
                    position: "right",
                    fill: "#e5e7eb",
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const renderFilterPanel = () => {
    return (
      <div
        className={`bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 mb-4 ${
          isFilterPanelOpen ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Rating filters */}
          <div>
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
              Rating
            </h4>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange("rating", rating)}
                  className={`px-3 py-1 rounded-full flex items-center ${
                    filterConfig.rating.includes(rating)
                      ? "bg-gray-600 text-white"
                      : "bg-gray-700 text-blue-300"
                  }`}
                >
                  {rating}{" "}
                  <FontAwesomeIcon
                    icon={faStar}
                    className="ml-1 text-yellow-400"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-blue-400"
              />
              Date Range
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-blue-400 block mb-1">From</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { start: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-blue-300 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-blue-400 block mb-1">To</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { end: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-blue-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* order filter */}
          <div>
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faTruck}
                className="mr-2 text-green-400"
              />
              order Route
            </h4>
            <select
              value={filterConfig.order}
              onChange={(e) => handleFilterChange("order", e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-blue-300"
            >
              <option value="">All Orders</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.commodity_detail.name} (from: {order.origin}  to {order.warehouse_detail.location}) 
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 text-blue-300 rounded hover:bg-gray-600 transition w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
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
            {currentFeedback ? "Update Feedback" : "Add New Feedback"}
          </h2>
          <form onSubmit={handleAddUpdateFeedback}>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-300 mb-2">Rating (1-5)</label>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="text-2xl text-yellow-400">
                      ✨
                    </div>
                  ))}
                </div>
                <select
                  name="rating"
                  defaultValue={currentFeedback?.rating || 5}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-blue-300"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-blue-300 mb-2">order</label>
                <select
                  name="order"
                  defaultValue={currentFeedback?.order?.id || ""}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-blue-300"
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      From: {order.origin} to {order.warehouse_detail?.location}, Commodity: {order.commodity_detail?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-blue-300 mb-2">Comment</label>
                <textarea
                  name="comment"
                  defaultValue={currentFeedback?.comment || ""}
                  required
                  rows={4}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-blue-300"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                {currentFeedback ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderCommentModal = () => {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isCommentModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            isCommentModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsCommentModalOpen(false)}
        ></div>
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-full max-w-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-blue-500 flex items-center">
            <FontAwesomeIcon icon={faComment} className="mr-2" />
            Feedback Comment
          </h2>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
            <p className="text-blue-300 whitespace-pre-wrap">{commentToView}</p>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container bg-gray-800 px-4 py-8 mx-auto">
      {message && (
        <div
          className={`p-4 mb-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-800 text-green-100"
              : "bg-gray-800 text-blue-100"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold text-blue-400">
              Manage Feedbacks
            </h1>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="flex items-center px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">
                      {activeFilters}
                    </span>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg pr-10 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute right-3 top-3 text-blue-400"
                  />
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                  className="flex items-center text-white px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
                </button>
                {downloadMenuVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                    <div className="py-1">
                      {Object.entries(handleDownload).map(
                        ([format, handler]) => (
                          <button
                            key={format}
                            onClick={() => {
                              handler();
                              setDownloadMenuVisible(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-blue-300 hover:bg-gray-700"
                          >
                            Export as {format}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => openModal()}
                className="flex items-center px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {renderFilterPanel()}

          <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table id="feedback-table" className="w-full text-left">
                <thead className="bg-gray-800 text-blue-400 text-xs uppercase">
                  <tr>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("rating")}
                    >
                      Rating {getSortIcon("rating")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("comment")}
                    >
                      Comment {getSortIcon("comment")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("user")}
                    >
                      Created By {getSortIcon("user")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("order")}
                    >
                      order {getSortIcon("order")}
                    </th>
                    <th
                      className="p-4 cursor-pointer"
                      onClick={() => requestSort("created_at")}
                    >
                      Date {getSortIcon("created_at")}
                    </th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-blue-300">
                  {currentFeedbacks.length > 0 ? (
                    currentFeedbacks.map((feedback) => (
                      <tr
                        key={feedback.id}
                        className="border-t border-gray-800 hover:bg-gray-800 transition"
                      >
                        <td className="p-4">{renderStars(feedback.rating)}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="max-w-xs truncate">
                              {feedback.comment.substring(0, 50)}
                              {feedback.comment.length > 50 ? "..." : ""}
                            </div>
                            {feedback.comment.length > 50 && (
                              <button
                                onClick={() =>
                                  openCommentModal(feedback.comment)
                                }
                                className="ml-2 text-blue-400 hover:text-blue-300"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {feedback.created_by?.phone_number || "N/A"}
                            </span>
                            <span className="text-xs text-blue-400">
                              {feedback.created_by?.email || ""}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {feedback.order ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {feedback.order.commodity_detail?.name || "N/A"}
                              </span>
                              <span className="text-xs text-blue-400">
                                From: {feedback.order.origin}
                              </span>
                              <span className="text-xs text-blue-400">
                                To: {feedback.order.warehouse_detail?.location || "N/A"}
                              </span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(feedback)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDelete(feedback.id)}
                              className="text-blue-400 hover:text-blue-300"
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
                      <td colSpan="6" className="p-4 text-center text-blue-400">
                        No feedbacks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-800 py-3 px-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
              <div className="text-blue-400 mb-2 md:mb-0">
                Showing{" "}
                <span className="font-medium text-white">
                  {filteredData.length > 0
                    ? (currentPage - 1) * feedbacksPerPage + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-white">
                  {Math.min(
                    currentPage * feedbacksPerPage,
                    filteredData.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {filteredData.length}
                </span>{" "}
                entries
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={feedbacksPerPage}
                  onChange={(e) => {
                    setFeedbacksPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-700 border border-gray-600 text-blue-300 px-3 py-1 rounded mr-2"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <nav>
                  <ul className="flex space-x-1">
                    <li>
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-gray-700 text-blue-500 cursor-not-allowed"
                            : "bg-gray-700 text-blue-300 hover:bg-gray-600"
                        }`}
                      >
                        Prev
                      </button>
                    </li>

                    {[...Array(Math.min(5, totalPages)).keys()].map(
                      (_, index) => {
                        // Show 5 pages max, centered around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else {
                          const startPage = Math.max(1, currentPage - 2);
                          pageNum = startPage + index;
                          if (pageNum > totalPages) return null;
                        }

                        return (
                          <li key={pageNum}>
                            <button
                              onClick={() => paginate(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 text-blue-300 hover:bg-gray-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      }
                    )}

                    <li>
                      <button
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                          currentPage === totalPages
                            ? "bg-gray-700 text-blue-500 cursor-not-allowed"
                            : "bg-gray-700 text-blue-300 hover:bg-gray-600"
                        }`}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {renderCharts()}
      </div>

      {/* Modals */}
      {renderModal()}
      {renderCommentModal()}
    </div>
  );
}


export default Customer_Manage_Feedbacks;
