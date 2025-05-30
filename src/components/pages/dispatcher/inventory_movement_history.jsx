/* eslint-disable no-unused-vars */
// src/components/InventoryMovementHistory.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faExchangeAlt,
  faBox,
  faWarehouse,
  faCalendarAlt,
  faExclamationTriangle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const Dispatcher_InventoryMovementHistory = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [warehouseInfo, setWarehouseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [totalMovements, setTotalMovements] = useState(0);
  const BASE_URL = "http://127.0.0.1:8000/warehouse/";
  const token = localStorage.getItem("token");

  // Add parameter validation
  useEffect(() => {
    console.log("warehouseId:", warehouseId);
    
    if (!warehouseId || warehouseId === 'undefined') {
      setMessage("Invalid warehouse ID. Please check the URL.");
      setMessageType("error");
      return;
    }
    
    if (!token) {
      setMessage("Authentication token not found. Please log in again.");
      setMessageType("error");
      return;
    }
    
    fetchData();
  }, [warehouseId, token]);

  const fetchData = async () => {
    if (!warehouseId || warehouseId === 'undefined') {
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    try {
      console.log("Fetching movements for warehouse ID:", warehouseId);
      
      const response = await axios.get(`${BASE_URL}warehouses/${warehouseId}/movements/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // The API now returns structured data
      setWarehouseInfo(response.data.warehouse);
      setMovements(response.data.movements);
      setTotalMovements(response.data.total_movements || response.data.movements.length);
      
    } catch (err) {
      console.error("Error fetching warehouse movements:", err);
      
      if (err.response?.status === 404) {
        setMessage("Warehouse not found. Please check the ID and try again.");
      } else if (err.response?.status === 401) {
        setMessage("Authentication failed. Please log in again.");
      } else {
        setMessage("Failed to fetch movement history. Please try again.");
      }
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case "in":
        return "bg-green-900 text-green-100";
      case "out":
        return "bg-red-900 text-red-100";
      case "transfer":
        return "bg-blue-900 text-blue-100";
      case "adjustment":
        return "bg-yellow-900 text-yellow-100";
      default:
        return "bg-gray-900 text-gray-100";
    }
  };

  const getMovementTypeLabel = (type) => {
    switch (type) {
      case "in":
        return "Stock In";
      case "out":
        return "Stock Out";
      case "transfer":
        return "Transfer";
      case "adjustment":
        return "Adjustment";
      default:
        return type;
    }
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case "in":
        return faBox;
      case "out":
        return faExchangeAlt;
      case "transfer":
        return faWarehouse;
      case "adjustment":
        return faExclamationTriangle;
      default:
        return faExchangeAlt;
    }
  };

  // Show error state if no valid ID
  if (!warehouseId || warehouseId === 'undefined') {
    return (
      <div className="p-4 bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-6xl text-red-500 mb-4"
            />
            <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Parameters</h2>
            <p className="text-gray-400 mb-4">
              The warehouse ID is missing or invalid.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back
            </button>
            <div className="text-center flex-1">
              <h1 className="text-blue-500 font-bold text-xl mb-2">
                Warehouse Movement History
              </h1>
              {warehouseInfo && (
                <div>
                  <p className="text-gray-400 text-sm">
                    <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                    {warehouseInfo.location}
                  </p>
                  <div className="flex justify-center items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      warehouseInfo.status === 'running' 
                        ? 'bg-green-900 text-green-100' 
                        : 'bg-red-900 text-red-100'
                    }`}>
                      {warehouseInfo.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      warehouseInfo.availability_status === 'available' 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'bg-orange-900 text-orange-100'
                    }`}>
                      {warehouseInfo.availability_status}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          {/* Summary Stats */}
          <div className="text-center">
            <span className="text-gray-500 text-sm">
              Total Movements: <span className="text-blue-400 font-semibold">{totalMovements}</span>
            </span>
          </div>
        </div>

        {/* Message Display */}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-2">Loading movement history...</p>
          </div>
        ) : (
          /* Movements Table */
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">#</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Commodity</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Created By</th>
                  <th className="px-6 py-3 rounded-tr-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-400 bg-gray-800">
                      <div className="flex flex-col items-center">
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="text-4xl mb-3 text-gray-600"
                        />
                        <p>No movement history found for this warehouse</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Movements will appear here once inventory activities begin
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  movements.map((movement, index) => (
                    <tr
                      key={movement.id}
                      className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeColor(
                            movement.movement_type
                          )}`}
                        >
                          <FontAwesomeIcon
                            icon={getMovementTypeIcon(movement.movement_type)}
                            className="mr-1"
                          />
                          {getMovementTypeLabel(movement.movement_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div>
                          <span className="font-medium">{movement.commodity_name}</span>
                          {movement.warehouse_location && (
                            <div className="text-xs text-gray-500">
                              {movement.warehouse_location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <span className={`font-medium ${
                          movement.movement_type === 'in' ? 'text-green-400' :
                          movement.movement_type === 'out' ? 'text-red-400' :
                          'text-blue-400'
                        }`}>
                          {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
                        </span>
                        <span className="text-gray-500 ml-1">
                          {movement.commodity_unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {movement.reference_number || 
                          <span className="text-gray-500 italic">No reference</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {movement.notes || 
                          <span className="text-gray-500 italic">No notes</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {movement.created_by_name || 
                          <span className="text-gray-500 italic">Unknown</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-1 text-gray-400"
                          />
                          <div>
                            <div>{new Date(movement.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(movement.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dispatcher_InventoryMovementHistory;