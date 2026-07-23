'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { API_URL } from '@/src/API';
import { 
  FiFileText, 
  FiEye, 
  FiUsers,
  FiTrendingUp, 
  FiPlusCircle, 
  FiRadio, 
  FiUploadCloud,
  FiVideo,
  FiImage,
  FiZap,
  FiBarChart2,
  FiDollarSign,
  FiMessageSquare,
  FiAlertCircle,
  FiTag,
  FiFilter
} from 'react-icons/fi';

export default function MainDashBoard({ accessList = [] }) {
  // 1. डेट फ़िल्टर स्टेट (Default: 2026-07-01 to 2026-07-31)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 2. एपीआई डेटा और लोडिंग स्टेट
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. API से डैशबोर्ड डेटा फेच करना
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/dashboard?date=${startDate},${endDate}`
      );
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const dashboardCards = [
    {
      title: "कुल आर्टिकल्स",
      key: "upload",
      icon: FiUploadCloud,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "टॉप स्टोरीज",
      key: "topStories",
      icon: FiTrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "ब्रेकिंग न्यूज़",
      key: "breakingNews",
      icon: FiZap,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      title: "यूजर्स",
      key: "users",
      icon: FiUsers,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Flash News",
      key: "flashNews",
      icon: FiAlertCircle,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      title: "Categories",
      key: "categories",
      icon: FiTag,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Comments",
      key: "comments",
      icon: FiMessageSquare,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      title: "Live",
      key: "live",
      icon: FiRadio,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      title: "Photos",
      key: "photos",
      icon: FiImage,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Videos",
      key: "videos",
      icon: FiVideo,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      title: "Polls",
      key: "polls",
      icon: FiBarChart2,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Ads",
      key: "ads",
      icon: FiDollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      title: "Reports",
      key: "reports",
      icon: FiFileText,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      title: "Stories",
      key: "stories",
      icon: FiEye,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      title: "Sub Categories",
      key: "subCategories",
      icon: FiFilter,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#131C31] p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <span className="inline-block px-3 py-1 bg-[#D90429]/10 border border-[#D90429]/30 text-[#D90429] text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            लोकसत्य न्यूज़ पोर्टल
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            मुख्य एडमिन डैशबोर्ड
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            वेबसाइट का हालिया ओवरव्यू, स्टैट्स और त्वरित लिंक प्रबंधन
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {accessList.includes('upload') && (
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-2 px-5 py-3 bg-[#D90429] hover:bg-[#b80322] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#D90429]/25 uppercase tracking-wider"
            >
              <FiPlusCircle size={18} />
              <span>नई खबर पोस्ट करें</span>
            </Link>
          )}
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-[#131C31] p-4 rounded-2xl border border-slate-800">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <FiFilter size={16} className="text-[#D90429]" />
            <span>डेटा फ़िल्टर करें (Date Range):</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[#0B1120] border border-slate-800 px-3 py-1.5 rounded-xl">
              <label className="text-xs text-slate-400 font-medium">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white text-xs py-1 px-1 text-black border border-slate-700 rounded-lg date-input"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#0B1120] border border-slate-800 px-3 py-1.5 rounded-xl">
              <label className="text-xs text-slate-400 font-medium">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-xs py-1 px-1 text-black border border-slate-700 rounded-lg date-input"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all border border-slate-700"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Stats Grid from API Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="bg-[#131C31] p-5 rounded-2xl border border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </p>

                <h3 className="text-2xl font-black text-white mt-2">
                  {loading ? "..." : stats?.[item.key]?.activeCount ?? 0}
                </h3>

                <div className="mt-1 text-[10px] space-y-1">
                  <div className="text-emerald-400 font-semibold">
                    Today : {stats?.[item.key]?.todayData ?? 0}
                  </div>

                  <div className="text-slate-400">
                    Inactive : {stats?.[item.key]?.inactiveCount ?? 0}
                  </div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${item.bg} ${item.border} ${item.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}