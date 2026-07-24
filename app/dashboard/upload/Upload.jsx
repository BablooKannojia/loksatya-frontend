"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import { API_URL } from "../../../src/API";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});

const Upload = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [Topic, setTopic] = useState("");
  const [desc, setdesc] = useState("");
  const [reported, setreported] = useState("");
  const [publish, setpublish] = useState("");
  const [type, setType] = useState("img");
  const [Language, setLanguage] = useState("Hindi");
  const [newType, setNewType] = useState("upload");
  const [keyword, setKeyword] = useState([]);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [img, setImg] = useState(null);
  const [options, setOptions] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [role, setRole] = useState("");
  const [usercategoryData, setuserCategoryData] = useState([]);
  const { onEdit, setOnEdit, id } = useContext(onEditContext);
  const [Update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [comment, setComment] = useState(false);
  const [priority, setPriority] = useState(false);
  const [slider, setSlider] = useState(false);
  const [name, setName] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [toastMessage, setToastMessage] = useState({ text: "", type: "" });

  const inputRef = useRef(null);
  const editor = useRef(null);
  const [key, setKey] = useState(0);

  // Helper notice handler
  const notify = (text, type = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: "", type: "" }), 3000);
  };

  // Helper function to handle slug generation
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const addItem = async () => {
    if (!name.trim()) {
      notify("Please enter a tag name.", "warning");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/content?id=${localStorage.getItem("id")}`,
        {
          type: "tag",
          text: name,
        }
      );

      const newTag = {
        value: response.data.text,
        label: response.data.text,
        key: response.data._id,
      };

      setOptions((prev) => [...prev, newTag]);
      setKeyword((prev) => [...prev, newTag.value]);

      setName("");
      notify("Tag added successfully!", "success");
    } catch (error) {
      console.error("Error adding tag:", error);
      notify("Failed to add tag.", "error");
    }
  };

  // Load article & category details
  useEffect(() => {
    if (!edit) {
      setOnEdit(false);
    }
    if (onEdit && edit) {
      axios.get(`${API_URL}/article?id=${id}`).then((item) => {
        let data = item.data[0];
        setTitle(data.title);
        setTopic(data.topic);
        setdesc(data.discription);
        setKeyword(data.keyWord || []);
        setImg(data.image);
        setSubCategory(data.subCategory);
        setSlug(data.slug);
        setComment(data.comment);
        setPriority(data.priority);
        setSlider(data.slider);
        setLanguage(data?.language || "Hindi");
        setpublish(data?.publishBy);
        setreported(data?.reportedBy);
        setNewType(data?.newsType);
        setType(data?.type || "img");
      });
    }

    axios
      .get(`${API_URL}/content?type=tag`)
      .then((content) => {
        const arr = content.data.map((element) => ({
          key: element._id,
          value: element.text,
          label: element.text,
        }));
        setOptions(arr);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${API_URL}/content?type=category`)
      .then((content) => {
        const arr = content.data.map((element) => ({
          key: element._id,
          value: element.text,
          label: element.text,
        }));
        setCategoryData(arr);
      })
      .catch((err) => console.error(err));

    const userId = localStorage.getItem("id");
    if (userId) {
      axios
        .get(`${API_URL}/user?id=${userId}`)
        .then((user) => {
          setpublish(user.data[0].email);
          setRole(user.data[0].role);
          setuserCategoryData(user.data[0].selectedKeywords || []);
        })
        .catch((err) => console.error(err));
    }
  }, [onEdit, edit, id, setOnEdit]);

  // Load subcategories based on active Topic
  useEffect(() => {
    if (Topic) {
      axios
        .get(`${API_URL}/subcategory?category=${Topic}`)
        .then((content) => {
          const arr = content.data.map((element) => ({
            key: element._id,
            value: element.text,
            label: element.text,
          }));
          setSubCategoryData(arr);
        })
        .catch((err) => console.error(err));
    }
  }, [Topic]);

  // Load Twitter / X Widget Script
  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load();
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [desc]);

  // Handle Instagram embed rendering
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.instgrm && window.instgrm.Embeds) {
        clearInterval(interval);
        window.instgrm.Embeds.process();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key]);

  const handleBlur = (newContent) => {
    setdesc(newContent);
    setKey((prevKey) => prevKey + 1);
  };

  const showVerifyModal = () => {
    if (!img) {
      notify("Please upload an image.", "warning");
    } else if (!title.trim()) {
      notify("Please enter a headline.", "warning");
    } else if (!desc.trim()) {
      notify("Please enter description content.", "warning");
    } else if (!Topic) {
      notify("Please select a category.", "warning");
    } else if (!keyword || keyword.length === 0) {
      notify("Please select or add at least one tag.", "warning");
    } else if (!Language) {
      notify("Please select a language.", "warning");
    } else if (!reported) {
      notify("Please select who reported this.", "warning");
    } else if (!publish) {
      notify("Please enter publisher information.", "warning");
    } else if (!newType) {
      notify("Please select the news type.", "warning");
    } else if (!type) {
      notify("Please select content type (image or video).", "warning");
    } else if (!slug.trim()) {
      notify("Please generate a slug.", "warning");
    } else {
      setIsVerifyModalOpen(true);
      setTimeout(() => {
        const previewElement = document.getElementById("preview");
        if (previewElement) {
          previewElement.innerHTML = desc;
        }
      }, 0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setTopic("");
    setdesc("");
    setKeyword([]);
    setImg(null);
    setLanguage("Hindi");
    setType("img");
    setreported("");
    setNewType("upload");
    setComment(false);
    setPriority(false);
    setSlider(false);
    setUpdate(false);
    setOnEdit(false);
    setSlug("");
    setScheduleDateTime("");
  };

  const onUpload = async (isScheduled = false) => {
    if (isScheduled) {
      setScheduleLoading(true);
    } else {
      setPublishLoading(true);
    }

    let formdata = new FormData();
    formdata.append("file", img, img.name);

    const publishAt = isScheduled && scheduleDateTime ? new Date(scheduleDateTime).toISOString() : null;

    try {
      const imageResponse = await axios.post(`${API_URL}/image`, formdata);
      const payload = {
        title,
        discription: desc,
        topic: Topic,
        keyWord: keyword,
        language: Language,
        reportedBy: reported,
        publishBy: publish,
        newsType: newType,
        image: imageResponse.data.image,
        type,
        subCategory,
        slug,
        comment,
        priority,
        slider,
        publishAt,
        status: publishAt ? "scheduled" : "published",
      };

      await axios.post(`${API_URL}/article/${localStorage.getItem("id")}`, payload);

      notify(
        publishAt
          ? `Article scheduled for ${new Date(publishAt).toLocaleString()}`
          : "Article published successfully!",
        "success"
      );

      resetForm();
      setIsVerifyModalOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      notify("Failed to upload article", "error");
    } finally {
      setScheduleLoading(false);
      setPublishLoading(false);
    }
  };

  const onEditHandle = async () => {
    setPublishLoading(true);

    try {
      let imageUrl = img;

      if (Update && img instanceof File) {
        const formdata = new FormData();
        formdata.append("file", img, img.name);

        const imageResponse = await axios.post(`${API_URL}/image`, formdata);
        imageUrl = imageResponse.data.image;
      }

      const payload = {
        title,
        discription: desc,
        topic: Topic,
        keyWord: keyword,
        language: Language,
        reportedBy: reported,
        publishBy: publish,
        newsType: newType,
        image: imageUrl,
        type,
        subCategory,
        slug,
        comment,
        priority,
        slider,
      };

      await axios.put(`${API_URL}/article/${id}`, payload);

      notify("Your article was successfully edited", "success");
      resetForm();
      router.push("/dashboard/articles");
    } catch (error) {
      console.error("Edit error:", error);
      notify("Your article was not successfully edited", "error");
    } finally {
      setPublishLoading(false);
      setIsVerifyModalOpen(false);
    }
  };

  const handleTagToggle = (tagValue) => {
    if (keyword.includes(tagValue)) {
      setKeyword(keyword.filter((t) => t !== tagValue));
    } else {
      setKeyword([...keyword, tagValue]);
    }
  };

  const categoriesToDisplay = role === "admin" 
    ? categoryData 
    : usercategoryData.map((cat) => ({ value: cat, label: cat }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage.text && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md text-white text-sm font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            toastMessage.type === "error"
              ? "bg-rose-600/90 border-rose-500/50"
              : toastMessage.type === "warning"
              ? "bg-amber-500/90 border-amber-400/50"
              : "bg-emerald-600/90 border-emerald-500/50"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {loading && (
        <div className="p-3 mb-6 text-white bg-indigo-600 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing article data...
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {onEdit ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Fill out the information below to manage your publication post.</p>
        </div>

        {onEdit && (
          <button
            onClick={() => {
              setOnEdit(false);
              window.location.reload();
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all shadow-sm"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {/* Editor Main Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        
        {/* Top Grid: Media Upload & Core Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* File Upload Box */}
          <div className="lg:col-span-4 flex flex-col">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Media Asset
            </label>
            <input
              type="file"
              name="file"
              id="file-name"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImg(e.target.files[0]);
                  setUpdate(true);
                }
              }}
              className="hidden"
            />
            <div
              onClick={() => document.getElementById("file-name")?.click()}
              className="relative group w-full h-56 bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300"
            >
              {img == null ? (
                <div className="text-center p-6 flex flex-col items-center gap-2">
                  <div className="p-3 bg-slate-800 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Upload Image or Video</span>
                  <span className="text-xs text-slate-500">Supports JPG, PNG, MP4</span>
                </div>
              ) : type === "img" ? (
                <img
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  alt="Uploaded preview"
                  src={Update && img instanceof File ? URL.createObjectURL(img) : img}
                />
              ) : (
                <video
                  className="w-full h-full object-cover"
                  src={Update && img instanceof File ? URL.createObjectURL(img) : img}
                  controls
                />
              )}
            </div>
          </div>

          {/* Core Fields Form Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Media Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              >
                <option value="img">Image</option>
                <option value="vid">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Language
              </label>
              <select
                value={Language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              >
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Headline
              </label>
              <input
                type="text"
                placeholder="Enter article headline..."
                value={title}
                onChange={(e) => {
                  setSlug(createSlug(e.target.value));
                  setTitle(e.target.value);
                }}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Category
              </label>
              <select
                value={Topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSubCategory("");
                }}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              >
                <option value="">Select Category</option>
                {categoriesToDisplay.map((item, idx) => (
                  <option key={item.key || idx} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Sub Category
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              >
                <option value="">Select Sub Category</option>
                {subCategoryData.map((item) => (
                  <option key={item.key} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jodit Editor Container */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Article Content
          </label>
          <div className="rounded-xl overflow-hidden border border-slate-700 text-slate-900 shadow-inner">
            <JoditEditor
              ref={editor}
              value={desc}
              tabIndex={1}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Tags and Meta Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-700/60">
          
          {/* Tags Selection & Add tag */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tags
            </label>
            <div className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-3 max-h-36 overflow-y-auto mb-3 flex flex-wrap gap-2">
              {options.length === 0 && <span className="text-xs text-slate-500">No tags found</span>}
              {options.map((option) => {
                const isSelected = keyword.includes(option.value);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleTagToggle(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Create new tag..."
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap"
              >
                + Add Tag
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Reported By
            </label>
            <select
              value={reported}
              onChange={(e) => setreported(e.target.value)}
              className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            >
              <option value="">Select Reporter</option>
              <option value="लोकसत्य">लोकसत्य</option>
            </select>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Publish By
              </label>
              <input
                type="text"
                readOnly
                placeholder="Publish By"
                value={publish}
                className="w-full p-3 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-xl text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Slug
            </label>
            <input
              type="text"
              placeholder="article-url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Switches & Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-700/60">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={comment}
                onChange={(e) => setComment(e.target.checked)}
                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Enable Comments</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Priority Post</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={slider}
                onChange={(e) => setSlider(e.target.checked)}
                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span>Show in Slider</span>
            </label>
          </div>

          <button
            onClick={showVerifyModal}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02]"
          >
            Preview & Publish
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Article Preview & Publication
              </h2>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Schedule Publication (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Headline</h3>
                <p className="text-xl font-bold text-slate-100">{title}</p>
              </div>

              <hr className="border-slate-800" />

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Content Body</h3>
                <div id="preview" className="prose prose-invert max-w-none text-slate-300 bg-slate-950 p-5 rounded-xl border border-slate-800"></div>
              </div>

              <hr className="border-slate-800" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{Topic || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Language</h3>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{Language}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</h3>
                  <p className="text-sm font-semibold text-indigo-400 mt-1">{keyword.join(", ") || "None"}</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={publishLoading}
                onClick={() => {
                  if (!scheduleDateTime) {
                    notify("Please select a schedule time", "warning");
                    return;
                  }
                  onUpload(true);
                }}
                className="px-5 py-2.5 bg-slate-800 border border-indigo-500/50 hover:bg-slate-700 text-indigo-300 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {scheduleLoading ? "Scheduling..." : "Schedule"}
              </button>

              <button
                disabled={scheduleLoading}
                onClick={() => {
                  setScheduleDateTime("");
                  if (onEdit) {
                    onEditHandle();
                  } else {
                    onUpload(false);
                  }
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
              >
                {publishLoading
                  ? "Publishing..."
                  : onEdit
                  ? "Save Changes"
                  : "Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;