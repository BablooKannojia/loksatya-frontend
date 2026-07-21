"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { IoPersonCircleOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { API_URL } from "../../API";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/comment`, {
        params: { postId },
      });
      const data = res.data?.data || res.data || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !text.trim()) {
      setError("कृपया अपना नाम और टिप्पणी दोनों दर्ज करें।");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/comment`, {
        postId,
        name: name.trim(),
        message: text.trim(),
      });

      setText("");
      setSuccess("आपकी टिप्पणी सफलतापूर्वक जोड़ी गई।");
      fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("टिप्पणी जोड़ने में समस्या हुई, कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full mt-12 pt-8 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="h-6 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-wide">
          टिप्पणियाँ {!loading && `(${comments.length})`}
        </h2>
      </div>

      {/* Add Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
          <IoChatbubbleEllipsesOutline className="text-[#D90429] text-lg" />
          <span>अपनी टिप्पणी लिखें</span>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="आपका नाम"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D90429] focus:ring-2 focus:ring-[#D90429]/20"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="अपनी टिप्पणी यहाँ लिखें..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D90429] focus:ring-2 focus:ring-[#D90429]/20 resize-none"
          />

          {error && <p className="text-xs sm:text-sm text-red-600 font-medium">{error}</p>}
          {success && <p className="text-xs sm:text-sm text-green-600 font-medium">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-lg bg-[#D90429] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b8031f] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "भेजा जा रहा है..." : "टिप्पणी भेजें"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className="flex gap-3 animate-pulse">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c._id}
              className="flex gap-3 border-b border-gray-100 pb-4 last:border-none"
            >
              <IoPersonCircleOutline className="h-10 w-10 shrink-0 text-gray-300" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">
                    {c.name || "उपयोगकर्ता"}
                  </span>
                  {(c.createdAt || c.updatedAt) && (
                    <span className="text-[11px] text-gray-400">
                      {formatDate(c.createdAt || c.updatedAt)}
                    </span>
                  )}
                </div>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed break-words">
                          {(c.message || c.comment || c.text || "").slice(0, 100)}
                          {(c.message || c.comment || c.text || "").length > 100 && "..."}
                      </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-6">
            अभी तक कोई टिप्पणी नहीं है। सबसे पहले टिप्पणी करें!
          </p>
        )}
      </div>
    </section>
  );
}

export default Comments;