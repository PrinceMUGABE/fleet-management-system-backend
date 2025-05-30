/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import mapData from "../customer/mapData.json";

// Custom icon creation function
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const Dispatcher_Create_Relocation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mapInstance, setMapInstance] = useState(null);
  const mapContainerRef = useRef(null);

  // State for form inputs
  const [allDistricts, setAllDistricts] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [selectedOriginDistrict, setSelectedOriginDistrict] = useState("");
  const [selectedDestinationDistrict, setSelectedDestinationDistrict] =
    useState("");
  const [selectedOriginSector, setSelectedOriginSector] = useState("");
  const [selectedDestinationSector, setSelectedDestinationSector] =
    useState("");

  // Marker and route states
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [routeLine, setRouteLine] = useState(null);

  // Recommendation states
  const [recommendationData, setRecommendationData] = useState(null);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);

  // Other form states
  const [moveDateTime, setMoveDateTime] = useState("");
  const [originCoordinates, setOriginCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [recommendationToken, setRecommendationToken] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentRelocation, setCurrentRelocation] = useState(null);

  // Vehicle ID from previous page
  const vehicleId = location.state?.vehicleId;

  // Get all districts from provinces
  const getAllDistricts = () => {
    const districts = mapData.provinces.flatMap((province) =>
      province.coordinates.districts.map((district) => ({
        name: district.name,
        provinceName: province.city || province.province,
      }))
    );
    return districts;
  };

  // Get sectors for a specific district
  const getSectorsForDistrict = (districtName) => {
    const allSectorsData = mapData.provinces.flatMap((province) =>
      province.coordinates.districts
        .filter((district) => district.name === districtName)
        .flatMap((district) =>
          district.sectors.map((sector) => ({
            ...sector,
            districtName: district.name,
            provinceName: province.city || province.province,
          }))
        )
    );
    return allSectorsData;
  };

  // Get coordinates for a specific sector
  const getSectorCoordinates = (sectorName, districtName) => {
    const matchingSector = mapData.provinces.flatMap((province) =>
      province.coordinates.districts
        .filter((district) => district.name === districtName)
        .flatMap((district) =>
          district.sectors.filter((sector) => sector.name === sectorName)
        )
    )[0];

    return matchingSector
      ? { lat: matchingSector.latitude, lng: matchingSector.longitude }
      : null;
  };

  // Draw optimal route with improved visualization
  const drawOptimalRoute = (coordinates) => {
    if (!mapInstance || !coordinates || coordinates.length === 0) return;

    // Remove existing route line
    if (routeLine) {
      mapInstance.removeLayer(routeLine);
    }

    // Create new route line with backend coordinates
    const routeCoordinates = coordinates.map((coord) => [
      coord.latitude,
      coord.longitude,
    ]);

    const newRouteLine = L.polyline(routeCoordinates, {
      color: "red",
      weight: 5,
      dashArray: "10, 10", // Dashed line
      opacity: 0.7,
    }).addTo(mapInstance);

    setRouteLine(newRouteLine);

    // Fit map to route bounds with some padding
    if (routeCoordinates.length > 0) {
      mapInstance.fitBounds(routeCoordinates, {
        padding: [50, 50], // Add some padding around the route
        maxZoom: 12, // Prevent zooming too close
      });
    }
  };

  // Populate districts on component mount
  useEffect(() => {
    const districts = getAllDistricts();
    setAllDistricts(districts);
  }, []);

  // Update sectors when origin district changes
  useEffect(() => {
    if (selectedOriginDistrict) {
      const sectorsForDistrict = getSectorsForDistrict(selectedOriginDistrict);
      setAllSectors(sectorsForDistrict);
    }
  }, [selectedOriginDistrict]);

  // Initial map creation
  useEffect(() => {
    // Find center of first province (Kigali)
    const firstProvince = mapData.provinces[0];
    const provinceCenter = [
      firstProvince.coordinates.city_center.latitude,
      firstProvince.coordinates.city_center.longitude,
    ];

    const map = L.map(mapContainerRef.current).setView(provinceCenter, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setMapInstance(map);

    // Add markers for notable locations and district centers
    mapData.provinces.forEach((province) => {
      if (province.coordinates.notable_locations) {
        province.coordinates.notable_locations.forEach((location) => {
          L.marker([location.latitude, location.longitude])
            .bindPopup(
              `${location.name} (${province.city || province.province})`
            )
            .addTo(map);
        });
      }

      // Add markers for all district centers
      province.coordinates.districts.forEach((district) => {
        L.marker([district.latitude, district.longitude])
          .bindPopup(
            `${district.name} District (${province.city || province.province})`
          )
          .addTo(map);
      });
    });

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Map click handling and marker placement
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;

      if (!originMarker) {
        // Place origin marker
        const newOriginMarker = L.marker([lat, lng], {
          icon: createCustomIcon("green"),
        }).addTo(mapInstance);
        setOriginMarker(newOriginMarker);
        setOriginCoordinates({ lat, lng });
      } else if (!destinationMarker) {
        // Place destination marker
        const newDestinationMarker = L.marker([lat, lng], {
          icon: createCustomIcon("red"),
        }).addTo(mapInstance);
        setDestinationMarker(newDestinationMarker);
        setDestinationCoordinates({ lat, lng });

        // Draw line between markers
        const line = L.polyline(
          [
            [originMarker.getLatLng().lat, originMarker.getLatLng().lng],
            [lat, lng],
          ],
          { color: "blue" }
        ).addTo(mapInstance);
        setRouteLine(line);
      } else {
        // Remove existing markers and line
        mapInstance.removeLayer(originMarker);
        mapInstance.removeLayer(destinationMarker);
        if (routeLine) mapInstance.removeLayer(routeLine);

        // Place new origin marker
        const newOriginMarker = L.marker([lat, lng], {
          icon: createCustomIcon("green"),
        }).addTo(mapInstance);
        setOriginMarker(newOriginMarker);
        setDestinationMarker(null);
        setRouteLine(null);
        setOriginCoordinates({ lat, lng });
        setDestinationCoordinates(null);
      }
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
    };
  }, [mapInstance, originMarker, destinationMarker, routeLine]);

  // Sector change handlers
  const handleOriginSectorChange = (sectorName) => {
    setSelectedOriginSector(sectorName);

    // Get coordinates for the selected sector
    const sectorCoordinates = getSectorCoordinates(
      sectorName,
      selectedOriginDistrict
    );

    if (sectorCoordinates) {
      // Remove existing origin marker if any
      if (originMarker) {
        mapInstance.removeLayer(originMarker);
      }

      // Add new marker for the selected sector
      const newOriginMarker = L.marker(
        [sectorCoordinates.lat, sectorCoordinates.lng],
        { icon: createCustomIcon("green") }
      ).addTo(mapInstance);

      // Update states
      setOriginMarker(newOriginMarker);
      setOriginCoordinates(sectorCoordinates);

      // Center map on selected location
      mapInstance.setView([sectorCoordinates.lat, sectorCoordinates.lng], 12);
    }
  };

  const handleDestinationSectorChange = (sectorName) => {
    setSelectedDestinationSector(sectorName);

    // Get coordinates for the selected sector
    const sectorCoordinates = getSectorCoordinates(
      sectorName,
      selectedDestinationDistrict
    );

    if (sectorCoordinates) {
      // Remove existing destination marker if any
      if (destinationMarker) {
        mapInstance.removeLayer(destinationMarker);
      }

      // Add new marker for the selected sector
      const newDestinationMarker = L.marker(
        [sectorCoordinates.lat, sectorCoordinates.lng],
        { icon: createCustomIcon("red") }
      ).addTo(mapInstance);

      // Update states
      setDestinationMarker(newDestinationMarker);
      setDestinationCoordinates(sectorCoordinates);

      // Draw line if origin marker exists
      if (originMarker && originCoordinates) {
        // Remove existing route line if any
        if (routeLine) {
          mapInstance.removeLayer(routeLine);
        }

        // Draw new route line
        const line = L.polyline(
          [
            [originCoordinates.lat, originCoordinates.lng],
            [sectorCoordinates.lat, sectorCoordinates.lng],
          ],
          { color: "blue" }
        ).addTo(mapInstance);
        setRouteLine(line);
      }

      // Center map on selected location
      mapInstance.setView([sectorCoordinates.lat, sectorCoordinates.lng], 12);
    }
  };

  // Reset map view
  const resetMap = () => {
    if (mapInstance) {
      const firstProvince = mapData.provinces[0];
      const provinceCenter = [
        firstProvince.coordinates.city_center.latitude,
        firstProvince.coordinates.city_center.longitude,
      ];

      mapInstance.setView(provinceCenter, 8);

      // Remove existing markers and line
      if (originMarker) mapInstance.removeLayer(originMarker);
      if (destinationMarker) mapInstance.removeLayer(destinationMarker);
      if (routeLine) mapInstance.removeLayer(routeLine);

      // Reset states
      setOriginMarker(null);
      setDestinationMarker(null);
      setRouteLine(null);
      setOriginCoordinates(null);
      setDestinationCoordinates(null);
      setSelectedOriginDistrict("");
      setSelectedDestinationDistrict("");
      setSelectedOriginSector("");
      setSelectedDestinationSector("");
    }
  };

  // Retrieve the token from local storage
  const token = localStorage.getItem("token");

  // Handle form submission
  // Fix for the handleSubmit function - properly accessing the vehicle value
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if token exists
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      navigate("/login");
      return;
    }

    // Validation checks
    if (!originCoordinates || !destinationCoordinates) {
      alert("Please select origin and destination points on the map");
      return;
    }

    if (!moveDateTime) {
      alert("Please select a date and time");
      return;
    }

    // Get the selected vehicle ID from the dropdown
    const vehicleSelect = document.querySelector('select[name="vehicle"]');
    const selectedVehicleId = vehicleSelect ? vehicleSelect.value : null;

    if (!selectedVehicleId || selectedVehicleId === "") {
      alert("Please select a vehicle");
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        start_point: `${originCoordinates.lng},${originCoordinates.lat}`,
        end_point: `${destinationCoordinates.lng},${destinationCoordinates.lat}`,
        vehicle_id: selectedVehicleId, // Use the selected vehicle ID
        move_datetime: new Date(moveDateTime).toISOString(),
        origin_district: selectedOriginDistrict,
        origin_sector: selectedOriginSector,
        destination_district: selectedDestinationDistrict,
        destination_sector: selectedDestinationSector,
      };

      console.log("Submitted Data: ", submissionData);

      // Submit to backend
      const response = await axios.post(
        "http://127.0.0.1:8000/relocation/create/",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Route Recommendations: ", response.data);

      setRecommendationToken(response.data.recommendation_token);

      // Set recommendation data and open modal
      setRecommendationData(response.data);
      setIsRecommendationModalOpen(true);

      // Draw optimal route if available
      if (
        response.data.optimal_route &&
        response.data.optimal_route.coordinates
      ) {
        drawOptimalRoute(response.data.optimal_route.coordinates);
      }
    } catch (error) {
      console.error("Error submitting route:", error);
      alert("Failed to submit route. Please try again.");
    }
  };

  // Fixed vehicle dropdown in the return section
  // Replace the existing vehicle dropdown with this:
  <div>
    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
    <select
      name="vehicle"
      className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      defaultValue={vehicleId || ""}
    >
      <option value="">Select Vehicle</option>
      {vehicles.map((vehicle) => (
        <option key={vehicle.id} value={vehicle.id}>
          {vehicle.vehicle_type} (Weight: {vehicle.total_weight_to_carry} kg)
        </option>
      ))}
    </select>
  </div>;

  // Handle route confirmation
  const handleConfirmRoute = async () => {
    // Retrieve the token from local storage
    const token = localStorage.getItem("token");

    // Check if token exists
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      navigate("/login");
      return;
    }

    // Check if recommendation token exists
    if (!recommendationToken) {
      alert("No recommendation token found. Please submit a route first.");
      return;
    }

    try {
      // Submit confirmation with the recommendation token
      const response = await axios.post(
        "http://127.0.0.1:8000/relocation/confirm/",
        {
          recommendation_token: recommendationToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/dispatcher/relocations");
    } catch (error) {
      console.error("Error confirming route:", error);

      // Check for unauthorized error
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert("Failed to confirm route. Please try again.");
    }
  };

  // Handle route cancellation
  const handleCancelRoute = async () => {
    // Retrieve the token from local storage
    const token = localStorage.getItem("token");

    // Check if token exists
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      navigate("/login");
      return;
    }

    // Check if recommendation token exists
    if (!recommendationToken) {
      alert("No recommendation token found. Please submit a route first.");
      return;
    }

    try {
      // Submit cancellation with the recommendation token
      await axios.post(
        "http://127.0.0.1:8000/relocation/cancel/",
        {
          recommendation_token: recommendationToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsRecommendationModalOpen(false);

      // Reset map route visualization
      if (routeLine) {
        mapInstance.removeLayer(routeLine);
        setRouteLine(null);
      }
    } catch (error) {
      console.error("Error canceling route:", error);

      // Check for unauthorized error
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert("Failed to cancel route. Please try again.");
    }
  };

  // Recommendation Modal Component
  const RecommendationModal = () => {
    if (!recommendationData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] relative overflow-hidden">
          {/* Close Button */}
          <button
            onClick={() => setIsRecommendationModalOpen(false)}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>

          <h2 className="text-xl text-black font-bold mb-4">
            Route Recommendation
          </h2>

          <div
            className="grid md:grid-cols-2 gap-4 overflow-y-auto pr-2"
            style={{ maxHeight: "calc(80vh - 120px)" }}
          >
            {/* Left Column: Route Details */}
            <div>
              <h3 className="font-semibold mb-2 text-red-700">
                Route Information
              </h3>
              <p className="text-black">
                <strong>Origin:</strong> {recommendationData.origin_district} -{" "}
                {recommendationData.origin_sector}
              </p>

              <p className="text-black">
                <strong>Destination:</strong>{" "}
                {recommendationData.destination_district} -{" "}
                {recommendationData.destination_sector}
              </p>

              <p className="text-black">
                <strong>Distance:</strong>{" "}
                {recommendationData.optimal_route.distance_km} km
              </p>
              <p className="text-black">
                <strong>Estimated Duration:</strong>{" "}
                {recommendationData.optimal_route.estimated_duration}
              </p>
              <p className="text-black">
                <strong>Recommended Departure:</strong>{" "}
                {recommendationData.recommended_departure_time}
              </p>
              {/* <p className="text-black">
                <strong>Base Cost:</strong>{" "}
                {recommendationData.optimal_route.base_cost}
              </p> */}
              <p className="text-black">
                <strong>Adjusted Cost:</strong>{" "}
                {recommendationData.optimal_route.adjusted_cost}
              </p>
            </div>

            {/* Right Column: Conditions and Actions */}
            <div>
              <h3 className="font-semibold text-red-700 mb-2">
                Travel Conditions
              </h3>
              <p className="text-black">
                <strong>Season:</strong> {recommendationData.conditions.season}
              </p>
              <p className="text-black">
                <strong>Weather:</strong>{" "}
                {recommendationData.conditions.weather}
              </p>
              <p className="text-black">
                <strong>Time of Day:</strong>{" "}
                {recommendationData.conditions.time_of_day}
              </p>
              <p className="text-black">
                <strong>Traffic:</strong>{" "}
                {recommendationData.conditions.traffic_condition}
              </p>
            </div>

            <div className="col-span-2">
              <h3 className="font-semibold text-red-700 mb-2">
                Relocation Tips:
              </h3>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                {renderRelocationTips(recommendationData.relocation_tips)}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleConfirmRoute}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Confirm Route
            </button>
            <button
              onClick={handleCancelRoute}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel Route
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Inside the RecommendationModal component
  const renderRelocationTips = (tips) => {
    // If tips are 3 or fewer, render as a single list
    if (tips.length <= 3) {
      return (
        <ul className="list-disc list-inside">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-gray-600">
              {tip}
            </li>
          ))}
        </ul>
      );
    }

    // If tips exceed 3, split into multiple columns
    const firstColumnTips = tips.slice(0, Math.ceil(tips.length / 2));
    const secondColumnTips = tips.slice(Math.ceil(tips.length / 2));

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ul className="list-disc list-inside">
            {firstColumnTips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-600">
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ul className="list-disc list-inside">
            {secondColumnTips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-600">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Fetch vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/vehicle/list_vehicles/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-4">
        {/* Origin District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Origin District
          </label>
          <select
            value={selectedOriginDistrict}
            onChange={(e) => {
              setSelectedOriginDistrict(e.target.value);
              // Reset origin sector when district changes
              setSelectedOriginSector("");
            }}
            className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Origin District</option>
            {allDistricts.map((district) => (
              <option
                key={`${district.name}-${district.provinceName}`}
                value={district.name}
              >
                {district.name} ({district.provinceName})
              </option>
            ))}
          </select>
        </div>

        {/* Destination District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destination District
          </label>
          <select
            value={selectedDestinationDistrict}
            onChange={(e) => {
              setSelectedDestinationDistrict(e.target.value);
              // Reset destination sector when district changes
              setSelectedDestinationSector("");
            }}
            className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Destination District</option>
            {allDistricts.map((district) => (
              <option
                key={`${district.name}-${district.provinceName}`}
                value={district.name}
              >
                {district.name} ({district.provinceName})
              </option>
            ))}
          </select>
        </div>

        {/* Origin Sector Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Origin Sector
          </label>
          <select
            value={selectedOriginSector}
            onChange={(e) => handleOriginSectorChange(e.target.value)}
            disabled={!selectedOriginDistrict}
            className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Origin Sector</option>
            {allSectors.map((sector) => (
              <option
                key={`${sector.name}-${sector.districtName}`}
                value={sector.name}
              >
                {sector.name} (District: {sector.districtName})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Sector Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destination Sector
          </label>
          <select
            value={selectedDestinationSector}
            onChange={(e) => handleDestinationSectorChange(e.target.value)}
            disabled={!selectedDestinationDistrict}
            className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Destination Sector</option>
            {selectedDestinationDistrict
              ? getSectorsForDistrict(selectedDestinationDistrict).map(
                  (sector) => (
                    <option
                      key={`${sector.name}-${sector.districtName}`}
                      value={sector.name}
                    >
                      {sector.name} (District: {sector.districtName})
                    </option>
                  )
                )
              : []}
          </select>
        </div>

        {/* Date and Time Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Move Date and Time
          </label>
          <input
            type="datetime-local"
            value={moveDateTime}
            onChange={(e) => setMoveDateTime(e.target.value)}
            className="mt-1 text-gray-600 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

        {/* Vehicle Dropdown */}
        <div>
          <label className="block text-gray-300 mb-2">Vehicle</label>
          <select
            name="vehicle"
            defaultValue={
              currentRelocation ? currentRelocation.relocation_size : ""
            }
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicle_type} (Weight: {vehicle.total_weight_to_carry}{" "}
                kg)
              </option>
            ))}
          </select>
        </div>

        {/* Coordinates Display */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Origin Coordinates
            </label>
            <input
              type="text"
              value={
                originCoordinates
                  ? `Lat: ${originCoordinates.lat.toFixed(
                      6
                    )}, Lng: ${originCoordinates.lng.toFixed(6)}`
                  : "Not Selected"
              }
              readOnly
              className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Destination Coordinates
            </label>
            <input
              type="text"
              value={
                destinationCoordinates
                  ? `Lat: ${destinationCoordinates.lat.toFixed(
                      6
                    )}, Lng: ${destinationCoordinates.lng.toFixed(6)}`
                  : "Not Selected"
              }
              readOnly
              className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-100 rounded-md"
            />
          </div>
        </div>
      </form>

      {/* Map Instructions */}
      <div className="mb-4 text-sm text-gray-600">
        Select a district and sector, or click on the map to select your origin
        (green) and destination (red) points. Click again to reset markers if
        needed.
      </div>

      {/* Map Controls */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={resetMap}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Map View
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Route
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: "500px", width: "100%" }}
        className="border-2 border-gray-300 rounded"
      />

      {/* Recommendation Modal */}
      {isRecommendationModalOpen && <RecommendationModal />}
    </div>
  );
};

export default Dispatcher_Create_Relocation;
