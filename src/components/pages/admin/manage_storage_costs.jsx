/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faChartPie,
  faPlus,
  faFilter,
  faCalendarAlt,
  faDollarSign,
  faWarehouse,
  faBoxes,
  faTag,
  faChevronDown,
  faChevronRight,
  faGlobe,
  faLayerGroup,
  faBoxOpen,
  faFileImport,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { TreeView, TreeItem } from "@mui/lab";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Modal,
  Button,
  Dropdown,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const StorageCostManager = () => {
  const [costData, setCostData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    country: "",
    warehouse: "",
    category: "",
    commodity: "",
  });
  const [expandedNodes, setExpandedNodes] = useState(["global"]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [currentCost, setCurrentCost] = useState({
    country: "",
    price_per_unit: "",
    currency: "USD",
    warehouse: "",
    category: "",
    commodity: "",
    level: "global",
  });
  const [bulkCreateData, setBulkCreateData] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [categoryCommodities, setCategoryCommodities] = useState([]);
  const [warehouseCategories, setWarehouseCategories] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [priceRange, setPriceRange] = useState({
    min: "",
    max: "",
  });
  const [reportType, setReportType] = useState("summary");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [costsRes, warehousesRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/storage/costs/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/warehouse/warehouses/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCostData(costsRes.data);
        setWarehouses(warehousesRes.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Create separate functions for fetching categories and commodities
  const fetchCategories = async (warehouseId = null) => {
    try {
      let response;
      if (warehouseId) {
        response = await axios.get(
          `http://127.0.0.1:8000/warehouse/warehouses/${warehouseId}/categories/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Warehouse categories response:", response.data);
        const categoriesData = response.data?.categories || [];
        setWarehouseCategories(categoriesData);
      } else {
        response = await axios.get(
          "http://127.0.0.1:8000/warehouse/categories/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("All categories response:", response.data);
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : response.data?.categories || [];
        setWarehouseCategories(categoriesData);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setWarehouseCategories([]);
    }
  };

  const fetchCommodities = async (categoryId = null) => {
    try {
      let response;
      if (categoryId) {
        response = await axios.get(
          `http://127.0.0.1:8000/warehouse/categories/${categoryId}/commodities/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Category commodities response:", response.data);
        const commoditiesData =
          response.data?.commodities || response.data || [];
        setCategoryCommodities(commoditiesData);
      } else {
        response = await axios.get(
          "http://127.0.0.1:8000/warehouse/commodities/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("All commodities response:", response.data);
        const commoditiesData = Array.isArray(response.data)
          ? response.data
          : response.data?.commodities || [];
        setCategoryCommodities(commoditiesData);
      }
    } catch (err) {
      console.error("Error fetching commodities:", err);
      setCategoryCommodities([]);
    }
  };

  // Modified useEffect for fetching categories
  useEffect(() => {
    if (currentCost.warehouse) {
      fetchCategories(currentCost.warehouse);
    } else {
      fetchCategories(); // Fetch all categories if no warehouse selected
    }
  }, [currentCost.warehouse, token]);

  // Modified useEffect for fetching commodities
  useEffect(() => {
    if (currentCost.category) {
      fetchCommodities(currentCost.category);
    } else {
      fetchCommodities(); // Fetch all commodities if no category selected
    }
  }, [currentCost.category, token]);

  // Add this filter function
  const filteredCosts = useMemo(() => {
    return costData.filter((cost) => {
      // Country filter
      if (
        activeFilters.country &&
        !cost.country
          .toLowerCase()
          .includes(activeFilters.country.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const costDate = new Date(cost.created_at);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && costDate < startDate) return false;
        if (endDate && costDate > endDate) return false;
      }

      // Price range filter
      if (priceRange.min && cost.price_per_unit < parseFloat(priceRange.min))
        return false;
      if (priceRange.max && cost.price_per_unit > parseFloat(priceRange.max))
        return false;

      return true;
    });
  }, [costData, activeFilters, dateRange, priceRange]);

  // Add this reporting function
  const renderReport = () => {
    switch (reportType) {
      case "summary":
        return (
          <div className="card bg-gray-800 text-white mb-4">
            <div className="card-header bg-gray-700">
              <h5>Summary Report</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="card bg-gray-700 mb-3">
                    <div className="card-body">
                      <h6>Total Costs</h6>
                      <h3>{filteredCosts.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-gray-700 mb-3">
                    <div className="card-body">
                      <h6>Average Price</h6>
                      <h3>
                        {filteredCosts.length > 0
                          ? (
                              filteredCosts.reduce(
                                (sum, cost) =>
                                  sum + parseFloat(cost.price_per_unit),
                                0
                              ) / filteredCosts.length
                            ).toFixed(2)
                          : 0}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-gray-700 mb-3">
                    <div className="card-body">
                      <h6>Countries</h6>
                      <h3>
                        {new Set(filteredCosts.map((c) => c.country)).size}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "detailed":
        return (
          <div className="card bg-gray-800 text-white mb-4">
            <div className="card-header bg-gray-700">
              <h5>Detailed Report</h5>
            </div>
            <div className="card-body">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Avg Price</th>
                    <th>Min Price</th>
                    <th>Max Price</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    filteredCosts.reduce((acc, cost) => {
                      if (!acc[cost.country]) {
                        acc[cost.country] = [];
                      }
                      acc[cost.country].push(cost.price_per_unit);
                      return acc;
                    }, {})
                  ).map(([country, prices]) => (
                    <tr key={country}>
                      <td>{country}</td>
                      <td>
                        {(
                          prices.reduce((a, b) => a + parseFloat(b), 0) /
                          prices.length
                        ).toFixed(2)}
                      </td>
                      <td>{Math.min(...prices)}</td>
                      <td>{Math.max(...prices)}</td>
                      <td>{prices.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  const handleSelect = (event, nodeId) => {
    setSelectedNode(nodeId);
  };

  const openCreateModal = (level, parentData = null) => {
    let initialData = {
      country: "",
      price_per_unit: "",
      currency: "USD",
      warehouse: "",
      category: "",
      commodity: "",
      level: level || "global",
    };

    if (level === "warehouse" && parentData) {
      initialData.country = parentData.country || "";
    } else if (level === "category" && parentData) {
      initialData.country = parentData.country || "";
      initialData.warehouse = parentData.warehouseId || "";
    } else if (level === "commodity" && parentData) {
      initialData.country = parentData.country || "";
      initialData.warehouse = parentData.warehouseId || "";
      initialData.category = parentData.categoryId || "";
    }

    setCurrentCost(initialData);
    
    // Reset categories and commodities for new cost
    setWarehouseCategories([]);
    setCategoryCommodities([]);
    
    // Fetch initial data for dropdowns
    fetchCategories(); // Fetch all categories initially
    fetchCommodities(); // Fetch all commodities initially
    
    setShowCostModal(true);
  };

  const handleEdit = async (cost) => {
    // Set the cost data first
    setCurrentCost({
      ...cost,
      country: cost.country,
      price_per_unit: cost.price_per_unit,
      currency: cost.currency,
      warehouse: cost.warehouse?.id || "",
      category: cost.category?.id || "",
      commodity: cost.commodity?.id || "",
      warehouse_name: cost.warehouse?.location || "",
      category_name: cost.category?.name || "",
      commodity_name: cost.commodity?.name || "",
    });

    // Fetch the necessary data for dropdowns based on the current cost's relationships
    try {
      // Always fetch all categories first (or warehouse-specific if warehouse exists)
      if (cost.warehouse?.id) {
        await fetchCategories(cost.warehouse.id);
      } else {
        await fetchCategories();
      }

      // If there's a category, fetch its commodities
      if (cost.category?.id) {
        await fetchCommodities(cost.category.id);
      } else {
        await fetchCommodities();
      }
    } catch (error) {
      console.error("Error fetching dropdown data for edit:", error);
    }

    setShowCostModal(true);
  };

  const handleCostSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentCost.id
        ? `http://127.0.0.1:8000/storage/update/${currentCost.id}/`
        : "http://127.0.0.1:8000/storage/create/";

      const method = currentCost.id ? "put" : "post";

      // Prepare payload - only include values that were explicitly set
      const payload = {
        country: currentCost.country,
        price_per_unit: currentCost.price_per_unit,
        currency: currentCost.currency,
      };

      // Only include warehouse if it was selected/changed
      if (currentCost.warehouse) {
        payload.warehouse = currentCost.warehouse;
      }

      // Same for category and commodity
      if (currentCost.category) {
        payload.category = currentCost.category;
      }

      if (currentCost.commodity) {
        payload.commodity = currentCost.commodity;
      }

      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({
        text: `Cost ${currentCost.id ? "updated" : "created"} successfully`,
        variant: "success",
      });
      setShowCostModal(false);

      // Refresh data
      const res = await axios.get("http://127.0.0.1:8000/storage/costs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCostData(res.data);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "An error occurred",
        variant: "danger",
      });
    }
  };

  const handleBulkCreate = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/storage/storage-costs/bulk-create/",
        {
          cost_items: bulkCreateData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        text: "Bulk costs created successfully",
        variant: "success",
      });
      setShowBulkModal(false);

      const res = await axios.get("http://127.0.0.1:8000/storage/costs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCostData(res.data);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "An error occurred",
        variant: "danger",
      });
    }
  };

  const handleDeleteCost = async (costId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/storage/delete/${costId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ text: "Cost deleted successfully", variant: "success" });

      const res = await axios.get("http://127.0.0.1:8000/storage/costs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCostData(res.data);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "An error occurred",
        variant: "danger",
      });
    }
  };

  const renderTreeNodes = (nodes) => {
    return Object.entries(nodes).map(([key, node]) => {
      const nodeId = key;
      const isExpanded = expandedNodes.includes(nodeId);

      let icon;
      if (key === "global") {
        icon = <FontAwesomeIcon icon={faGlobe} className="mr-2" />;
      } else if (key.startsWith("warehouse-")) {
        icon = <FontAwesomeIcon icon={faWarehouse} className="mr-2" />;
      } else if (key.startsWith("category-")) {
        icon = <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />;
      } else if (key.startsWith("commodity-")) {
        icon = <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />;
      } else {
        icon = <FontAwesomeIcon icon={faGlobe} className="mr-2" />;
      }

      return (
        <TreeItem
          key={nodeId}
          nodeId={nodeId}
          label={
            <div className="d-flex align-items-center justify-content-between">
              <div>
                {icon}
                {node.name}
                {node.costs.length > 0 && (
                  <Badge pill bg="secondary" className="ms-2">
                    {node.costs.length}
                  </Badge>
                )}
              </div>
              {!key.startsWith("commodity-") && (
                <Button
                  size="sm"
                  variant="outline-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    const level = key.startsWith("warehouse-")
                      ? "warehouse"
                      : key.startsWith("category-")
                      ? "category"
                      : key === "global"
                      ? "global"
                      : "country";
                    openCreateModal(level, node);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Cost
                </Button>
              )}
            </div>
          }
        >
          {node.costs.length > 0 && (
            <TreeItem
              nodeId={`${nodeId}-costs`}
              label={
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                  Costs
                  <Badge pill bg="primary" className="ms-2">
                    {node.costs.length}
                  </Badge>
                </div>
              }
            >
              {node.costs.map((cost) => (
                <TreeItem
                  key={`cost-${cost.id}`}
                  nodeId={`cost-${cost.id}`}
                  label={
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(cost);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this cost?"
                              )
                            ) {
                              handleDeleteCost(cost.id);
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </div>
                  }
                />
              ))}
            </TreeItem>
          )}
          {Object.keys(node.children).length > 0 &&
            renderTreeNodes(node.children)}
        </TreeItem>
      );
    });
  };

  const renderCostStatistics = () => {
    const stats = {
      global: 0,
      warehouse: 0,
      category: 0,
      commodity: 0,
    };

    const data = [
      { name: "Global", value: stats.global },
      { name: "Warehouse", value: stats.warehouse },
      { name: "Category", value: stats.category },
      { name: "Commodity", value: stats.commodity },
    ];
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-gray-900"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4 bg-gray-800 text-white">
        Error loading storage costs: {error}
      </Alert>
    );
  }

return (
  <div className="container-fluid py-4 bg-gray-900 text-white min-h-screen">
    <style>{`
      .MuiTreeView-root {
        background-color: #1f2937 !important;
        color: white !important;
        padding: 8px;
        border-radius: 4px;
      }
      .MuiTreeItem-root {
        color: white !important;
      }
      .MuiTreeItem-content {
        padding: 4px 0 !important;
      }
      .MuiTreeItem-content:hover {
        background-color: #374151 !important;
      }
      .MuiTreeItem-content.Mui-selected {
        background-color: #4b5563 !important;
      }
      .MuiTreeItem-iconContainer svg {
        color: white !important;
      }
      .table-responsive {
        border-radius: 8px;
        overflow: hidden;
      }
      .card {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border: 1px solid #374151;
      }
    `}</style>

    {/* Alert Message */}
    {message.text && (
      <Alert
        variant={message.variant}
        onClose={() => setMessage({ text: "", variant: "" })}
        dismissible
        className="mb-4 bg-gray-800 text-white border-gray-600"
      >
        {message.text}
      </Alert>
    )}

    {/* Main Content */}
    <div className="row">
      <div className="col-12">
        <div className="card mb-4 bg-gray-800 text-white border-gray-700">
          {/* Header */}
          <div className="card-header bg-gray-700 border-gray-600">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faDollarSign} className="me-3 text-green-400" />
                Storage Cost Management
              </h4>
              <Button
                variant="success"
                onClick={() => openCreateModal("global")}
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add New Cost
              </Button>
            </div>
          </div>

          <div className="card-body bg-gray-800">
            {/* Filter Section */}
            <div className="mb-4">
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Country</label>
                  <input
                    type="text"
                    className="form-control bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                    placeholder="Filter by country"
                    value={activeFilters.country}
                    onChange={(e) =>
                      setActiveFilters({
                        ...activeFilters,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6"></div>
                <div className="col-md-2 d-flex align-items-end">
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() =>
                      setActiveFilters({
                        country: "",
                        warehouse: "",
                        category: "",
                        commodity: "",
                      })
                    }
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline-light"
                onClick={() => setShowFilters(!showFilters)}
                className="mb-3 d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                {showFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </Button>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="card bg-gray-750 border-gray-600 mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Date Range</label>
                        <div className="d-flex gap-2">
                          <input
                            type="date"
                            className="form-control bg-gray-700 text-white border-gray-600"
                            value={dateRange.start}
                            onChange={(e) =>
                              setDateRange({
                                ...dateRange,
                                start: e.target.value,
                              })
                            }
                          />
                          <span className="align-self-center text-gray-400">to</span>
                          <input
                            type="date"
                            className="form-control bg-gray-700 text-white border-gray-600"
                            value={dateRange.end}
                            onChange={(e) =>
                              setDateRange({
                                ...dateRange,
                                end: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Price Range</label>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            className="form-control bg-gray-700 text-white border-gray-600"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                min: e.target.value,
                              })
                            }
                          />
                          <span className="align-self-center text-gray-400">to</span>
                          <input
                            type="number"
                            className="form-control bg-gray-700 text-white border-gray-600"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          onClick={() => {
                            setDateRange({ start: "", end: "" });
                            setPriceRange({ min: "", max: "" });
                          }}
                        >
                          Clear Advanced Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="row">
              {/* Left Column - Statistics and Reports */}
              <div className="col-lg-4 mb-4">
                {/* Statistics Card */}
                <div className="mb-4">
                  {renderCostStatistics()}
                </div>

                {/* Reports Card */}
                <div className="card bg-gray-800 border-gray-700">
                  <div className="card-header bg-gray-700 border-gray-600">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Reports</h5>
                      <div className="btn-group" role="group">
                        <Button
                          variant={reportType === "summary" ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => setReportType("summary")}
                        >
                          Summary
                        </Button>
                        <Button
                          variant={reportType === "detailed" ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => setReportType("detailed")}
                        >
                          Detailed
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {renderReport()}
                  </div>
                </div>
              </div>

              {/* Right Column - Data Table */}
              <div className="col-lg-8">
                <div className="card bg-gray-800 border-gray-700">
                  <div className="card-header bg-gray-700 border-gray-600">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Storage Costs</h5>
                      <Button variant="outline-light" size="sm">
                        <FontAwesomeIcon icon={faFileExport} className="me-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    {costData.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <FontAwesomeIcon icon={faDollarSign} size="3x" className="text-gray-600" />
                        </div>
                        <h6 className="text-gray-400 mb-3">No costs match your filters</h6>
                        <Button
                          variant="primary"
                          onClick={() =>
                            setActiveFilters({
                              country: "",
                              warehouse: "",
                              category: "",
                              commodity: "",
                            })
                          }
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                        <table className="table table-dark table-hover mb-0">
                          <thead className="bg-gray-700 sticky-top">
                            <tr>
                              <th className="fw-semibold">Country</th>
                              <th className="fw-semibold">Price</th>
                              <th className="fw-semibold">Warehouse</th>
                              <th className="fw-semibold">Category</th>
                              <th className="fw-semibold">Commodity</th>
                              <th className="fw-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCosts.map((cost) => (
                              <tr key={cost.id} className="border-gray-700">
                                <td className="fw-semibold">{cost.country}</td>
                                <td>
                                  <Badge bg="success" className="px-3 py-2">
                                    {cost.currency} {cost.price_per_unit}
                                  </Badge>
                                </td>
                                <td className="text-gray-300">{cost.warehouse_name || "-"}</td>
                                <td className="text-gray-300">{cost.category_name || "-"}</td>
                                <td className="text-gray-300">{cost.commodity_name || "-"}</td>
                                <td className="text-center">
                                  <div className="btn-group" role="group">
                                    <Button
                                      variant="outline-light"
                                      size="sm"
                                      onClick={() => handleEdit(cost)}
                                      className="me-1"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            "Are you sure you want to delete this cost?"
                                          )
                                        ) {
                                          handleDeleteCost(cost.id);
                                        }
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Cost Modal */}
    <Modal
      show={showCostModal}
      onHide={() => setShowCostModal(false)}
      size="lg"
      contentClassName="bg-gray-800 text-white border-gray-700"
    >
      <Modal.Header closeButton className="bg-gray-700 text-white border-gray-600">
        <Modal.Title>
          {currentCost?.id ? "Edit Storage Cost" : "Create New Storage Cost"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-gray-800">
        {currentCost && currentCost.country !== undefined && (
          <form onSubmit={handleCostSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Country</label>
                <input
                  type="text"
                  className="form-control bg-gray-700 text-white border-gray-600"
                  name="country"
                  value={currentCost.country}
                  onChange={(e) =>
                    setCurrentCost({
                      ...currentCost,
                      country: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Price Per Unit</label>
                <input
                  type="number"
                  className="form-control bg-gray-700 text-white border-gray-600"
                  name="price_per_unit"
                  value={currentCost.price_per_unit}
                  onChange={(e) =>
                    setCurrentCost({
                      ...currentCost,
                      price_per_unit: e.target.value,
                    })
                  }
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Currency</label>
                <select
                  className="form-select bg-gray-700 text-white border-gray-600"
                  name="currency"
                  value={currentCost.currency}
                  onChange={(e) =>
                    setCurrentCost({
                      ...currentCost,
                      currency: e.target.value,
                    })
                  }
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RWF">RWF</option>
                </select>
              </div>
            </div>

            <div className="row mb-4">
              {/* Warehouse Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Warehouse</label>
                <select
                  className="form-select bg-gray-700 text-white border-gray-600"
                  name="warehouse"
                  value={currentCost.warehouse}
                  onChange={(e) => {
                    const warehouseId = e.target.value;
                    setCurrentCost({
                      ...currentCost,
                      warehouse: warehouseId,
                      category: "", // Reset category only if warehouse changes
                      commodity: "", // Reset commodity if warehouse changes
                    });

                    // Fetch categories for the selected warehouse
                    if (warehouseId) {
                      fetchCategories(warehouseId);
                    }
                  }}
                >
                  <option value="">Select Warehouse (Optional)</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.location}
                    </option>
                  ))}
                </select>
                {/* Show current warehouse name if exists */}
                {currentCost.warehouse_name && !currentCost.warehouse && (
                  <small className="text-warning mt-1 d-block">
                    Current: {currentCost.warehouse_name} (select to change)
                  </small>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select bg-gray-700 text-white border-gray-600"
                  name="category"
                  value={currentCost.category}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    setCurrentCost({
                      ...currentCost,
                      category: categoryId,
                      commodity: "", // Reset commodity only if category changes
                    });

                    // Fetch commodities for the selected category
                    if (categoryId) {
                      fetchCommodities(categoryId);
                    }
                  }}
                >
                  <option value="">Select Category (Optional)</option>
                  {Array.isArray(warehouseCategories) &&
                    warehouseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                {/* Show current category name if exists */}
                {currentCost.category_name && !currentCost.category && (
                  <small className="text-warning mt-1 d-block">
                    Current: {currentCost.category_name} (select to change)
                  </small>
                )}
              </div>

              {/* Commodity Dropdown */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Commodity</label>
                <select
                  className="form-select bg-gray-700 text-white border-gray-600"
                  name="commodity"
                  value={currentCost.commodity}
                  onChange={(e) =>
                    setCurrentCost({
                      ...currentCost,
                      commodity: e.target.value,
                    })
                  }
                >
                  <option value="">Select Commodity (Optional)</option>
                  {Array.isArray(categoryCommodities) &&
                    categoryCommodities.map((commodity) => (
                      <option key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </option>
                    ))}
                </select>
                {/* Show current commodity name if exists */}
                {currentCost.commodity_name && !currentCost.commodity && (
                  <small className="text-warning mt-1 d-block">
                    Current: {currentCost.commodity_name} (select to change)
                  </small>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowCostModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentCost.id ? "Update" : "Create"} Cost
              </Button>
            </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  </div>
);
};

export default StorageCostManager;
