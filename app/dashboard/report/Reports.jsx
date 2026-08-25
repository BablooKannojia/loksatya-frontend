'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import { FiAlertCircle, FiFlag } from "react-icons/fi";

const Report = ({ isAdmin }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/report`);
      const reportList = Array.isArray(res.data) ? res.data : [];
      setData(reportList);
      setFilteredData(reportList);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Live search filter
  useEffect(() => {
    let updatedList = [...data];

    if (searchValue.trim() !== "") {
      const query = searchValue.toLowerCase();
      updatedList = updatedList.filter(
        (item) =>
          item.question?.toLowerCase().includes(query) ||
          item._id?.toLowerCase().includes(query) ||
          item.userId?.toLowerCase().includes(query) ||
          item.articleId?.toLowerCase().includes(query)
      );
    }

    setFilteredData(updatedList);
  }, [searchValue, data, filterType]);

  return (
    <div className="p-8 bg-[#0a0f1d] min-h-screen text-slate-100 font-sans">
      {/* Title Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
          <FiFlag size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            User Reports Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            View, search, and manage reported questions and article feedback.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Filter Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Filter By Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="all">All Reports</option>
              <option value="recent">By User ID</option>
            </select>
          </div>

          {/* Search Input Box */}
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Search Name / ID
            </label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex gap-3 md:mt-6">
            <button
              onClick={fetchReports}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-lg shadow-emerald-950/40 text-sm flex items-center justify-center gap-2"
            >
              <span>+ Refresh</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        {/* Table Top Counter Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-slate-200">
            Total Items ({filteredData.length})
          </span>
          <span className="text-xs text-slate-500">
            Page 1 of 1
          </span>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading reports...
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[50vh]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                  <th className="px-6 py-4 w-[140px]">ID</th>
                  <th className="px-6 py-4 w-[140px]">USER ID</th>
                  <th className="px-6 py-4 w-[140px]">ARTICLE ID</th>
                  <th className="px-6 py-4">QUESTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* ID */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-xs text-slate-400 block w-[110px] truncate"
                          title={row._id}
                        >
                          {row._id}
                        </span>
                      </td>

                      {/* User ID */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-xs text-slate-400 block w-[110px] truncate"
                          title={row.userId}
                        >
                          {row.userId}
                        </span>
                      </td>

                      {/* Article ID */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-xs text-slate-400 block w-[110px] truncate"
                          title={row.articleId}
                        >
                          {row.articleId}
                        </span>
                      </td>

                      {/* Question */}
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {row.question}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16 text-slate-500 font-medium"
                    >
                      No report items available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;