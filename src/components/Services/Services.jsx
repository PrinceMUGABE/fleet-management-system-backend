/* eslint-disable no-unused-vars */
import React from "react";
import { Truck, BarChart2, Clock, Database, Map, Package, Warehouse, Gauge, AlertCircle } from "lucide-react";

const logisticsServices = [
  {
    name: "Route Optimization",
    description: "AI-powered route planning with real-time traffic updates",
    icon: <Map className="text-blue-600" size={32} />,
    ctaText: "Optimize Routes",
    link: "/routes"
  },
  {
    name: "Fleet Tracking",
    description: "Live GPS tracking of all vehicles in your fleet",
    icon: <Gauge className="text-blue-600" size={32} />,
    ctaText: "Track Fleet",
    link: "/fleet"
  },
  {
    name: "Inventory Management",
    description: "Real-time warehouse stock monitoring",
    icon: <Warehouse className="text-blue-600" size={32} />,
    ctaText: "Manage Inventory",
    link: "/inventory"
  },
  {
    name: "Shipment Tracking",
    description: "End-to-end package tracking system",
    icon: <Package className="text-blue-600" size={32} />,
    ctaText: "Track Shipments",
    link: "/shipments"
  },
  {
    name: "Analytics Dashboard",
    description: "Performance metrics and business insights",
    icon: <BarChart2 className="text-blue-600" size={32} />,
    ctaText: "View Analytics",
    link: "/analytics"
  },
  {
    name: "Alert System",
    description: "Real-time notifications for delays/issues",
    icon: <AlertCircle className="text-blue-600" size={32} />,
    ctaText: "Configure Alerts",
    link: "/alerts"
  }
];

const LogisticsServices = () => {
  return (
    <section id="services" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Smart Logistics Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our integrated platform provides end-to-end logistics management powered by IoT and AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logisticsServices.map((service) => (
            <div 
              key={service.name}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {service.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                
                <a
                  href={service.link}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  {service.ctaText}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Custom Solution
          </a>
        </div>
      </div>
    </section>
  );
};

export default LogisticsServices;