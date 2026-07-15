import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../API";

const CommonContext = createContext({
  categories: [],
  menu: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export function CommonProvider({ children }) {
  const [state, setState] = useState({
    categories: [],
    menu: [],
    loading: true,
    error: null,
  });

  const fetchCommonData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch(`${API_URL}/common`);
      console.log("API Response common:", res);
      const json = await res.json();

      if (json?.success) {
        setState({
          categories: json.categories || [],
          menu: json.menu || [],
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
        error: err?.message || "Network error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchCommonData();
  }, [fetchCommonData]);

  return (
    <CommonContext.Provider value={{ ...state, refetch: fetchCommonData }}>
      {children}
    </CommonContext.Provider>
  );
}

export function useCommonData() {
  return useContext(CommonContext);
}