/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ChartBar,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Car,
  MapPin,

} from "lucide-react";
import {
  LineChart,
  BarChart,
  PieChart,
  Legend,
  Tooltip,

  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Label,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Line,
  Bar,
} from "recharts";

// Color palette for charts
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Light Green
  "#FF6B6B", // Red
  "#747EF7", // Indigo
  "#4ECDC4", // Teal
  "#F7B801", // Gold
];

const STATUS_COLORS = {
  active: "#10B981", // Green
  inactive: "#F87171", // Red
  pending: "#F59E0B", // Amber
  completed: "#3B82F6", // Blue
  inProgress: "#8B5CF6", // Purple
  canceled: "#6B7280", // Gray
  success: "#10B981", // Green
  failed: "#F87171", // Red
  error: "#EF4444", // Bright Red
};

function AdminDashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-500">Admin Dashboard</h1>
     
      </div>
  

    </div>
  );
}
export default AdminDashboard;
