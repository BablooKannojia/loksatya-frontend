"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import { FiTag } from "react-icons/fi";

const TagsCategory = () => {
    const [userData, setUserData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [filterItem, setFilterItem] = useState("category");
    const [searchValue, setSearchValue] = useState("");

    const [cateGet, setCateGet] = useState([]);

    const [type, setType] = useState("tag");
    const [text, setText] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [selectedData, setSelectedData] = useState(null);
    const [editSequence, setEditSequence] = useState("");

    const [deleteItem, setDeleteItem] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState({ text: "", type: "" });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const notify = (text, type = "info") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage({ text: "", type: "" }), 3000);
    };

    const fetchData = useCallback(async () => {
        setTableLoading(true);
        try {
            let combinedData = [];
            let total = 0;
            let pages = 1;

            if (filterItem === "sub") {
                // Subcategory alag collection/endpoint me hai, isliye alag call
                const subRes = await axios.get(`${API_URL}/subcategory`);
                const rawSubData = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.data || []);
                combinedData = rawSubData.map((item) => ({
                    ...item,
                    type: item.type || "sub",
                }));

                if (searchValue.trim()) {
                    combinedData = combinedData.filter((item) =>
                        item.text?.toLowerCase().includes(searchValue.toLowerCase())
                    );
                }

                total = combinedData.length;
                pages = Math.ceil(total / pageSize) || 1;
                combinedData = combinedData.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                );
            } else if (filterItem === "all") {
                // All: content + subcategory dono fetch karo aur combine karo
                const [contentRes, subRes] = await Promise.all([
                    axios.get(`${API_URL}/content?page=1&limit=1000${searchValue.trim() ? `&search=${searchValue.trim()}` : ""}`),
                    axios.get(`${API_URL}/subcategory`),
                ]);

                const contentData = contentRes.data?.data || [];
                const rawSubData = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.data || []);
                let normalizedSubData = rawSubData.map((item) => ({
                    ...item,
                    type: item.type || "sub",
                }));

                if (searchValue.trim()) {
                    normalizedSubData = normalizedSubData.filter((item) =>
                        item.text?.toLowerCase().includes(searchValue.toLowerCase())
                    );
                }

                const allData = [...contentData, ...normalizedSubData];
                total = allData.length;
                pages = Math.ceil(total / pageSize) || 1;
                combinedData = allData.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                );
            } else {
                const params = new URLSearchParams();
                params.set("page", currentPage.toString());
                params.set("limit", pageSize.toString());
                params.set("type", filterItem);
                if (searchValue.trim()) params.set("search", searchValue.trim());

                const contentRes = await axios.get(`${API_URL}/content?${params.toString()}`);
                combinedData = contentRes.data?.data || [];
                total = contentRes.data?.pagination?.total || 0;
                pages = contentRes.data?.pagination?.totalPages || 1;
            }

            setUserData(combinedData);
            setFilteredData(combinedData);
            setTotalItems(total);
            setTotalPages(pages);
            const categoryRes = await axios.get(`${API_URL}/content?type=category&page=1&limit=1000`);
            const categories = categoryRes.data?.data || [];
            setCateGet(categories.map((item) => ({
                key: item._id, value: item.text, label: item.text,
            })));
        } catch (err) {
            console.error("Error fetching data:", err);
            notify("Failed to fetch tags and categories.", "error");
            setUserData([]);
            setFilteredData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setTableLoading(false);
        }
    }, [currentPage, filterItem, searchValue]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetAddForm = () => {
        setText("");
        setType("tag");
        setSubCategory("");
        setIsModalOpen(false);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchData();
    };

    const onAdd = async () => {
        if (!text.trim()) {
            notify("Please enter a name!", "warning");
            return;
        }

        setLoading(true);
        try {
            const adminId = localStorage.getItem("id");

            if (type !== "sub") {
                await axios.post(`${API_URL}/content?id=${adminId}`, {
                    type,
                    text,
                    ...(type === "category" && { sequence: userData?.length + 1 }),
                });
            } else {
                if (!subCategory) {
                    notify("Please select a parent category!", "warning");
                    setLoading(false);
                    return;
                }
                await axios.post(`${API_URL}/subcategory`, {
                    adminId,
                    category: subCategory,
                    text,
                });
            }

            notify("Successfully Added!", "success");
            resetAddForm();
            fetchData();
        } catch (err) {
            console.error("Add Error:", err);
            notify(err.response?.data?.message || "Error adding item", "error");
        } finally {
            setLoading(false);
        }
    };

    const onEditSequence = async () => {
        if (!editSequence) {
            notify("Please enter a sequence number", "warning");
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/content`, {
                id: selectedData?._id,
                sequence: editSequence,
            });

            notify("Sequence updated successfully!", "success");
            setIsEditModalOpen(false);
            setSelectedData(null);
            fetchData();
        } catch (err) {
            console.error("Edit Sequence Error:", err);
            notify(err.response?.data?.err || "Failed to update sequence", "error");
        } finally {
            setLoading(false);
        }
    };

    // Delete Handler
    const handleDelete = async () => {
        if (!deleteItem) return;

        setLoading(true);
        try {
            const isSub = deleteItem.type === "sub";

            const res = isSub
                ? await axios.delete(`${API_URL}/subcategory/${deleteItem._id}`)
                : await axios.delete(`${API_URL}/delete_content/${deleteItem._id}`);

            if (res.data?.status === 200 || res.status === 200) {
                notify(res.data?.message || "Deleted successfully!", "success");
                fetchData();
            } else {
                notify(res.data?.message || "Failed to delete item", "error");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            notify(error?.response?.data?.message || "Error deleting item", "error");
        } finally {
            setLoading(false);
            setDeleteItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
            {toastMessage.text && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md text-white text-sm font-semibold flex items-center gap-2 border transition-all animate-bounce ${toastMessage.type === "error"
                        ? "bg-rose-600/90 border-rose-500/50"
                        : toastMessage.type === "warning"
                            ? "bg-amber-500/90 border-amber-400/50"
                            : "bg-emerald-600/90 border-emerald-500/50"
                        }`}
                >
                    {toastMessage.text}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
                    <FiTag size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Tags & Category Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Organize content tags, categories, sub-categories, and manage sequences.
                    </p>
                </div>
            </div>

            {/* Control / Filter Bar */}
            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Dropdown Filter */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Filter By Type
                        </label>
                        <select
                            value={filterItem}
                            onChange={(e) => {
                                setFilterItem(e.target.value);
                                if (e.target.value === "all") {
                                    setFilteredData(userData);
                                }
                            }}
                            className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all font-medium"
                        >
                            <option value="all">All Types</option>
                            <option value="tag">By Tag</option>
                            <option value="category">By Category</option>
                            <option value="sub">By SubCategory</option>
                        </select>
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Search Name
                        </label>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                            className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                        />
                    </div>

                    <div className="md:col-span-4 flex items-end gap-2 mt-2 md:mt-0 pt-5">
                        <button
                            onClick={handleFilter}
                            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-600/50"
                        >
                            Filter
                        </button>
                        <button
                            onClick={() => {
                                setSearchValue("");
                                setFilteredData(userData);
                                setIsModalOpen(true);
                            }}
                            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1"
                        >
                            <span className="text-lg leading-none">+</span> Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-base font-bold text-slate-200">
                        Total Items ({filteredData.length})
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-700">
                                <th className="py-3.5 px-4">ID</th>
                                <th className="py-3.5 px-4 text-center">Sequence</th>
                                <th className="py-3.5 px-4">Name</th>
                                <th className="py-3.5 px-4">
                                    {filterItem !== "sub" ? "Type" : "Category"}
                                </th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm">
                            {tableLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-400">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                            Loading tags and categories...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-500">
                                        No matching records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record) => (
                                    <tr
                                        key={record._id}
                                        className="hover:bg-slate-700/30 transition-colors"
                                    >
                                        {/* ID */}
                                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs max-w-[120px] truncate">
                                            {record._id}
                                        </td>

                                        {/* Sequence */}
                                        <td className="py-3.5 px-4 text-center">
                                            {record.type === "category" ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="font-semibold text-slate-200">
                                                        {record.sequence ?? "-"}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedData(record);
                                                            setEditSequence(record.sequence || "");
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4 text-slate-100 font-medium">
                                            {record.text}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${record.type === "category"
                                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                                    : record.type === "sub"
                                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                                    }`}
                                            >
                                                {record.type === "sub"
                                                    ? (record.category || "Category")
                                                    : record.type}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => setDeleteItem(record)}
                                                className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/50 hover:bg-rose-900/60 rounded-lg transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || tableLoading}
                        className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>

                    <span className="text-xs text-slate-400">
                        Page <strong className="text-slate-200">{currentPage}</strong> of{" "}
                        <strong className="text-slate-200">{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || tableLoading}
                        className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        <h3 className="text-lg font-bold text-slate-100">
                            Add Tag or Category
                        </h3>

                        <div className="space-y-4">
                            {/* Type Select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                                >
                                    <option value="tag">Tag</option>
                                    <option value="category">Category</option>
                                    <option value="sub">Sub Category</option>
                                </select>
                            </div>

                            {/* SubCategory Parent Select */}
                            {type === "sub" && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Select Parent Category
                                    </label>
                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {cateGet.map((cat) => (
                                            <option key={cat.key} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Name Input */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={resetAddForm}
                                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onAdd}
                                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                            >
                                {loading && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                Save Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
                        <h3 className="text-lg font-bold text-slate-100">
                            Edit Category Sequence
                        </h3>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Sequence Number
                            </label>
                            <input
                                type="number"
                                placeholder="Enter sequence number..."
                                value={editSequence}
                                onChange={(e) => setEditSequence(e.target.value)}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedData(null);
                                }}
                                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onEditSequence}
                                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
                            >
                                {loading && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                Update Sequence
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-100">
                            Confirm Deletion
                        </h3>
                        <p className="text-sm text-slate-400">
                            Are you sure you want to delete{" "}
                            <strong className="text-slate-200">{deleteItem.text}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteItem(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleDelete}
                                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2"
                            >
                                {loading && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagsCategory;