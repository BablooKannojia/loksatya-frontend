'use client';

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../../src/API";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import { 
  FaTrashAlt, 
  FaCloudUploadAlt, 
  FaEdit, 
  FaRegTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const Photos = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");

  const { onEdit, setOnEdit, id, setId } = useContext(onEditContext);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(false);
  const [editPriority, setEditPriority] = useState(false);
  
  // Modals state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  // Filter states
  const [filterItem, setFilterItem] = useState("id");
  const [filterItemResponse, setFilterItemResponse] = useState("");

  // Data states
  const [allPhotos, setAllPhoto] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState({});
  const [imgTexts, setImgTexts] = useState({});
  const [imgUrl, setImgUrl] = useState({});

  const [loading, setLoading] = useState(false);
  const [imgs, setImgs] = useState([]);
  const [editImgs, setEditImgs] = useState([]);
  const [editPeriority, setEditPeriority] = useState(null);
  const [thumbnail, setThumbnail] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
  };

  useEffect(() => {
    if (!edit) {
      setId(null);
      setOnEdit(false);
    }
    if (onEdit && edit && id) {
      axios.get(`${API_URL}/photo?id=${id}`).then((res) => {
        const photosList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        let data = photosList[0];
        if (data) {
          setTitle(data.title || "");
          setEditImgs(data?.images || []);
          setEditPriority(data?.periority || false);
          setEditPeriority(
            data?.images?.findIndex((img) => img.albumPeriority)
          );
        }
      }).catch((err) => console.error("Error fetching photo by ID:", err));
    }
  }, [onEdit, edit, id]);

  const fetchAllPhotos = async (page = currentPage, limit = itemsPerPage) => {
    try {
      const response = await fetch(
        `${API_URL}/photo?paginate=true&page=${page}&limit=${limit}`
      );
      const result = await response.json();
      const photosArray = Array.isArray(result?.data) ? result.data : [];

      setAllPhoto(photosArray);

      if (result?.pagination) {
        setPagination(result.pagination);
        setCurrentPage(result.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching photo:", error);
      showToast("Failed to fetch photos. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchAllPhotos(1, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage]);

  const onFilter = () => {
    axios
      .get(
        `${API_URL}/photo?${filterItem}=${filterItemResponse}&paginate=true&page=1&limit=${itemsPerPage}`
      )
      .then((res) => {
        const photosArray = Array.isArray(res.data?.data) ? res.data.data : [];
        setAllPhoto(photosArray);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
          setCurrentPage(res.data.pagination.page);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast("Error in Filtering", "error");
      });
  };

  const onReset = () => {
    setFilterItem("id");
    setFilterItemResponse("");
    setCurrentPage(1);
    fetchAllPhotos(1, itemsPerPage);
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
    fetchAllPhotos(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchAllPhotos(1, newLimit);
  };

  useEffect(() => {
    const initialState = imgs.reduce((acc, _, index) => {
      acc[index] = false;
      return acc;
    }, {});
    setThumbnail(initialState);
  }, [imgs]);

  const handleThumbnailChange = (index) => {
    setThumbnail((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
      [index]: true,
    }));
  };

  const handleEditChange = (index) => {
    setEditPeriority(index);
    setEditImgs((prev) =>
      prev.map((item, i) => ({
        ...item,
        albumPeriority: i === index,
      }))
    );
  };

  // Remove newly selected image from file input list
  const removeNewImage = (indexToRemove) => {
    setImgs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    
    // Cleanup corresponding texts & urls
    setImgTexts((prev) => {
      const updated = { ...prev };
      delete updated[indexToRemove];
      return updated;
    });
    setImgUrl((prev) => {
      const updated = { ...prev };
      delete updated[indexToRemove];
      return updated;
    });
  };

  // Remove existing image from server edit list
  const RemoveImage = (imgUrl) => {
    setEditImgs((prev) => prev.filter((img) => img.img !== imgUrl));
  };

  const onUpload = async () => {
    try {
      setLoading(true);
      const imageUploadPromises = imgs.map(async (img) => {
        let formData = new FormData();
        formData.append("file", img, img.name);
        const imageResponse = await axios.post(`${API_URL}/image`, formData);
        return imageResponse.data.image;
      });
      const images = await Promise.all(imageUploadPromises);
      await axios.post(`${API_URL}/photo`, {
        title,
        image: images,
        imageTexts: imgTexts,
        url: imgUrl,
        albumPeriority: thumbnail,
        periority: priority,
      });

      showToast("Your Photo was successfully uploaded", "success");
      setIsVerifyModalOpen(false);
      fetchAllPhotos(1, itemsPerPage);
      setCurrentPage(1);
      setPriority(false);
      setTitle("");
      setImgs([]);
      setOnEdit(false);
      setId(null);
    } catch (error) {
      console.error(error);
      showToast("Your Photo was not successfully uploaded", "error");
      setTitle("");
      setImgs([]);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    try {
      let imgWithText = [];
      setLoading(true);

      if (imgs?.length > 0) {
        const imageUploadPromises = imgs.map(async (img) => {
          let formData = new FormData();
          formData.append("file", img, img.name);
          const imageResponse = await axios.post(`${API_URL}/image`, formData);
          return imageResponse.data.image;
        });

        const images = await Promise.all(imageUploadPromises);

        imgWithText = images?.map((img, index) => ({
          img: img,
          text: imgTexts[index],
          url: imgUrl[index],
        }));
      }

      await axios.put(`${API_URL}/photo/${id}`, {
        title: title,
        periority: editPriority,
        images: [...editImgs, ...imgWithText],
      });

      showToast("Your Photo was successfully updated", "success");
      setIsVerifyModalOpen(false);
      fetchAllPhotos(currentPage, itemsPerPage);
      setTitle("");
      setPriority(false);
      setEditImgs([]);
      setImgs([]);
      setOnEdit(false);
      setId(null);
      router.push("/dashboard/photos");
    } catch (error) {
      console.error("error in edit image:", error);
      showToast("Your Photo was not successfully updated", "error");
      setTitle("");
      setImgs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (photoId, currentStatus) => {
    const newStatus = !currentStatus;

    axios
      .put(`${API_URL}/photo/${photoId}`, { status: newStatus })
      .then(() => {
        showToast("Status Changed", "success");
        fetchAllPhotos(currentPage, itemsPerPage);
      })
      .catch((error) => {
        console.error("Error updating status", error);
        showToast("Failed to update status", "error");
      });
  };

  const ShowDeleteModal = (photo) => {
    setCurrentPhoto(photo);
    setIsModalDeleteOpen(true);
  };

  const OnDelete = () => {
    axios
      .delete(`${API_URL}/photo?id=${currentPhoto._id}`)
      .then(() => {
        showToast("Photo has Successfully Deleted", "success");
        setCurrentPhoto({});
        setIsModalDeleteOpen(false);
        // Agar current page ka last item delete hua ho to pichle page pe chale jao
        const isLastItemOnPage = allPhotos.length === 1 && currentPage > 1;
        const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;
        fetchAllPhotos(targetPage, itemsPerPage);
      })
      .catch((err) => {
        console.error(err);
        showToast("Photo was Not Deleted", "error");
        setCurrentPhoto({});
        setIsModalDeleteOpen(false);
      });
  };

  // Page numbers ka array banane ke liye helper (max 5 buttons dikhaye)
  const getPageNumbers = () => {
    const { totalPages } = pagination;
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxButtons - 1);
      if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full max-w-full p-4 md:p-6 font-sans text-slate-200 bg-[#070b12] min-h-screen box-border overflow-x-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-[#101929] border border-slate-700/80 text-white shadow-2xl rounded-xl px-5 py-3 flex items-center gap-3 text-sm font-medium backdrop-blur-md">
            {toast.type === "success" && <FaCheckCircle className="text-emerald-400 text-lg" />}
            {toast.type === "error" && <FaExclamationCircle className="text-rose-500 text-lg" />}
            {toast.type === "info" && <FaExclamationCircle className="text-cyan-400 text-lg" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 w-full">
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#00f2fe] to-[#4facfe] bg-clip-text text-transparent tracking-tight truncate">
          Photos Gallery
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1 font-normal">
          Upload, edit, and organize photo albums for your platform.
        </p>
      </div>

      {/* Upload & Form Section */}
      <div className="bg-[#0c1322] border border-[#1a263d] rounded-2xl p-5 md:p-7 mb-8 shadow-2xl w-full box-border">
        <div className="flex flex-col gap-6">
          
          {/* File Upload Box */}
          <div className="w-full flex flex-col gap-5 min-w-0">
            <input
              type="file"
              name="file"
              id="file-name"
              multiple
              onChange={(e) => setImgs(Array.from(e.target.files))}
              className="hidden"
            />
            
            <div
              onClick={() => document.getElementById("file-name").click()}
              className="w-full min-h-[140px] bg-[#070b12]/80 border-2 border-dashed border-slate-700/80 hover:border-[#00d2ff] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-6 group hover:bg-[#0a111f]"
            >
              <div className="p-3 bg-[#131f35] rounded-full group-hover:scale-110 transition-transform mb-3">
                <FaCloudUploadAlt size={28} className="text-[#00d2ff]" />
              </div>
              <span className="text-sm font-semibold text-slate-200 group-hover:text-[#00d2ff] transition-colors">
                {imgs?.length === 0 ? "Click to upload photos" : "Upload more photos"}
              </span>
              <span className="text-xs text-slate-500 mt-1">Select multiple images at once</span>
            </div>

            {/* Images Grid Container */}
            {(imgs?.length > 0 || editImgs?.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-2">
                
                {/* NEWLY SELECTED IMAGES PREVIEW */}
                {imgs?.length > 0 &&
                  imgs.map((img, index) => (
                    <div 
                      key={`new-${index}`} 
                      className="group relative flex flex-col gap-2 p-2.5 bg-[#070b12] border border-[#1b2a45] hover:border-[#00d2ff]/50 rounded-xl transition-all shadow-md"
                    >
                      {/* Delete Button for New Image */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNewImage(index);
                        }}
                        className="absolute top-2 right-2 bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-lg text-xs transition-all z-20 shadow-lg cursor-pointer"
                        title="Remove image"
                      >
                        <FaTimes size={11} />
                      </button>

                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-[#101827]">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Image Text"
                        value={imgTexts[index] || ""}
                        onChange={(e) =>
                          setImgTexts((old) => ({ ...old, [index]: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 bg-[#111a2d] border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                      />
                      <input
                        type="text"
                        placeholder="Image Link"
                        value={imgUrl[index] || ""}
                        onChange={(e) =>
                          setImgUrl((old) => ({ ...old, [index]: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 bg-[#111a2d] border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                      />
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-300 mt-0.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="thumbnail"
                          value={index}
                          checked={!!thumbnail[index]}
                          onChange={() => handleThumbnailChange(index)}
                          className="accent-[#00d2ff] w-3.5 h-3.5 cursor-pointer"
                        />
                        Thumbnail
                      </label>
                    </div>
                  ))}

                {/* EDIT EXISTING IMAGES PREVIEW */}
                {editImgs?.length > 0 &&
                  editImgs.map((img, index) => (
                    <div 
                      key={`edit-${index}`} 
                      className="group relative flex flex-col gap-2 p-2.5 bg-[#070b12] border border-[#1b2a45] hover:border-[#00d2ff]/50 rounded-xl transition-all shadow-md"
                    >
                      {/* Remove Existing Image Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          RemoveImage(img.img);
                        }}
                        className="absolute top-2 right-2 bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-lg text-xs transition-all z-20 shadow-lg cursor-pointer"
                        title="Remove image"
                      >
                        <FaTrashAlt size={10} />
                      </button>

                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-[#101827]">
                        <img
                          src={img.img}
                          alt="Existing Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Image Text"
                        value={img.text || ""}
                        onChange={(e) =>
                          setEditImgs((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, text: e.target.value } : item
                            )
                          )
                        }
                        className="w-full px-2.5 py-1.5 bg-[#111a2d] border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                      />
                      <input
                        type="text"
                        placeholder="Image Link"
                        value={img.url || ""}
                        onChange={(e) =>
                          setEditImgs((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, url: e.target.value } : item
                            )
                          )
                        }
                        className="w-full px-2.5 py-1.5 bg-[#111a2d] border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                      />
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-300 mt-0.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="editThumbnail"
                          checked={editPeriority === index}
                          onChange={() => handleEditChange(index)}
                          className="accent-[#00d2ff] w-3.5 h-3.5 cursor-pointer"
                        />
                        Thumbnail
                      </label>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Form Inputs & Actions */}
          <div className="w-full flex flex-col gap-5 border-t border-[#1b2a45] pt-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                PHOTO TITLE
              </label>
              <input
                type="text"
                placeholder="Enter album or photo title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] transition-all"
              />
            </div>

            {/* Priority Switch & Submit Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3 bg-[#070b12] px-4 py-2 rounded-xl border border-slate-800 w-fit">
                <span className="text-xs font-semibold text-slate-300">Priority Item:</span>
                <button
                  type="button"
                  onClick={() =>
                    edit ? setEditPriority(!editPriority) : setPriority(!priority)
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    (edit ? editPriority : priority) ? "bg-[#00d2ff]" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      (edit ? editPriority : priority) ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => setIsVerifyModalOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#00d2ff] to-[#00a8ff] hover:from-[#00c0eb] hover:to-[#0092e0] text-[#050b14] font-black rounded-xl text-sm transition-all shadow-lg hover:shadow-[#00d2ff]/20 cursor-pointer text-center"
              >
                Preview & Save Album
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 bg-[#0c1322] border border-[#1a263d] p-3.5 rounded-2xl w-full box-border shadow-md">
        <select
          value={filterItem}
          onChange={(e) => setFilterItem(e.target.value)}
          className="w-full sm:w-48 px-3.5 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#00d2ff] cursor-pointer"
        >
          <option value="id">By Id</option>
          <option value="title">By Title</option>
        </select>

        <input
          type="text"
          value={filterItemResponse}
          onChange={(e) => setFilterItemResponse(e.target.value)}
          placeholder={filterItem === "id" ? "Search by ID..." : "Search by Title..."}
          className="w-full sm:flex-1 px-3.5 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
        />

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={onFilter}
            className="flex-1 sm:flex-initial px-5 py-2 bg-[#00d2ff] hover:bg-[#00c0eb] text-[#050b14] font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Filter
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#0c1322] border border-[#1a263d] rounded-2xl shadow-2xl overflow-hidden w-full box-border mb-4">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#1a263d] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#080d18]">
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-5">TITLE</th>
                <th className="py-4 px-5">IMAGES</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a263d]/60 text-xs md:text-sm">
              {allPhotos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No photo records found.
                  </td>
                </tr>
              ) : (
                allPhotos.map((photo) => (
                  <tr key={photo._id} className="hover:bg-[#10192b] transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-400 max-w-[100px] truncate">
                      {photo._id}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-200 max-w-[200px] truncate">
                      {photo.title || "—"}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[260px]">
                        {photo.images?.map((imgObj, idx) => (
                          <div key={idx} className="flex flex-col items-center shrink-0">
                            <img
                              src={imgObj?.img}
                              alt="Photo"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-700/70"
                            />
                            {imgObj?.text && (
                              <span className="text-[10px] text-slate-400 max-w-[48px] truncate mt-0.5">
                                {imgObj.text}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            photo.status
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                              : "bg-rose-950/80 text-rose-400 border border-rose-800/80"
                          }`}
                        >
                          {photo.status ? "ONLINE" : "OFFLINE"}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(photo._id, photo.status)}
                          className="text-[10px] text-[#00d2ff] hover:underline cursor-pointer font-medium"
                        >
                          Change Status
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => {
                            setOnEdit(true);
                            setId(photo._id);
                            router.push("/dashboard/photos?edit=true");
                          }}
                          className="text-[#00d2ff] hover:text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FaEdit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => ShowDeleteModal(photo)}
                          className="text-rose-500 hover:text-rose-400 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FaRegTrashAlt size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-[#0c1322] border border-[#1a263d] p-4 rounded-2xl w-full box-border shadow-md">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Showing page <span className="text-slate-200 font-semibold">{pagination.page}</span> of{" "}
            <span className="text-slate-200 font-semibold">{pagination.totalPages || 1}</span>{" "}
            ({pagination.total} total records)
          </span>
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1 bg-[#070b12] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#00d2ff] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FaChevronLeft size={11} />
          </button>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                num === currentPage
                  ? "bg-[#00d2ff] text-[#050b14]"
                  : "border border-slate-700/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FaChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-[#1a263d] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-1"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-100 mb-4">
              Preview Photo Details
            </h3>
            <div className="mb-4 bg-[#070b12] p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Headline / Title:</span>
              <p className="text-slate-200 font-medium text-base mt-1">{title || "N/A"}</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={id && onEdit ? onUpdate : onUpload}
                disabled={loading}
                className="px-6 py-2 bg-[#00d2ff] hover:bg-[#00c0eb] text-[#050b14] font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Processing..." : id && onEdit ? "Update" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isModalDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-rose-900/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <h3 className="text-xl font-extrabold text-rose-500 mb-2">Are You Sure?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This photo item will be permanently removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsModalDeleteOpen(false);
                  setCurrentPhoto({});
                }}
                className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={OnDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;