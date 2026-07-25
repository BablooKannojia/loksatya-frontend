'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import { 
  FiUploadCloud, 
  FiTrash2, 
  FiExternalLink, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiInfo,
  FiPlus
} from "react-icons/fi";

const Ads = () => {
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [userData, setUserData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [side, setSide] = useState("");
  const [device, setDevice] = useState("mobile");

  const [noOfImpression, setNoOfImpression] = useState("");
  const [impression, setImpression] = useState(0);

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
  };

  useEffect(() => {
    setImpression((prevImpression) => prevImpression + 1);
  }, []);

  const fetchAds = async () => {
    try {
      const response = await axios.get(`${API_URL}/ads`);
      if (response.data && Array.isArray(response.data)) {
        const reversedData = [...response.data].reverse();
        setUserData(reversedData);
        if (reversedData.length > 0 && reversedData[0]?.noOfImpression) {
          setNoOfImpression(reversedData[0].noOfImpression);
        }
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImg(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const onUpload = async () => {
    if (!img) {
      showToast("Please select an ad image first.", "warning");
      return;
    }

    if (!startDate || !endDate) {
      showToast("Please select a valid start and end date.", "warning");
      return;
    }

    setLoading(true);
    let formdata = new FormData();
    formdata.append("file", img, img.name);

    try {
      // 1. Image Upload
      const imageRes = await axios.post(`${API_URL}/image`, formdata);
      
      const userId = typeof window !== "undefined" ? localStorage.getItem("id") : "";

      // 2. Post Ad Details
      await axios.post(`${API_URL}/ads?id=${userId}`, {
        imgLink: imageRes.data?.image,
        link: link,
        slugName: title,
        device: device,
        noOfImpression: impression,
        StartAt: startDate,
        EndAt: endDate,
        side,
      });

      showToast("Your Ad was successfully Uploaded", "success");
      
      // Reset Form
      setImg(null);
      setImgPreview(null);
      setLink("");
      setTitle("");
      setStartDate("");
      setEndDate("");
      setSide("");
      fetchAds();
    } catch (err) {
      showToast("Your Ad was not successfully Uploaded", "error");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/ads_delete/${id}`);

      if (res.data?.data?.status === 200) {
        showToast(res.data.message || "Ad deleted successfully", "success");
      } else {
        showToast(res.data?.message || "Failed to delete Ad", "error");
      }
      fetchAds();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Error deleting ad", "error");
    }
  };

  const handleToggleStatus = async (adId, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await axios.put(`${API_URL}/ads/${adId}`, { active: newStatus });
      showToast("Status Changed", "success");
      fetchAds();
    } catch (error) {
      console.error(error);
      showToast("Failed to update status", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const fullDate = new Date(dateString);
    return isNaN(fullDate.getTime())
      ? "N/A"
      : fullDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <div className="p-4 md:p-6 w-full font-sans text-slate-200 bg-[#090d16] min-h-screen box-border overflow-x-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#121c2d] border border-slate-700 text-white shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3 text-sm font-medium">
            {toast.type === "success" && <FiCheckCircle className="text-emerald-400 text-lg" />}
            {toast.type === "error" && <FiAlertCircle className="text-rose-500 text-lg" />}
            {toast.type === "warning" && <FiAlertCircle className="text-amber-400 text-lg" />}
            {toast.type === "info" && <FiInfo className="text-cyan-400 text-lg" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-[#0f172a] rounded-2xl p-3 shadow-2xl border border-slate-800">
            <img
              src={previewImage}
              alt="Ad Large Preview"
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
            />
            <button
              className="absolute -top-3 -right-3 bg-slate-800 text-slate-300 shadow-lg border border-slate-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#00f2fe] tracking-tight">
          Advertisement Management
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Create, position, track, and monitor active promotional ad campaigns.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[#0e1626] border border-[#1b2a45] rounded-xl p-4 md:p-6 mb-6 shadow-xl w-full box-border">
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left: Upload Box */}
          <div className="w-full xl:w-64 shrink-0">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ad Image Banner
            </label>
            <input
              type="file"
              id="ad-banner-input"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div
              onClick={() => document.getElementById("ad-banner-input")?.click()}
              className="w-full h-40 bg-[#090d16] border-2 border-dashed border-slate-700 hover:border-[#00d2ff] rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group"
            >
              {!imgPreview ? (
                <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-[#00d2ff] transition-colors p-3 text-center">
                  <FiUploadCloud size={28} />
                  <span className="text-xs font-medium text-slate-400">Click to upload banner image</span>
                </div>
              ) : (
                <img
                  className="w-full h-full object-cover"
                  src={imgPreview}
                  alt="Ad Preview"
                />
              )}
            </div>
          </div>

          {/* Right: Inputs & Action Button */}
          <div className="grow flex flex-col justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Link
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Title / Slug
                </label>
                <input
                  type="text"
                  placeholder="Enter Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Device
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-[#00d2ff] cursor-pointer transition-all"
                >
                  <option value="mobile" className="bg-[#090d16]">Mobile</option>
                  <option value="laptop" className="bg-[#090d16]">Laptop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-[#00d2ff] transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-[#00d2ff] transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Position
                </label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-[#00d2ff] cursor-pointer transition-all"
                >
                  <option value="" disabled className="bg-[#090d16]">
                    Select Position
                  </option>
                  <option value="top" className="bg-[#090d16]">Top</option>
                  <option value="mid" className="bg-[#090d16]">Middle</option>
                  <option value="bottom" className="bg-[#090d16]">Bottom</option>
                  <option value="popup" className="bg-[#090d16]">Popup</option>
                </select>
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={onUpload}
                disabled={loading}
                className="px-5 py-2.5 bg-[#00d2ff] hover:bg-[#00c0eb] active:bg-[#00aed6] text-[#050b14] font-bold rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <FiPlus size={16} />
                {loading ? "Uploading..." : "Add Ad"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#0e1626] border border-[#1b2a45] rounded-xl shadow-xl overflow-hidden w-full">
        <div className="p-4 border-b border-[#1b2a45]">
          <h2 className="text-sm md:text-base font-bold text-white tracking-wide">
            Total Advertisements ({userData.length})
          </h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-[#1b2a45] text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#0b111e]">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">IMPRESSIONS</th>
                <th className="py-3 px-3">IMAGE</th>
                <th className="py-3 px-3">TITLE</th>
                <th className="py-3 px-3">TARGET LINK</th>
                <th className="py-3 px-3">CLICKS</th>
                <th className="py-3 px-3">START DATE</th>
                <th className="py-3 px-3">END DATE</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a45]/60 text-xs md:text-sm">
              {userData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500 font-medium">
                    No advertisements found.
                  </td>
                </tr>
              ) : (
                userData.map((ad) => (
                  <tr key={ad._id} className="hover:bg-[#121c2d] transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-400">
                      {ad._id?.slice(-6) || ad._id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {ad.noOfImpression ?? 0}
                    </td>
                    <td className="py-3 px-3">
                      {ad.imgLink ? (
                        <img
                          src={ad.imgLink}
                          alt="Ad Banner"
                          onClick={() => setPreviewImage(ad.imgLink)}
                          className="w-12 h-8 object-cover rounded border border-slate-700 cursor-pointer hover:border-[#00d2ff] transition-all"
                        />
                      ) : (
                        <span className="text-xs text-slate-500 italic">No Image</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200 max-w-[130px] truncate">
                      {ad.slugName || "—"}
                    </td>
                    <td className="py-3 px-3">
                      {ad.link ? (
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00d2ff] hover:underline inline-flex items-center gap-1 max-w-[130px] truncate text-xs"
                        >
                          <span className="truncate">{ad.link}</span>
                          <FiExternalLink size={11} className="shrink-0" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{ad.noAds ?? 0}</td>
                    <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(ad.StartAt)}</td>
                    <td className="py-3 px-3 text-slate-400 text-xs">{formatDate(ad.EndAt)}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            ad.active
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                              : "bg-rose-950/80 text-rose-400 border border-rose-800"
                          }`}
                        >
                          {ad.active ? "ONLINE" : "OFFLINE"}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(ad._id, ad.active)}
                          className="text-[10px] text-[#00d2ff] hover:underline cursor-pointer"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeleteAd(ad._id)}
                        className="px-2.5 py-1 border border-rose-600/80 text-rose-500 hover:bg-rose-600 hover:text-white text-xs font-semibold rounded flex items-center justify-center gap-1 mx-auto transition-all cursor-pointer"
                      >
                        <FiTrash2 size={12} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ads;