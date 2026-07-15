"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../API";

const StoryContext = createContext({
  storyData: [], // 👈 इसे ऑब्जेक्ट की जगह डिफ़ॉल्ट खाली ऐरे रखें
  loading: true,
  error: null,
  refetchStory: () => {},
});

export function StoryProvider({ children }) {
  const [state, setState] = useState({
    storyData: [], // 👈 डिफ़ॉल्ट स्टेट ऐरे
    loading: true,
    error: null,
  });

  const fetchStoryData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch(`${API_URL}/story`);
      const json = await res.json();
      
      console.log(`Story API Raw Response:`, json);

      if (json) {
        setState({
          storyData: json, // सीधा ऐरे स्टोर कर रहे हैं
          loading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "डेटा लोड करने में समस्या हुई",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "नेटवर्क त्रुटि",
      }));
    }
  }, []);

  useEffect(() => {
    fetchStoryData();
  }, [fetchStoryData]);

  return (
    <StoryContext.Provider value={{ ...state, refetchStory: fetchStoryData }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStoryData() {
  return useContext(StoryContext);
}