/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import {
  faChartLine,
  faDownload,
  faSearch,
  faCalendarAlt,
  faTruck,
  faExchangeAlt,
  faProjectDiagram,
  faSyncAlt,
  faInfoCircle,
  faMapMarkedAlt,
  faChartPie,
  faArrowUp,
  faArrowDown,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  ComposedChart,
  Brush,
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
        <div className="p-4 text-red-100 bg-red-900 rounded-lg">
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

function Dispatcher_DemandForecast() {
  const [forecastData, setForecastData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState("forecast"); // forecast, historical, regional
  const [regionalData, setRegionalData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [timeframe, setTimeframe] = useState("monthly");
  const navigate = useNavigate();

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#F9F871",
    "#6A0572",
    "#AB83A1",
    "#3A86FF",
    "#8338EC",
  ];
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
    fetchForecastData();
    fetchRegionalData();
  }, [navigate]);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      // Fetch forecast data
      const res = await axios.get("http://127.0.0.1:8000/demand/forecasts/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.past_data) {
        // Transform historical data
        const histData = res.data.past_data
          .map((item) => {
            const date = new Date(item.move_datetime);
            return {
              date: date.toLocaleDateString(),
              timestamp: date.getTime(),
              count: item.count,
              month: date.toLocaleString("default", { month: "short" }),
              week: Math.ceil(date.getDate() / 7),
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        setHistoricalData(histData);

        // Process data for comparison chart
        processComparisonData(histData, res.data.predicted_demand);
      }

      // Format forecast data for display
      const forecasts = await axios.get(
        "http://127.0.0.1:8000/demand/forecasts/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched forecast: ", forecasts.data);

      const formattedForecasts = forecasts.data.predicted_demand ? [{
        id: Date.now(),
        predicted_demand: forecasts.data.predicted_demand,
        forecast_date: new Date().toISOString().split("T")[0],
        created_at: new Date().toLocaleString(),
        accuracy: calculateAccuracy(forecasts.data.predicted_demand, historicalData)
      }] : [];

      setForecastData(formattedForecasts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forecast data:", err);
      setMessage("Failed to fetch forecast data. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  };

  const fetchRegionalData = async () => {
    try {
      // Make the actual API call to the backend
      const response = await fetch("http://127.0.0.1:8000/relocation/all/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store token in localStorage
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }



      // Parse the response data
      const relocations = await response.json();

      // Process the data to count relocations by region
      // We'll use origin_district as the region
      const regionCounts = {};
      let totalRelocations = 0;

      relocations.forEach((relocation) => {
        const region = relocation.origin_district || "Unknown";

        if (!regionCounts[region]) {
          regionCounts[region] = 0;
        }

        regionCounts[region]++;
        totalRelocations++;
      });

      // Convert the counts to the format expected by your component
      const formattedRegionalData = Object.keys(regionCounts).map((region) => {
        const count = regionCounts[region];
        const percentage = Math.round((count / totalRelocations) * 100);

        return {
          region: region,
          count: count,
          percentage: percentage,
        };
      });

      // Sort by count in descending order
      formattedRegionalData.sort((a, b) => b.count - a.count);

      // Update state with the formatted data
      setRegionalData(formattedRegionalData);
    } catch (error) {
      console.error("Error fetching regional data:", error);
      // You might want to handle the error appropriately here
      // For example, set an error state or display a notification
    }
  };

  const processComparisonData = (histData, predictedDemand) => {
    // Get last 12 months of data
    const lastYearData = [...histData]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 12);

    // Get monthly totals
    const monthlyTotals = lastYearData.reduce((acc, item) => {
      if (!acc[item.month]) {
        acc[item.month] = { actual: 0, forecast: 0 };
      }
      acc[item.month].actual += item.count;
      return acc;
    }, {});

    // Add forecast data for next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleString("default", {
      month: "short",
    });
    monthlyTotals[nextMonthName] = { actual: 0, forecast: predictedDemand };

    // Convert to array for chart
    const comparisonArray = Object.keys(monthlyTotals).map((month) => ({
      month,
      actual: monthlyTotals[month].actual,
      forecast: monthlyTotals[month].forecast,
    }));

    setComparisonData(comparisonArray);
  };

  const calculateAccuracy = (predictedDemand, actualData) => {
    if (!actualData.length) return null;

    // Sum the actual data for the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth(),
      1
    );
    const lastMonthEnd = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0
    );

    const lastMonthData = actualData.filter((item) => {
      const date = new Date(item.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    if (!lastMonthData.length) return null;

    const totalActual = lastMonthData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const accuracy =
      100 - Math.abs(((totalActual - predictedDemand) / totalActual) * 100);

    return Math.round(accuracy * 10) / 10; // Round to 1 decimal place
  };

  const generateNewForecast = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/demand/forecasts/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.past_data) {
        const histData = res.data.past_data
          .map((item) => {
            const date = new Date(item.move_datetime);
            return {
              date: date.toLocaleDateString(),
              timestamp: date.getTime(),
              count: item.count,
              month: date.toLocaleString("default", { month: "short" }),
              week: Math.ceil(date.getDate() / 7),
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);

        setHistoricalData(histData);

        // Process data for comparison chart
        processComparisonData(histData, res.data.predicted_demand);
      }

      // Add the new forecast to the existing forecasts
      const newForecast = {
        id: Date.now(), // Temporary ID until we refetch
        predicted_demand: res.data.predicted_demand,
        forecast_date: new Date().toISOString().split("T")[0],
        created_by: { phone_number: "You" }, // Placeholder
        created_at: new Date().toLocaleString(),
        accuracy: null, // New forecasts don't have accuracy yet
      };

      setForecastData((prevForecasts) => [newForecast, ...prevForecasts]);

      setMessage("New demand forecast generated successfully!");
      setMessageType("success");
      setIsGenerating(false);

      // Refresh the full data
      fetchForecastData();
    } catch (err) {
      console.error("Error generating forecast:", err);
      setMessage("Failed to generate new forecast. Please try again.");
      setMessageType("error");
      setIsGenerating(false);
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.text("Demand Forecast Report", 14, 16);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      doc.text(`Total Forecasts: ${forecastData.length}`, 14, 28);

      if (forecastData.length > 0) {
        const tableData = forecastData.map((item) => [
          new Date(item.forecast_date).toLocaleDateString(),
          item.predicted_demand,
          item.created_by?.phone_number || "System",
          item.accuracy ? `${item.accuracy}%` : "N/A",
        ]);

        doc.autoTable({
          head: [
            ["Forecast Date", "Predicted Demand", "Created By", "Accuracy"],
          ],
          body: tableData,
          startY: 35,
        });
      }

      doc.save("demand_forecast.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      const wsData = forecastData.map((item) => ({
        "Forecast Date": new Date(item.forecast_date).toLocaleDateString(),
        "Predicted Demand": item.predicted_demand,
        "Created By": item.created_by?.phone_number || "System",
        Accuracy: item.accuracy ? `${item.accuracy}%` : "N/A",
        "Creation Time": item.created_at || "N/A",
      }));

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(wsData),
        "Demand Forecast"
      );
      XLSX.writeFile(workbook, "demand_forecast.xlsx");
    },
    CSV: () => {
      const csvData = forecastData.map((item) => ({
        date: new Date(item.forecast_date).toLocaleDateString(),
        demand: item.predicted_demand,
        creator: item.created_by?.phone_number || "System",
        accuracy: item.accuracy ? `${item.accuracy}%` : "N/A",
        created_at: item.created_at || "N/A",
      }));

      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Forecast Date,Predicted Demand,Created By,Accuracy,Creation Time\n" +
        csvData
          .map(
            (row) =>
              `${row.date},${row.demand},${row.creator},${row.accuracy},${row.created_at}`
          )
          .join("\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "demand_forecast.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const renderMetricsCards = () => {
    // Calculate key metrics
    const latestPrediction =
      forecastData.length > 0 ? forecastData[0].predicted_demand : 0;
    const totalHistorical = historicalData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthDataPoints = historicalData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === lastMonthDate.getMonth() &&
        itemDate.getFullYear() === lastMonthDate.getFullYear()
      );
    });

    const lastMonthTotal = lastMonthDataPoints.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const twoMonthsAgoDate = new Date();
    twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
    const twoMonthsAgoDataPoints = historicalData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === twoMonthsAgoDate.getMonth() &&
        itemDate.getFullYear() === twoMonthsAgoDate.getFullYear()
      );
    });

    const twoMonthsAgoTotal = twoMonthsAgoDataPoints.reduce(
      (sum, item) => sum + item.count,
      0
    );

    // Calculate growth rate
    const growthRate =
      twoMonthsAgoTotal > 0
        ? (
          ((lastMonthTotal - twoMonthsAgoTotal) / twoMonthsAgoTotal) *
          100
        ).toFixed(1)
        : 0;

    // Average accuracy of forecasts
    const accuracyValues = forecastData
      .filter((item) => item.accuracy !== null)
      .map((item) => item.accuracy);

    const avgAccuracy =
      accuracyValues.length > 0
        ? (
          accuracyValues.reduce((sum, val) => sum + val, 0) /
          accuracyValues.length
        ).toFixed(1)
        : "N/A";

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 text-center">
          <div className="flex items-center justify-center text-red-400 mb-2 text-3xl">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <p className="text-gray-400 text-sm mb-1">Predicted Demand</p>
          <h3 className="text-white text-2xl font-bold">{latestPrediction}</h3>
          <p className="text-gray-400 text-xs mt-1">Relocations next month</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 text-center">
          <div className="flex items-center justify-center text-blue-400 mb-2 text-3xl">
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <p className="text-gray-400 text-sm mb-1">Last Month</p>
          <h3 className="text-white text-2xl font-bold flex items-center justify-center">
            {lastMonthTotal}
            {growthRate > 0 ? (
              <span className="ml-2 text-green-400 text-sm flex items-center">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                {growthRate}%
              </span>
            ) : growthRate < 0 ? (
              <span className="ml-2 text-red-400 text-sm flex items-center">
                <FontAwesomeIcon icon={faArrowDown} className="mr-1" />
                {Math.abs(growthRate)}%
              </span>
            ) : null}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            Compared to previous month
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 text-center">
          <div className="flex items-center justify-center text-green-400 mb-2 text-3xl">
            <FontAwesomeIcon icon={faProjectDiagram} />
          </div>
          <p className="text-gray-400 text-sm mb-1">Forecast Accuracy</p>
          <h3 className="text-white text-2xl font-bold">
            {avgAccuracy !== "N/A" ? avgAccuracy + "%" : "N/A"}
          </h3>
          <p className="text-gray-400 text-xs mt-1">Average of all forecasts</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 text-center">
          <div className="flex items-center justify-center text-yellow-400 mb-2 text-3xl">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Relocations</p>
          <h3 className="text-white text-2xl font-bold">{totalHistorical}</h3>
          <p className="text-gray-400 text-xs mt-1">All-time completed moves</p>
        </div>
      </div>
    );
  };

  const renderTabs = () => {
    return (
      <div className="flex space-x-1 mb-6 bg-gray-900 p-1 rounded-lg border border-gray-700">
        <button
          onClick={() => setCurrentView("forecast")}
          className={`flex-1 py-2 px-4 rounded-md text-center transition ${currentView === "forecast"
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Forecast Analysis
        </button>
        <button
          onClick={() => setCurrentView("historical")}
          className={`flex-1 py-2 px-4 rounded-md text-center transition ${currentView === "historical"
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
        >
          <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
          Historical Trends
        </button>
        <button
          onClick={() => setCurrentView("regional")}
          className={`flex-1 py-2 px-4 rounded-md text-center transition ${currentView === "regional"
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
        >
          <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
          Regional Analysis
        </button>
      </div>
    );
  };

  const renderForecastView = () => {
    if (loading) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      );
    }

    if (!historicalData.length && !forecastData.length) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FontAwesomeIcon icon={faInfoCircle} className="text-3xl mb-3" />
              <p>
                No forecast data available yet. Generate your first forecast.
              </p>
              <button
                onClick={generateNewForecast}
                disabled={isGenerating}
                className="mt-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Generate Forecast
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Combine historical and forecast data for trend analysis
    const combinedData = [];

    // Add historical data
    historicalData.forEach((item) => {
      combinedData.push({
        date: item.date,
        actual: item.count,
        forecast: null,
      });
    });

    // Add the latest forecast as a projection
    if (forecastData.length > 0) {
      const latestForecast = forecastData[0];
      const forecastDate = new Date(latestForecast.forecast_date);

      // Add 4 weeks projection
      for (let i = 1; i <= 4; i++) {
        const projDate = new Date(forecastDate);
        projDate.setDate(projDate.getDate() + i * 7);

        combinedData.push({
          date: projDate.toLocaleDateString(),
          actual: null,
          forecast: latestForecast.predicted_demand / 4, // Divide by 4 to show weekly distribution
        });
      }
    }

    // Sort by date
    combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Demand Trend & Forecast
            </h3>
            <ResponsiveContainer>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  padding={{ left: 20, right: 20 }}
                  tick={{ fontSize: 10, fill: "#e5e7eb" }}
                  interval="preserveEnd"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  padding={{ top: 20, bottom: 20 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                  formatter={(value) => (value ? [value, ""] : ["N/A", ""])}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#e5e7eb" }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actual Demand"
                  stroke="#FF6B6B"
                  fill="#FF6B6B"
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
                <Brush dataKey="date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Forecast vs. Actual Comparison
            </h3>
            <ResponsiveContainer>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
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
                <Bar dataKey="actual" name="Actual Demand" fill="#FF6B6B" />
                <Bar dataKey="forecast" name="Forecast" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  // Completing the renderHistoricalView function
  const renderHistoricalView = () => {
    if (loading || !historicalData.length) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      );
    }

    // Group data by month and week
    const monthlyData = {};
    const weeklyData = {};

    historicalData.forEach((item) => {
      // For monthly data
      if (!monthlyData[item.month]) {
        monthlyData[item.month] = 0;
      }
      monthlyData[item.month] += item.count;

      // For weekly data
      const weekKey = `${item.month}-W${item.week}`;
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += item.count;
    });

    // Convert to arrays for charts
    const monthlyChartData = Object.keys(monthlyData).map((month) => ({
      month,
      count: monthlyData[month],
    }));

    const weeklyChartData = Object.keys(weeklyData)
  .map((week) => ({
    week,
    count: weeklyData[week],
  }))
  .sort((a, b) => {
    // Extract month and week for proper sorting
    const [monthA, weekNumA] = a.week.split('-W');
    const [monthB, weekNumB] = b.week.split('-W');

    // Map month abbreviations to numbers
    const months = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    // Sort first by month, then by week
    if (months[monthA] !== months[monthB]) {
      return months[monthA] - months[monthB];
    }
    return parseInt(weekNumA) - parseInt(weekNumB);
  });

    // Calculate month-over-month growth
    const growthData = [];
    const months = Object.keys(monthlyData).sort();

    for (let i = 1; i < months.length; i++) {
      const prevMonth = months[i - 1];
      const currMonth = months[i];
      const prevCount = monthlyData[prevMonth];
      const currCount = monthlyData[currMonth];

      const growthRate =
        prevCount > 0 ? ((currCount - prevCount) / prevCount) * 100 : 0;

      growthData.push({
        month: currMonth,
        growth: growthRate,
      });
    }

    // Time distribution by day of week
    const dayOfWeekData = historicalData.reduce((acc, item) => {
      const date = new Date(item.date);
      const day = date.toLocaleString("default", { weekday: "short" });

      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += item.count;

      return acc;
    }, {});

    const dayOfWeekChartData = Object.keys(dayOfWeekData).map((day) => ({
      day,
      count: dayOfWeekData[day],
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-red-400 flex items-center">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                Monthly Trend Analysis
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeframe("monthly")}
                  className={`px-3 py-1 rounded text-xs ${timeframe === "monthly"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeframe("weekly")}
                  className={`px-3 py-1 rounded text-xs ${timeframe === "weekly"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <ResponsiveContainer>
              {timeframe === "monthly" ? (
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="count" name="Relocations" fill="#FF6B6B" />
                </BarChart>
              ) : (
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "#e5e7eb" }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      color: "#f9fafb",
                    }}
                  />
                  <Bar dataKey="count" name="Relocations" fill="#4ECDC4" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
              Month-over-Month Growth
            </h3>
            <ResponsiveContainer>
              <ComposedChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                  label={{
                    value: "Growth %",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#e5e7eb",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="growth" name="Growth %" fill="#FFD166">
                  {growthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.growth >= 0 ? "#4ECDC4" : "#FF6B6B"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#F9F871"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Day of Week Distribution
            </h3>
            <ResponsiveContainer>
              <BarChart data={dayOfWeekChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="count" name="Relocations" fill="#6A0572" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-yellow-400 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Historical Data Summary
            </h3>
            <div className="overflow-y-auto h-64 scrollbar-thin">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Relocations
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {historicalData
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                        }
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                          {item.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  // Adding the missing renderRegionalView function
  const renderRegionalView = () => {
    if (loading || !regionalData.length) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      );
    }

    // Calculate total for percentage display
    const totalRelocations = regionalData.reduce(
      (sum, region) => sum + region.count,
      0
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-red-400 flex items-center">
              <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
              Regional Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="region"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {regionalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    props.payload.region,
                  ]}
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
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 h-80">
            <h3 className="text-sm font-semibold mb-4 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Regional Comparison
            </h3>
            <ResponsiveContainer>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="region"
                  tick={{ fontSize: 12, fill: "#e5e7eb" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey="count" name="Relocations" fill="#4ECDC4">
                  {regionalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4 text-green-400 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Regional Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Region
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Relocations
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Percentage
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {regionalData.map((region, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                        {region.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {region.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {region.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${region.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    );
  };



  // Main component return statement
  return (
    <div className="p-6 bg-gray-800 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Demand Forecast
          </h1>
          <p className="text-gray-400">
            Analyze relocation demand patterns and predictions
          </p>
        </div>

        <div className="flex mt-4 md:mt-0 space-x-2">
          <button
            onClick={generateNewForecast}
            disabled={isGenerating}
            className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
            )}
            Generate Forecast
          </button>

          <div className="relative">
            <button
              onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
              className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-200 flex items-center"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export
            </button>

            {downloadMenuVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                <ul className="py-1">
                  <li
                    onClick={() => {
                      handleDownload.PDF();
                      setDownloadMenuVisible(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    Export as PDF
                  </li>
                  <li
                    onClick={() => {
                      handleDownload.Excel();
                      setDownloadMenuVisible(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    Export as Excel
                  </li>
                  <li
                    onClick={() => {
                      handleDownload.CSV();
                      setDownloadMenuVisible(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    Export as CSV
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-xs">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Search forecasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${messageType === "success"
            ? "bg-green-900 text-green-200"
            : "bg-red-900 text-red-200"
            }`}
        >
          {message}
        </div>
      )}

      {renderMetricsCards()}

      {renderTabs()}

      {currentView === "forecast" && renderForecastView()}
      {currentView === "historical" && renderHistoricalView()}
      {currentView === "regional" && renderRegionalView()}



      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        {/* <h3 className="text-xl font-semibold mb-4 text-white">
          Demand Forecast History
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Forecast Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Predicted Demand
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Created By
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Accuracy
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Creation Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {forecastData
                .filter(
                  (item) =>
                    item.forecast_date.includes(searchQuery) ||
                    item.predicted_demand.toString().includes(searchQuery) ||
                    (item.created_by?.phone_number &&
                      item.created_by.phone_number.includes(searchQuery))
                )
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((forecast, index) => (
                  <tr
                    key={forecast.id || index}
                    className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      {forecast.forecast_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {forecast.predicted_demand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {forecast.created_by?.phone_number || "System"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {forecast.accuracy !== null ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            forecast.accuracy > 90
                              ? "bg-green-900 text-green-200"
                              : forecast.accuracy > 80
                              ? "bg-blue-900 text-blue-200"
                              : forecast.accuracy > 70
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-red-900 text-red-200"
                          }`}
                        >
                          {forecast.accuracy}%
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {forecast.created_at || "N/A"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div> */}

        {/* Pagination */}
        {/* <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              forecastData.length
            )}{" "}
            to {Math.min(currentPage * itemsPerPage, forecastData.length)} of{" "}
            {forecastData.length} forecasts
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-400">
              Page {currentPage} of{" "}
              {Math.ceil(forecastData.length / itemsPerPage)}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(forecastData.length / itemsPerPage)
                  )
                )
              }
              disabled={
                currentPage >= Math.ceil(forecastData.length / itemsPerPage)
              }
              className={`px-3 py-1 rounded ${
                currentPage >= Math.ceil(forecastData.length / itemsPerPage)
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              Next
            </button>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Dispatcher_DemandForecast;
