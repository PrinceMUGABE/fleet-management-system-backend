/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import hero from "../../assets/pictures/car0.jpg";
import image2 from "../../assets/pictures/package2.jpeg";
import image3 from "../../assets/pictures/cars1.jpg";
import image4 from "../../assets/pictures/car1.jpg";
import image5 from "../../assets/pictures/package1.png";
import image6 from "../../assets/pictures/package3.jpg";

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Updated content for SLMS
  const slides = [
    {
      image: hero,
      title: "Real-Time Fleet Tracking",
      description: "Monitor your entire fleet with live GPS tracking, route history, and geofencing alerts for complete logistics control.",
      button1: "VIEW LIVE MAP",
      button2: "REQUEST DEMO"
    },
     {
      image: image4,
      title: "Smart Inventory Management",
      description: "Automated warehouse tracking with IoT sensors and barcode scanning for seamless inventory control across your supply chain.",
      button1: "EXPLORE FEATURES",
      button2: "CONTACT SALES"
    },
    {
      image: image2,
      title: "Automated Route Optimization",
      description: "Our AI-powered system calculates the most efficient routes considering traffic, weather, and delivery windows to reduce costs by up to 30%.",
      button1: "SEE ANALYTICS",
      button2: "GET STARTED"
    },
    {
      image: image3,
      title: "Smart Inventory Management",
      description: "Automated warehouse tracking with IoT sensors and barcode scanning for seamless inventory control across your supply chain.",
      button1: "EXPLORE FEATURES",
      button2: "CONTACT SALES"
    },
     {
      image: image5,
      title: "Smart Inventory Management",
      description: "Automated warehouse tracking with IoT sensors and barcode scanning for seamless inventory control across your supply chain.",
      button1: "EXPLORE FEATURES",
      button2: "CONTACT SALES"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Slider */}
          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ))}
          </div>

          {/* Content Slider */}
          <div className="relative h-80 md:h-96">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-center ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                    {slide.button1}
                  </button>
                  <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all">
                    {slide.button2}
                  </button>
                </div>
              </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeIndex === index ? "bg-blue-600 w-6" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Branding Section */}
      {/* <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            SMART LOGISTICS MANAGEMENT SYSTEM
          </h3>
          <p className="text-xl text-gray-600 mb-6">
            "Transforming logistics operations through IoT, AI, and real-time data analytics for unprecedented efficiency"
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="bg-blue-50 px-6 py-4 rounded-lg">
              <p className="font-semibold text-blue-700">Fleet Tracking</p>
            </div>
            <div className="bg-blue-50 px-6 py-4 rounded-lg">
              <p className="font-semibold text-blue-700">Route Optimization</p>
            </div>
            <div className="bg-blue-50 px-6 py-4 rounded-lg">
              <p className="font-semibold text-blue-700">Inventory Control</p>
            </div>
            <div className="bg-blue-50 px-6 py-4 rounded-lg">
              <p className="font-semibold text-blue-700">Data Analytics</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Hero;