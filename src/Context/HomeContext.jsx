"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../API"; // आपकी API URL फ़ाइल से

const HomeContext = createContext({
  homeData: null,
  loading: true,
  error: null,
  refetchHome: () => {},
});

export function HomeProvider({ children }) {
  const [state, setState] = useState({
    homeData: null,
    loading: true,
    error: null,
  });

  const fetchHomeData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch(`${API_URL}/homepage`);
      const json = await res.json();

      if (json) {
        // क्योंकि आपकी API में सीधा ऑब्जेक्ट या json आ रहा है
        setState({
          homeData: json,
          loading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "होमपेज डेटा लोड करने में समस्या हुई",
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
    fetchHomeData();
  }, [fetchHomeData]);

  return (
    <HomeContext.Provider value={{ ...state, refetchHome: fetchHomeData }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHomeData() {
  return useContext(HomeContext);
}