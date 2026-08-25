"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import { API_URL } from "../../../src/API";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";

import {
    FiFilter, FiRefreshCw, FiEdit2,
    FiTrash2, FiAlertTriangle, FiVideo, FiCheckCircle,
    FiXCircle, FiX, FiChevronDown, FiChevronUp, FiExternalLink,
    FiFileText,
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
    const [sliderArticles, setSliderArticles] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [permissions, setPermisiions] = useState([]);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 16, total: 0 });

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

    const getSliderArticles = async () => {
        const res = await axios.get(`${API_URL}/article/slider`);
        setSliderArticles(res.data.data);
    };

    useEffect(() => {
        getSliderArticles();
    }, []);

    const getSliderPosition = (articleId) => {
        const slider = sliderArticles.find(item => item._id === articleId);
        return slider ? slider.sliderOrder : "-";
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const dragged = sortedArticles[result.source.index];
        const droppedOn = sortedArticles[result.destination.index];
        const position = getSliderPosition(droppedOn._id);
        if (position === "-") return;
        try {
            await axios.put(`${API_URL}/article/slider/order`,
                {
                    id: dragged._id,
                    sliderOrder: position,
                },
                {
                    headers: {
                        userId: localStorage.getItem("id"),
                    },
                });
            getSliderArticles();
            getAllArticles(
                pagination.current,
                pagination.pageSize,
                filterItemResponse
            );
        } catch (err) {
            console.log(err);
        }
    };

    const sortedArticles = [...articleData].sort((a, b) => {
        const aSlider = sliderArticles.find(item => item._id === a._id);
        const bSlider = sliderArticles.find(item => item._id === b._id);

        // Dono slider me hain
        if (aSlider && bSlider) {
            return aSlider.sliderOrder - bSlider.sliderOrder;
        }

        // Sirf A slider hai -> upar
        if (aSlider) return -1;

        // Sirf B slider hai -> upar
        if (bSlider) return 1;

        // Baaki same order
        return 0;
    });

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
                    const users = response.data?.[0];
                    setIsAdmin(users?.role === "admin");
                    setPermisiions(users?.acsses || []);
                }
            } catch (error) { 
                console.error(error)
            }
        };
        fetchUserRole();
    }, []);

    const canDragSlider =
        isAdmin || permissions.includes("sliderorder");

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

    const getAllArticles = async (page = 1, limit = 16, filters = {}) => {
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

            const response = await axios.get(`${API_URL}/article?${filterParams}&pagenation=true&dashboard=true`);
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

    const getPublishers = async () => {
        try {
            const res = await axios.get(`${API_URL}/user`);

            const users = res.data.data || res.data || [];

            const emails = [
                ...new Set(
                    users
                        .map(user => user.email)
                        .filter(Boolean)
                ),
            ];

            setPublishers(emails);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllArticles(pagination.current, pagination.pageSize, filterItemResponse);
        getPublishers();
    }, []);

    // ⚠️ LiveNews rows is table me sirf DEKHNE/slider-set karne ke liye hain —
    // status/edit/delete sirf Article ke liye chalega, LiveNews ke liye Live News page use karo
    const handleToggleStatus = async (article) => {
        if (article.contentType === "liveNews") {
            showToast("Live News ka status sirf Live News page se badlo", "error");
            return;
        }
        const newStatus = article.status === "online" ? "offline" : "online";
        try {
            await axios.put(`${API_URL}/article/${article._id}`, { status: newStatus, publishAt: null });
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
        // Safety net: ye modal ab LiveNews rows ke liye khulta hi nahi (button disabled hai),
        // fir bhi ek extra check taaki galti se Article endpoint pe LiveNews id na chala jaaye
        if (currentUser?.contentType === "liveNews") {
            showToast("Live News sirf Live News page se delete karo", "error");
            setIsModalDeleteOpen(false);
            return;
        }
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

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 p-3 md:p-5 font-sans transition-colors duration-300">
            {toast.show && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
                    {toast.type === "error" ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* --- Header --- */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Articles Manager</h1>
                        <p className="text-sm text-slate-400 mt-2">
                            List your article or news, set slider, updates, status control.
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={() => getAllArticles(pagination.current, pagination.pageSize, filterItemResponse)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                    <FiRefreshCw size={13} /> Refresh
                </button>
            </div>

            {/* --- FILTER SECTION --- */}
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
                                    {publishers.map((pub, i) => (
                                        <option key={i} value={pub}>
                                            {pub}
                                        </option>
                                    ))}
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

            {/* --- TABLE SECTION --- */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="articles">
                        {(provided) => (
                            <table className="w-full text-left table-fixed">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="w-[34%] px-3 py-2.5">Article Details</th>
                                        <th className="w-[8%] px-2 py-2.5 text-center">Media</th>
                                        <th className="w-[10%] px-2 py-2.5 text-center">Status</th>
                                        <th className="w-[14%] px-2 py-2.5">Category / Type</th>
                                        <th className="w-[22%] px-2 py-2.5">Publisher / Tags</th>
                                        <th className="w-[12%] px-3 py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody
                                    className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                                                <FiRefreshCw className="animate-spin mx-auto mb-1 text-indigo-500" size={18} />
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : articleData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                                                No articles found.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedArticles.map((article, index) => {
                                            const isScheduled = article.publishAt && new Date(article.publishAt) > new Date();
                                            const isOnline = article.status === "online";
                                            const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1;

                                            return (
                                                <Draggable
                                                    key={article._id}
                                                    draggableId={article._id}
                                                    index={index}
                                                    isDragDisabled={!canDragSlider}
                                                >
                                                    {(provided, snapshot) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...(canDragSlider ? provided.dragHandleProps : {})}
                                                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${snapshot.isDragging ? "bg-indigo-50 dark:bg-slate-700 shadow-lg" : ""
                                                                }`}
                                                        >
                                                            {/* Article Details */}
                                                            <td className="px-3 py-2.5 overflow-hidden">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {article.contentType === "liveNews" && (
                                                                            <span
                                                                                title="Live News"
                                                                                className="flex items-center gap-1 bg-red-600/15 text-red-500 border border-red-600/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                                            >
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                                LIVE
                                                                            </span>
                                                                        )}
                                                                        {getSliderPosition(article._id) !== "-" && (
                                                                            <span
                                                                                title="Slider Position"
                                                                                className="flex items-center gap-1 bg-pink-600/15 text-pink-500 border border-pink-600/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                                            >
                                                                                Slider #{getSliderPosition(article._id)}
                                                                            </span>
                                                                        )}
                                                                        <span
                                                                            className="font-semibold text-slate-900 dark:text-white truncate text-xs"
                                                                            title={article.title}
                                                                        >
                                                                            {article.title || "-"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                                                        <span className="font-bold text-indigo-500 dark:text-indigo-400">
                                                                            #{serialNumber}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(article.createdAt)}</span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Media */}
                                                            <td className="px-2 py-2.5 text-center">
                                                                <div className="inline-block relative w-8 h-8 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                                    {article.type === "vid" ? (
                                                                        <div className="flex items-center justify-center w-full h-full text-slate-500">
                                                                            <FiVideo size={14} />
                                                                        </div>
                                                                    ) : (
                                                                        <img
                                                                            src={article.image || "/placeholder.png"}
                                                                            alt=""
                                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                                            onClick={() => setPreviewImage(article.image)}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-2 py-2.5 text-center">
                                                                {isScheduled ? (
                                                                    <span className="text-amber-500 text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                                        Scheduled
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggleStatus(article)}
                                                                        disabled={article.contentType === "liveNews"}
                                                                        title={article.contentType === "liveNews" ? "Live News page se badlo" : "Toggle status"}
                                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${isOnline
                                                                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                            : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"
                                                                            } ${article.contentType === "liveNews" ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                    >
                                                                        {isOnline ? "Online" : "Offline"}
                                                                    </button>
                                                                )}
                                                            </td>

                                                            {/* Category / Type */}
                                                            <td className="px-2 py-2.5 overflow-hidden">
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 rounded-md truncate max-w-full">
                                                                        {article.topic || article.category || "General"}
                                                                    </span>
                                                                    <span className="text-[11px] text-slate-400 capitalize truncate">
                                                                        {article.newsType || "upload"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Publisher / Tags (Gmail/Email ke niche Tag) */}
                                                            <td className="px-2 py-2.5 overflow-hidden">
                                                                <div className="flex flex-col gap-0.5">
                                                                    {/* Gmail/Publisher Name */}
                                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={article.publishBy || "Admin"}>
                                                                        {article.publishBy || "Admin"}
                                                                    </span>

                                                                    {/* Tag display directly under Gmail */}
                                                                    <span className="text-[11px] text-slate-400 truncate" title={article.keyWord || "#NoTag"}>
                                                                        {/* {tagDisplay || "#General"} */}
                                                                        {Array.isArray(article.keyWord) && article.keyWord.length > 0 ? `#${article.keyWord.join(", #")}` : "-"}

                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Actions*/}
                                                            <td className="px-3 py-2.5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {article.contentType === "liveNews" ? (
                                                                        // LiveNews yahan se edit/delete nahi hoti — sirf Live News
                                                                        // page pe le jaane wala link. Yahan se sirf slider order
                                                                        // (drag-drop) aur status dikhna allowed hai.
                                                                        <button
                                                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 rounded transition-colors"
                                                                            onClick={() => router.push("/dashboard/live-news")}
                                                                            title="Manage in Live News page"
                                                                        >
                                                                            <FiExternalLink size={13} />
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                                                                                onClick={() => {
                                                                                    setOnEdit(true);
                                                                                    setId(article._id);
                                                                                    router.push("/dashboard/upload?edit=true");
                                                                                }}
                                                                                title="Edit Article"
                                                                            >
                                                                                <FiEdit2 size={13} />
                                                                            </button>
                                                                            <button
                                                                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                                                                                onClick={() => {
                                                                                    setCurrentUser(article);
                                                                                    setIsModalDeleteOpen(true);
                                                                                }}
                                                                                title="Delete Article"
                                                                            >
                                                                                <FiTrash2 size={13} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            );
                                        })
                                    )}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]">
                    <span className="text-[11px] text-slate-500">
                        Total: <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span>
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={pagination.current === 1}
                            onClick={() => getAllArticles(pagination.current - 1, pagination.pageSize, filterItemResponse)}
                            className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Prev
                        </button>
                        <span className="px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-white">
                            {pagination.current}
                        </span>
                        <button
                            disabled={pagination.current * pagination.pageSize >= pagination.total}
                            onClick={() => getAllArticles(pagination.current + 1, pagination.pageSize, filterItemResponse)}
                            className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isModalDeleteOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 max-w-xs w-full shadow-xl">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Delete Article?</h3>
                        <p className="text-xs text-slate-500 mb-4">This action cannot be undone.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setIsModalDeleteOpen(false)} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold">Cancel</button>
                            <button onClick={OnDelete} className="flex-1 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors">Delete</button>
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
                            <button onClick={OnReported} className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors">Submit</button>
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