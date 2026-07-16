import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../API";

const CommonContext = createContext({
  categories: [],
  menu: [],
  categoryArticles: [],
  priorityArticles: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export function CommonProvider({ children }) {
  const [state, setState] = useState({
    categories: [],
    menu: [],
    categoryArticles: [],
    priorityArticles: [],
    loading: true,
    error: null,
  });

  const fetchCommonData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch(`${API_URL}/common`);
      const json = await res.json();

      if (json?.success) {
        const rawCategories = json.categories || [];

        // /common already returns each category's articles in `data` —
        // no extra per-category /article calls needed.
        const sortedCategories = [...rawCategories].sort((a, b) => {
          const seqA = a.sequence !== undefined ? a.sequence : Number.MAX_VALUE;
          const seqB = b.sequence !== undefined ? b.sequence : Number.MAX_VALUE;
          return seqA - seqB;
        });

        const categoryArticles = sortedCategories
          .map((c) => ({
            category: c.category,
            imgData: (c.data || []).filter((a) => a.type === "img" || !a.type),
            vidData: (c.data || []).filter((a) => a.type === "vid"),
          }))
          .filter((c) => c.imgData.length > 0 || c.vidData.length > 0);

        // priority articles derived from the same payload (no separate fetch)
        const priorityArticles = sortedCategories
          .flatMap((c) => c.data || [])
          .filter((a) => a.priority === true);

        setState({
          categories: rawCategories,
          menu: json.menu || [],
          categoryArticles,
          priorityArticles,
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