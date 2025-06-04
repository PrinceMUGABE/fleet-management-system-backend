/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faBolt,
  faFileExport,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

function Admin_Report() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [batteryAssignments, setBatteryAssignments] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [pastAssignments, setPastAssignments] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reportStats, setReportStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    totalRevenue: 0
  });

  const BASE_URL = "http://127.0.0.1:8000/";

  // Enhanced error handling function
  const handleError = (error, defaultMessage = "An error occurred") => {
    let errorMessage = defaultMessage;

    if (error.response) {
      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
    } else if (error.request) {
      errorMessage = "Network error: Unable to connect to server";
    } else {
      errorMessage = error.message || defaultMessage;
    }

    setMessage(errorMessage);
    setMessageType("error");
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchDriverAssignments();
  }, []);

  const fetchDriverAssignments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}driverAssignment/get_all_assignments/`
      );
      console.log("Driver Assignments Response:", res.data);
      const allAssignments = Array.isArray(res.data.data) ? res.data.data : [];

      // Separate current and past assignments
      const current = allAssignments.filter(
        (assignment) =>
          assignment.status === "assigned" ||
          assignment.status === "in_progress"
      );
      const past = allAssignments.filter(
        (assignment) =>
          assignment.status === "completed" || assignment.status === "cancelled"
      );

      setCurrentAssignments(current);
      setPastAssignments(past);

      // Calculate report statistics
      const activeAssignments = allAssignments.filter(
        (assignment) => assignment.status === "assigned"
      ).length;

      const completedAssignments = allAssignments.filter(
        (assignment) => assignment.status === "completed"
      ).length;

      // Calculate total revenue from completed trips (placeholder calculation)
      const totalRevenue = completedAssignments * 50; // Assuming $50 per completed trip

      setReportStats({
        totalAssignments: allAssignments.length,
        activeAssignments: activeAssignments,
        completedAssignments: completedAssignments,
        totalRevenue: totalRevenue
      });

      setMessage("Report data loaded successfully");
      setMessageType("success");
    } catch (err) {
      console.error("Error fetching driver assignments:", err);
      handleError(err, "Failed to fetch driver assignments");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

 // Replace the existing handleExportToPDF function with this:
const handleExportToPDF = () => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(20);
    doc.text('Driver Assignment Report', 14, 22);
    
    // Add report date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    
    // Add summary statistics
    doc.setFontSize(14);
    doc.text('Report Summary:', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Assignments: ${reportStats.totalAssignments}`, 14, 55);
    doc.text(`Active Assignments: ${reportStats.activeAssignments}`, 14, 62);
    doc.text(`Completed Assignments: ${reportStats.completedAssignments}`, 14, 69);
    doc.text(`Total Revenue: $${reportStats.totalRevenue.toFixed(2)}`, 14, 76);
    
    // Prepare table data
    const allAssignments = [...currentAssignments, ...pastAssignments];
    const tableData = allAssignments.map(assignment => [
      `#${assignment.id}`,
      assignment.driver.name,
      assignment.driver.license_number,
      `${assignment.origin} → ${assignment.destination}`,
      assignment.battery_assignment.vehicle.name,
      assignment.battery_assignment.vehicle.rol_number,
      assignment.start_date,
      assignment.start_time,
      assignment.status_display
    ]);
    
    // Add table headers
    const headers = [
      'ID', 'Driver', 'License', 'Route', 'Vehicle', 'Vehicle ID', 'Date', 'Time', 'Status'
    ];
    
    // Use autoTable plugin for better table formatting
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 85,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Save the PDF
    doc.save(`driver-assignments-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    setMessage("PDF report downloaded successfully!");
    setMessageType("success");
  } catch (error) {
    console.error("Error generating PDF:", error);
    setMessage("Error generating PDF report. Please try again.");
    setMessageType("error");
  }
};

// Replace the existing handleExportToExcel function with this:
const handleExportToExcel = () => {
  try {
    // Prepare data for Excel
    const allAssignments = [...currentAssignments, ...pastAssignments];
    
    // Create summary data
    const summaryData = [
      ['Driver Assignment Report'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [''],
      ['Report Summary:'],
      ['Total Assignments', reportStats.totalAssignments],
      ['Active Assignments', reportStats.activeAssignments],
      ['Completed Assignments', reportStats.completedAssignments],
      ['Total Revenue', `$${reportStats.totalRevenue.toFixed(2)}`],
      [''],
      ['Assignment Details:']
    ];
    
    // Create detailed assignment data
    const assignmentData = allAssignments.map(assignment => ({
      'Assignment ID': `#${assignment.id}`,
      'Driver Name': assignment.driver.name,
      'License Number': assignment.driver.license_number,
      'Origin': assignment.origin,
      'Destination': assignment.destination,
      'Vehicle Name': assignment.battery_assignment.vehicle.name,
      'Vehicle ID': assignment.battery_assignment.vehicle.rol_number,
      'Vehicle Type': assignment.battery_assignment.vehicle.type,
      'Start Date': assignment.start_date,
      'Start Time': assignment.start_time,
      'End Date': assignment.end_date || 'N/A',
      'End Time': assignment.end_time || 'N/A',
      'Status': assignment.status_display,
      'Battery ID': assignment.battery_assignment.battery.rol_number,
      'Battery Charge': `${assignment.battery_assignment.battery.current_charge}%`,
      'Created At': new Date(assignment.created_at).toLocaleString(),
      'Notes': assignment.notes || 'N/A'
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create summary worksheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Create detailed assignments worksheet
    const assignmentWs = XLSX.utils.json_to_sheet(assignmentData);
    XLSX.utils.book_append_sheet(wb, assignmentWs, 'Assignments');
    
    // Save the Excel file
    XLSX.writeFile(wb, `driver-assignments-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    setMessage("Excel report downloaded successfully!");
    setMessageType("success");
  } catch (error) {
    console.error("Error generating Excel:", error);
    setMessage("Error generating Excel report. Please try again.");
    setMessageType("error");
  }
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          Reports
        </h1>

        {/* Global Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {messageType === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Reports Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">
            Assignment Reports
          </h2>
          <p className="text-gray-600 mb-6">
            Generate reports for all vehicle assignments.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleExportToPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Export to PDF
            </button>
            <button
              onClick={handleExportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faFileExcel} />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Report Summary Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">
            Report Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Assignments Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Total Assignments
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {reportStats.totalAssignments}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FontAwesomeIcon 
                    icon={faFileExport} 
                    className="text-blue-600 text-xl"
                  />
                </div>
              </div>
            </div>

            {/* Active Assignments Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Active Assignments
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {reportStats.activeAssignments}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FontAwesomeIcon 
                    icon={faBolt} 
                    className="text-green-600 text-xl"
                  />
                </div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">
                    Total Revenue from Ended Trips
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    ${reportStats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg 
                    className="w-6 h-6 text-purple-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Assignments Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">
            Assignment Details
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...currentAssignments, ...pastAssignments].map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{assignment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{assignment.driver.name}</div>
                        <div className="text-gray-500">{assignment.driver.license_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{assignment.origin}</div>
                        <div className="text-gray-500">→ {assignment.destination}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{assignment.battery_assignment.vehicle.name}</div>
                        <div className="text-gray-500">{assignment.battery_assignment.vehicle.rol_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{assignment.start_date}</div>
                        <div className="text-gray-500">{assignment.start_time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status_display}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin_Report;