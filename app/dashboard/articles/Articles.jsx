"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import { API_URL } from "../../../src/API";

import { 
  FiSearch, FiCalendar, FiFilter, FiRefreshCw, FiEdit2, 
  FiTrash2, FiAlertTriangle, FiImage, FiVideo, FiCheckCircle, 
  FiXCircle, FiClock, FiX, FiChevronDown, FiChevronUp, FiTag, FiUser
} from "react-icons/fi";

const defaultFilterObject = {
  dateStart: "",
  dateEnd: "",
  newsType: "all",
  type: "all",
  search: "",
  category: "",
  keyword: "",
  id: "",
  reportedBy: "",
  publishBy: "",
  subCategory: "",
};

const Articles = () => {
  const router = useRouter();
  const { setOnEdit, setId } = useContext(onEditContext);

  // States
  const [articleData, setArticleData] = useState([]);
  const [filterItemResponse, setFilterItemResponse] = useState(defaultFilterObject);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalReportedOpen, setIsModalReportedOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  // --- API Handlers ---
  const handleSetFixedPosition = async (articleId, position) => {
    try {
      await axios.put(`${API_URL}/article/fixed/set`, { articleId, position });
      showToast(`Set to position ${position}`);
      getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to set position", "error");
    }
  };

  const handleClearFixedPosition = async (position) => {
    try {
      await axios.put(`${API_URL}/article/fixed/clear`, { position });
      showToast(`Position ${position} cleared`);
      getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to clear position", "error");
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
        if (userId) {
          const response = await axios.get(`${API_URL}/user?id=${userId}`);
          const data = response.data.data || response.data;
          setIsAdmin(data[0]?.role === "admin");
        }
      } catch (error) { console.error(error); }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/content?type=category`);
        const catList = response.data.data || response.data || [];
        const validCategories = catList
          .map((item) => item.text ? item.text.trim() : "")
          .filter((text) => text !== "");
        setCategoryOptions([...new Set(validCategories)]);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (filterItemResponse.category) {
        try {
          const response = await axios.get(`${API_URL}/subcategory?category=${filterItemResponse.category}`);
          const subList = response.data.data || response.data || [];
          const validSub = subList
            .map((item) => item.text ? item.text.trim() : "")
            .filter((text) => text !== "");
          setSubCategoryOptions([...new Set(validSub)]);
        } catch (err) { console.error(err); }
      }
    };
    fetchSubCategories();
  }, [filterItemResponse.category]);

  const getAllArticles = async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    try {
      const filterParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          if (key === "dateStart" || key === "dateEnd") {
            if (filters.dateStart && filters.dateEnd) {
              filterParams.append("date", `${filters.dateStart},${filters.dateEnd}`);
            }
          } else {
            filterParams.append(key, value);
          }
        }
      });
      filterParams.append("page", page);
      filterParams.append("limit", limit);

      const response = await axios.get(`${API_URL}/article?${filterParams}&pagenation=true`);
      const processed = processArticles(response.data.data || []);
      setArticleData(processed);
      setPagination({ current: page, pageSize: limit, total: response.data.total || 0 });
    } catch (error) {
      showToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  const processArticles = (articles) => {
    const sorted = articles.sort((a, b) => (a.sequence || 999) - (b.sequence || 999));
    const processed = sorted.map((article) => {
      if (article.publishAt && new Date(article.publishAt) <= new Date() && article.status !== "online") {
        return { ...article, status: "online" };
      }
      return article;
    });
    return processed.sort((a, b) => {
      const aIsScheduled = a.publishAt && new Date(a.publishAt) > new Date();
      const bIsScheduled = b.publishAt && new Date(b.publishAt) > new Date();
      if (aIsScheduled && !bIsScheduled) return -1;
      if (!aIsScheduled && bIsScheduled) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  useEffect(() => {
    getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
  }, []);

  const handleToggleStatus = async (articleId, currentStatus) => {
    const newStatus = currentStatus === "online" ? "offline" : "online";
    try {
      await axios.put(`${API_URL}/article/${articleId}`, { status: newStatus, publishAt: null });
      showToast(`Status set to ${newStatus.toUpperCase()}`);
      getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const onFilter = () => getAllArticles(1, pagination.pageSize, filterItemResponse);
  const onResetFilter = () => {
    setFilterItemResponse(defaultFilterObject);
    getAllArticles(1, pagination.pageSize, defaultFilterObject);
  };

  const OnDelete = async () => {
    try {
      await axios.delete(`${API_URL}/article?id=${currentUser._id}`);
      showToast("Article Deleted");
      setIsModalDeleteOpen(false);
      setCurrentUser(null);
      getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
    } catch (err) {
      showToast("Failed to delete", "error");
      setIsModalDeleteOpen(false);
    }
  };

  const OnReported = async () => {
    try {
      await axios.post(`${API_URL}/report`, {
        adminId: localStorage.getItem("id"),
        userId: currentUser.UserID,
        articleId: currentUser._id,
        question: question,
      });
      showToast("Article Reported");
      setIsModalReportedOpen(false);
      setQuestion("");
    } catch (err) {
      showToast("Failed to report", "error");
      setIsModalReportedOpen(false);
    }
  };

  const uniquePublishBy = [...new Set(articleData.map((item) => item.publishBy).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 p-3 md:p-5 font-sans transition-colors duration-300">
      
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Articles Manager</h1>
        <button onClick={() => getAllArticles(pagination.current, pagination.pageSize, filterItemResponse)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* --- FILTER SECTION (COLLAPSED BY DEFAULT) --- */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-4 transition-all duration-300">
        <div 
          onClick={() => setIsFilterOpen(!isFilterOpen)} 
          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl select-none"
        >
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold text-xs">
            <FiFilter size={14} className="text-indigo-500" />
            <span>Advanced Filters</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md">
            {isFilterOpen ? <><FiChevronUp size={14} /> Hide</> : <><FiChevronDown size={14} /> Show Filters</>}
          </div>
        </div>
        
        {isFilterOpen && (
          <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Start Date</label>
                <input type="date" className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.dateStart} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, dateStart: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">End Date</label>
                <input type="date" className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.dateEnd} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, dateEnd: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Headline Search</label>
                <input type="text" placeholder="Headline..." className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.search} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, search: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Published By</label>
                <select className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.publishBy} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, publishBy: e.target.value })}>
                  <option value="">All Publishers</option>
                  {uniquePublishBy.map((pub, i) => <option key={i} value={pub}>{pub}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">News Type</label>
                <select className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.newsType} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, newsType: e.target.value })}>
                  <option value="all">All</option>
                  <option value="breakingNews">Breaking News</option>
                  <option value="topStories">Top Stories</option>
                  <option value="upload">Upload</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Category</label>
                <select className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.category} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, category: e.target.value, subCategory: "" })}>
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tags/Keywords</label>
                <input type="text" placeholder="Tags..." className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-xs dark:text-white" value={filterItemResponse.keyword} onChange={(e) => setFilterItemResponse({ ...filterItemResponse, keyword: e.target.value })} />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={onFilter} className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold">Apply</button>
                <button onClick={onResetFilter} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-semibold">Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- COMPACT TABLE (NO HORIZONTAL SCROLL) --- */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="w-[32%] px-3 py-2.5">Article Details</th>
              <th className="w-[8%] px-2 py-2.5 text-center">Media</th>
              <th className="w-[12%] px-2 py-2.5 text-center">Position</th>
              <th className="w-[12%] px-2 py-2.5 text-center">Status</th>
              <th className="w-[14%] px-2 py-2.5">Category / Type</th>
              <th className="w-[12%] px-2 py-2.5">Publisher / Tags</th>
              <th className="w-[10%] px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  <FiRefreshCw className="animate-spin mx-auto mb-1 text-indigo-500" size={18} />
                  Loading...
                </td>
              </tr>
            ) : articleData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  No articles found.
                </td>
              </tr>
            ) : (
              articleData.map((article) => {
                const isScheduled = article.publishAt && new Date(article.publishAt) > new Date();
                const isOnline = article.status === "online";

                return (
                  <tr key={article._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* 1. Article Details (Headline + ID + Date) */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-xs" title={article.title}>
                          {article.title || "-"}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>ID: {article._id ? article._id.slice(-6) : "-"}</span>
                          <span>•</span>
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Media */}
                    <td className="px-2 py-2.5 text-center">
                      <div className="inline-block relative w-8 h-8 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 vertical-middle">
                        {article.type === "vid" ? (
                          <div className="flex items-center justify-center w-full h-full"><FiVideo size={14} className="text-slate-400" /></div>
                        ) : (
                          <img src={article.image || "/placeholder.png"} alt="Thumb" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(article.image)} />
                        )}
                      </div>
                    </td>

                    {/* 3. Position */}
                    <td className="px-2 py-2.5 text-center">
                      {isAdmin ? (
                        <div className="flex justify-center items-center gap-1">
                          <button onClick={() => handleSetFixedPosition(article._id, 1)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${article.fixedPosition === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>1st</button>
                          <button onClick={() => handleSetFixedPosition(article._id, 2)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${article.fixedPosition === 2 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>2nd</button>
                          {[1, 2].includes(article.fixedPosition) && <button onClick={() => handleClearFixedPosition(article.fixedPosition)} className="text-[9px] text-red-500 font-bold">X</button>}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">{article.fixedPosition ? `Pos ${article.fixedPosition}` : "-"}</span>
                      )}
                    </td>

                    {/* 4. Status + Online/Offline Toggle */}
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {isScheduled ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Scheduled</span>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        )}
                        {!isScheduled && (
                          <button onClick={() => handleToggleStatus(article._id, article.status)} className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                            Toggle
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 5. Category / News Type */}
                    <td className="px-2 py-2.5">
                      <div className="flex flex-col items-start gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 truncate max-w-full">
                          {article.topic || "General"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-full">
                          {article.newsType || "Standard"}
                        </span>
                      </div>
                    </td>

                    {/* 6. Publisher / Tags */}
                    <td className="px-2 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300 truncate">
                          {article.publishBy || "Admin"}
                        </span>
                        <div className="text-[10px] text-slate-400 truncate">
                          {Array.isArray(article.keyWord) && article.keyWord.length > 0 ? `#${article.keyWord.join(", #")}` : "-"}
                        </div>
                      </div>
                    </td>

                    {/* 7. Actions */}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setOnEdit(true); setId(article._id); router.push("/dashboard/upload?edit=true"); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded" title="Edit">
                          <FiEdit2 size={13} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => { setCurrentUser(article); setIsModalReportedOpen(true); }} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Report">
                            <FiAlertTriangle size={13} />
                          </button>
                        )}
                        <button onClick={() => { setCurrentUser(article); setIsModalDeleteOpen(true); }} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Delete">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* --- Pagination --- */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]">
          <span className="text-[11px] text-slate-500">
            Total: <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span>
          </span>
          <div className="flex gap-1">
            <button disabled={pagination.current === 1} onClick={() => getAllArticles(pagination.current - 1, pagination.pageSize, filterItemResponse)} className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40">
              Prev
            </button>
            <span className="px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-white">{pagination.current}</span>
            <button disabled={pagination.current * pagination.pageSize >= pagination.total} onClick={() => getAllArticles(pagination.current + 1, pagination.pageSize, filterItemResponse)} className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {isModalDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 max-w-xs w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Delete Article?</h3>
            <p className="text-xs text-slate-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsModalDeleteOpen(false)} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold">Cancel</button>
              <button onClick={OnDelete} className="flex-1 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isModalReportedOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 max-w-sm w-full shadow-xl">
            <div className="flex justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><FiAlertTriangle className="text-amber-500" /> Report</h3>
              <button onClick={() => setIsModalReportedOpen(false)}><FiXCircle size={16} className="text-slate-400" /></button>
            </div>
            <textarea className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded p-2.5 text-xs text-slate-800 dark:text-white resize-none" rows={3} placeholder="Reason..." value={question} onChange={(e) => setQuestion(e.target.value)} />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setIsModalReportedOpen(false)} className="px-3 py-1.5 text-slate-500 text-xs font-semibold">Cancel</button>
              <button onClick={OnReported} className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-semibold">Submit</button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl max-h-[85vh] w-full">
            <button className="absolute -top-8 right-0 text-white/70 hover:text-white" onClick={() => setPreviewImage(null)}><FiX size={20} /></button>
            <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

    </div>
  );
};

export default Articles;