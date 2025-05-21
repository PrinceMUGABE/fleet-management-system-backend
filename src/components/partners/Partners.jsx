/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React from "react";
import { BarChart2, LineChart, TrendingUp, Clock, Database, MapPin, Package, Gauge } from "lucide-react";

const LogisticsAnalytics = () => {
  const analyticsFeatures = [
    {
      title: "Real-Time Fleet Analytics",
      icon: <Gauge className="text-blue-600" size={32} strokeWidth={2} />,
      description: "Our system monitors 15+ vehicle metrics in real-time including fuel consumption, engine health, and driver behavior. The dynamic dashboard provides instant visibility into fleet utilization, helping reduce idle time by up to 40% and maintenance costs by 25% through predictive analytics.",
      stats: "98% fleet visibility"
    },
    {
      title: "Intelligent Route Optimization",
      icon: <MapPin className="text-blue-600" size={32} strokeWidth={2} />,
      description: "SLMS processes live traffic data, weather conditions, and delivery windows to calculate optimal routes. Our AI continuously learns from historical patterns to improve ETAs, reducing average delivery times by 30% while cutting fuel costs by 22% through efficient routing.",
      stats: "30% faster deliveries"
    },
    {
      title: "Warehouse Intelligence",
      icon: <Package className="text-blue-600" size={32} strokeWidth={2} />,
      description: "Advanced inventory tracking with IoT sensors provides real-time stock visibility across all warehouses. Our system predicts inventory needs with 95% accuracy, automates replenishment alerts, and optimizes storage layouts to reduce picking time by 35%.",
      stats: "35% faster order fulfillment"
    },
    {
      title: "Supply Chain Forecasting",
      icon: <TrendingUp className="text-blue-600" size={32} strokeWidth={2} />,
      description: "Predictive algorithms analyze market trends, seasonal patterns, and supplier performance to forecast demand with 90% accuracy. The system automatically adjusts procurement plans and inventory levels, reducing stockouts by 60% and excess inventory by 45%.",
      stats: "90% forecast accuracy"
    },
    {
      title: "Performance Benchmarking",
      icon: <BarChart2 className="text-blue-600" size={32} strokeWidth={2} />,
      description: "Comprehensive KPIs track delivery performance, cost per mile, and customer satisfaction across all operations. Customizable dashboards compare performance across regions, drivers, and vehicle types to identify best practices and improvement areas.",
      stats: "200+ tracked metrics"
    },
    {
      title: "Automated Reporting",
      icon: <Database className="text-blue-600" size={32} strokeWidth={2} />,
      description: "Generate regulatory compliance reports, customer delivery proofs, and operational summaries with one click. The system automatically compiles daily, weekly, and monthly reports for all stakeholders, saving 20+ hours per week in administrative work.",
      stats: "80% report automation"
    }
  ];

  return (
    <section id="logistics-analytics" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Logistics Intelligence Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            SLMS transforms raw logistics data into actionable insights, driving operational efficiency and cost savings across your supply chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analyticsFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 flex-grow">
                  {feature.description}
                </p>
                
                <div className="mt-auto">
                  <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {feature.stats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Request Custom Analytics Solution
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LogisticsAnalytics;