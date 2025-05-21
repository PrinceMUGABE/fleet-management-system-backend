/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FleetDisplay = () => {
  const [vehicles, setVehicles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch fleet data
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/vehicle/list_vehicles/');
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fleet data:', error);
        setLoading(false);
      }
    };

    fetchFleet();
  }, []);

  // Auto-rotate fleet display
  useEffect(() => {
    if (vehicles.length <= 2) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev >= vehicles.length - 2 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [vehicles.length]);

  const handleVehicleSelect = (vehicleId) => {
    navigate('/fleet/assign', { state: { vehicleId } });
  };

  // Display 2 vehicles at a time (or 1 if only 1 available)
  const displayVehicles = vehicles.length > 1 
    ? vehicles.slice(currentIndex, currentIndex + 2)
    : vehicles;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading fleet data...</div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-500">No vehicles available in the fleet</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Fleet Management</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-time overview of your logistics fleet with status monitoring and assignment capabilities
          </p>
        </div>

        <div className="relative">
          {/* Fleet Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence mode="wait">
              {displayVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Vehicle Header with Status */}
                  {/* <div className={`px-6 py-3 ${
                    vehicle.status === 'available' ? 'bg-green-500' : 
                    vehicle.status === 'in-route' ? 'bg-blue-500' : 
                    'bg-yellow-500'
                  } text-white flex justify-between items-center`}>
                    <span className="font-medium capitalize">{vehicle.status || 'unknown'}</span>
                    <span className="text-sm">{vehicle.license_plate || 'UNREGISTERED'}</span>
                  </div> */}

                  {/* Vehicle Image */}
                  <div className="h-48 w-full relative bg-gray-100">
                    {vehicle.image_base64 ? (
                      <img
                        src={vehicle.image_base64}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{vehicle.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{vehicle.capacity_kg || '0'} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Location</p>
                        <p className="font-medium">{vehicle.current_location || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Maintenance</p>
                        <p className="font-medium">
                          {vehicle.last_maintenance_date || 'Not recorded'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleVehicleSelect(vehicle.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                      >
                        Request Shipment
                      </button>
                      {/* <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition">
                        Details
                      </button> */}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          {vehicles.length > 2 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentIndex(prev => (prev === 0 ? vehicles.length - 2 : prev - 1))}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.max(1, vehicles.length - 1) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full ${
                      currentIndex === idx ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => setCurrentIndex(prev => (prev >= vehicles.length - 2 ? 0 : prev + 1))}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetDisplay;