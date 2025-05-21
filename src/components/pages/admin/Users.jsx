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
  faChartBar, faChartArea
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

function Users() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    dateFrom: '',
    dateTo: '',
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
  }, [navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this user?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await handleFetch();
      setMessage("User deleted successfully");
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
      doc.autoTable({ html: '#user-table' });
      doc.save('users.pdf');
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredSortedData), "Users");
      XLSX.writeFile(workbook, "users.xlsx");
    },
    CSV: () => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(filteredSortedData[0]).join(",") + "\n" +
        filteredSortedData.map(row => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const getRoleDisplayName = role => ({
    admin: "Admin",
    customer: "Customer",
    driver: "Driver",
    user: "User"
  }[role] || role);

  const getRoleBadgeClass = role => {
    const classes = {
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      customer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      driver: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    };
    return classes[role] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getRoleIcon = role => {
    const icons = {
      admin: faUserShield,
      customer: faUserCheck,
      driver: faUserTie,
      user: faUsers
    };
    return icons[role] || faUsers;
  };

  // Filter and sort data
  const filteredSortedData = useMemo(() => {
    return userData
      .filter(user => {
        const matchesSearch = [user.phone_number, user.role, user.email, user.created_at]
          .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesRole = !filters.role || user.role === filters.role;
        
        const createdDate = new Date(user.created_at);
        const matchesDateFrom = !filters.dateFrom || createdDate >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || createdDate <= new Date(filters.dateTo);
        
        return matchesSearch && matchesRole && matchesDateFrom && matchesDateTo;
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
  }, [userData, searchQuery, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const roleCounts = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    const newUsersLast30Days = userData.filter(user => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.created_at) >= thirtyDaysAgo;
    }).length;
    
    return {
      total: userData.length,
      admins: roleCounts.admin || 0,
      customers: roleCounts.customer || 0,
      drivers: roleCounts.driver || 0,
      newUsersLast30Days
    };
  }, [userData]);

  const renderCharts = () => {
    if (!userData.length) return null;

    const roleData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, value]) => ({ name: getRoleDisplayName(role), value }));

    const userGrowthData = Object.entries(
      userData.reduce((acc, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = acc[date] || { total: 0, admin: 0, driver: 0, customer: 0 };
        acc[date].total += 1;
        acc[date][user.role] += 1;
        return acc;
      }, {})
    ).map(([date, counts]) => ({ date, total: counts.total, admin: counts.admin || 0, driver: counts.driver || 0, customer: counts.customer || 0 }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-2 text-blue-500" />
              User Role Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="name" 
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
                    dataKey="value" 
                    name="Users"
                    radius={[4, 4, 0, 0]}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
              <FontAwesomeIcon icon={faChartArea} className="mr-2 text-blue-500" />
              User Growth Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                    dataKey="total" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    name="Total Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const currentUsers = filteredSortedData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              User Management Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive overview and management of all user accounts with detailed analytics
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <SummaryCard 
              icon={faUsers} 
              title="Total Users" 
              value={summaryMetrics.total} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-blue-600 dark:text-blue-400" 
            />
            <SummaryCard 
              icon={faUserShield} 
              title="Admins" 
              value={summaryMetrics.admins} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-green-600 dark:text-green-400" 
            />
            <SummaryCard 
              icon={faUserCheck} 
              title="Customers" 
              value={summaryMetrics.customers} 
              bgColor="bg-white dark:bg-gray-800" 
              textColor="text-yellow-600 dark:text-yellow-400" 
            />
            <SummaryCard 
              icon={faCalendarAlt} 
              title="New Users (30d)" 
              value={summaryMetrics.newUsersLast30Days} 
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
                    placeholder="Search users..."
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
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                        <select
                          value={filters.role}
                          onChange={e => setFilters({...filters, role: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                          <option value="driver">Driver</option>
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">From Date</label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">To Date</label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={e => setFilters({...filters, dateTo: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300"
                        />
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
                            <option value="email">Email</option>
                            <option value="phone_number">Phone</option>
                            <option value="role">Role</option>
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
                              role: '',
                              dateFrom: '',
                              dateTo: '',
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
                
                <Link 
                  to="/admin/createUser" 
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Add User</span>
                </Link>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.role || filters.dateFrom || filters.dateTo) && (
              <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Active Filters:</span>
                {filters.role && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    Role: {getRoleDisplayName(filters.role)}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, role: ''})}>
                      ×
                    </button>
                  </span>
                )}
                {filters.dateFrom && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, dateFrom: ''})}>
                      ×
                    </button>
                  </span>
                )}
                {filters.dateTo && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full flex items-center">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                    <button 
                      className="ml-1.5 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100"
                      onClick={() => setFilters({...filters, dateTo: ''})}>
                      ×
                    </button>
                  </span>
                )}
                <button 
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  onClick={() => setFilters({
                    role: '',
                    dateFrom: '',
                    dateTo: '',
                    sortField: 'created_at',
                    sortDirection: 'desc'
                  })}>
                  Clear All
                </button>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <table id="user-table" className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">#</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        Phone
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        Email
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                        Role
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        Created Date
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon icon={faUsers} className="text-4xl mb-3 text-gray-400 dark:text-gray-500" />
                          <p>No users found matching your criteria</p>
                          {(filters.role || filters.dateFrom || filters.dateTo || searchQuery) && (
                            <button 
                              onClick={() => {
                                setFilters({
                                  role: '',
                                  dateFrom: '',
                                  dateTo: '',
                                  sortField: 'created_at',
                                  sortDirection: 'desc'
                                });
                                setSearchQuery('');
                              }}
                              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * usersPerPage + index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{user.phone_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                            <FontAwesomeIcon icon={getRoleIcon(user.role)} className="mr-1.5" />
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <Link 
                              to={`/admin/editUser/${user.id}`} 
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(user.id)} 
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition"
                              title="Delete"
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
                <select
                  value={usersPerPage}
                  onChange={e => setUsersPerPage(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {[5, 10, 30, 50, 100].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium ${
                    currentPage === 1 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Page {currentPage} of {Math.ceil(filteredSortedData.length / usersPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * usersPerPage >= filteredSortedData.length}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium ${
                    currentPage * usersPerPage >= filteredSortedData.length
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {renderCharts()}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Users;