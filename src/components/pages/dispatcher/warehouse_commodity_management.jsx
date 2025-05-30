/* eslint-disable no-unused-vars */
// src/components/WarehouseCommodityManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faPlus,
  faBox,
  faWarehouse,
  faExchangeAlt,
  faHistory,
  faArrowUp,
  faArrowDown,
  faEquals
} from '@fortawesome/free-solid-svg-icons';

const Dispatcher_WarehouseCommodityManagement = () => {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [commodities, setCommodities] = useState([]);
  const [allCommodities, setAllCommodities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryAction, setInventoryAction] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const BASE_URL = 'http://127.0.0.1:8000/warehouse/';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [warehouseRes, commoditiesRes, allCommoditiesRes] = await Promise.all([
        axios.get(`${BASE_URL}${warehouseId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}warehouses/${warehouseId}/commodities/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}commodities/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setWarehouse(warehouseRes.data);
      setCommodities(commoditiesRes.data);
      setAllCommodities(allCommoditiesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage('Failed to fetch data');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [warehouseId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this commodity from the warehouse?')) return;
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}warehouses/${warehouseId}/commodities/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setMessage('Commodity removed successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to remove commodity');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCommodity = async (formData) => {
    try {
      setIsLoading(true);
      await axios.post(
        `${BASE_URL}warehouses/${warehouseId}/commodities/add/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      setIsModalOpen(false);
      setMessage('Commodity added successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add commodity');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInventoryAction = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${BASE_URL}inventory/update/`,
        {
          warehouse_commodity_id: currentItem.id,
          quantity: parseFloat(quantity),
          movement_type: inventoryAction,
          notes: notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      setInventoryModalOpen(false);
      setQuantity('');
      setNotes('');
      setMessage('Inventory updated successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update inventory');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'in': return faArrowUp;
      case 'out': return faArrowDown;
      default: return faEquals;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'in': return 'text-green-400';
      case 'out': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="p-4 bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-center text-blue-500 font-bold text-xl mb-2">
            Warehouse Commodity Management
          </h1>
          {warehouse && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                {warehouse.location}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Status: <span className="text-white">{warehouse.status}</span> | 
                Availability: <span className="text-white">{warehouse.availability_status}</span>
              </p>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`text-center py-3 px-4 mb-6 rounded-lg shadow-md ${
              messageType === 'success'
                ? 'bg-green-900 text-green-100'
                : 'bg-red-900 text-red-100'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faBox} className="mr-2" />
              <span>Total Commodities: {commodities.length}</span>
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentItem(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Commodity
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">#</th>
                <th className="px-6 py-3">Commodity</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Current Qty</th>
                <th className="px-6 py-3">Max Capacity</th>
                <th className="px-6 py-3">Utilization</th>
                <th className="px-6 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commodities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400 bg-gray-800">
                    <div className="flex flex-col items-center">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="text-4xl mb-3 text-gray-600"
                      />
                      <p>No commodities found in this warehouse</p>
                    </div>
                  </td>
                </tr>
              ) : (
                commodities.map((item, index) => {
                  const utilization = typeof item.get_capacity_utilization === 'function' 
  ? item.get_capacity_utilization() 
  : (item.current_quantity / item.max_capacity) * 100;
                  return (
                    <tr
                      key={item.id}
                      className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                      <td className="px-6 py-4 text-white font-medium">
                        {item.commodity_name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.category_name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.current_quantity} {item.commodity_unit}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.max_capacity} {item.commodity_unit}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${getUtilizationColor(utilization)}`}
                              style={{
                                width: `${Math.min(100, utilization)}%`,
                              }}
                            ></div>
                          </div>
                          <span>{Math.round(utilization)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setCurrentItem(item);
                              setInventoryAction('in');
                              setInventoryModalOpen(true);
                            }}
                            className="text-green-400 hover:text-green-300"
                            title="Stock In"
                          >
                            <FontAwesomeIcon icon={faArrowUp} />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentItem(item);
                              setInventoryAction('out');
                              setInventoryModalOpen(true);
                            }}
                            className="text-red-400 hover:text-red-300"
                            title="Stock Out"
                          >
                            <FontAwesomeIcon icon={faArrowDown} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Remove"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <Link
                            to={`/warehouses/${warehouseId}/commodities/${item.id}/movements`}
                            className="text-blue-400 hover:text-blue-300"
                            title="View History"
                          >
                            <FontAwesomeIcon icon={faHistory} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Commodity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-96 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-blue-500">
              Add Commodity to Warehouse
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddCommodity({
                commodity_id: formData.get('commodity_id'),
                max_capacity: formData.get('max_capacity'),
                current_quantity: formData.get('current_quantity') || 0,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Commodity</label>
                  <select
                    name="commodity_id"
                    required
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  >
                    <option value="">Select Commodity</option>
                    {allCommodities
                      .filter(
                        (commodity) =>
                          !commodities.some(
                            (wc) => wc.commodity === commodity.id
                          )
                      )
                      .map((commodity) => (
                        <option key={commodity.id} value={commodity.id}>
                          {commodity.name} ({commodity.category_name})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Max Capacity</label>
                  <input
                    type="number"
                    name="max_capacity"
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Initial Quantity (optional)</label>
                  <input
                    type="number"
                    name="current_quantity"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Add Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Action Modal */}
      {inventoryModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setInventoryModalOpen(false)}></div>
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 z-50 w-96 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-blue-500 flex items-center">
              <FontAwesomeIcon 
                icon={getActionIcon(inventoryAction)} 
                className={`mr-2 ${getActionColor(inventoryAction)}`} 
              />
              {inventoryAction === 'in' ? 'Stock In' : 'Stock Out'}
            </h2>
            <div className="mb-4">
              <p className="text-gray-300">
                Commodity: <span className="text-white">{currentItem.commodity_name}</span>
              </p>
              <p className="text-gray-300">
                Current Quantity: <span className="text-white">{currentItem.current_quantity} {currentItem.commodity_unit}</span>
              </p>
              {inventoryAction === 'in' && (
                <p className="text-gray-300">
                  Available Capacity: <span className="text-white">{currentItem.max_capacity - currentItem.current_quantity} {currentItem.commodity_unit}</span>
                </p>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">
                  Quantity ({currentItem.commodity_unit})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setInventoryModalOpen(false);
                  setQuantity('');
                  setNotes('');
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInventoryAction}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={isLoading || !quantity}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatcher_WarehouseCommodityManagement;