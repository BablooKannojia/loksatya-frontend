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
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const res = await fetch(`${API_URL}/common`);
    const json = await res.json();

    const rawCategories = json.categories;

    rawCategories.sort((a, b) => a.sequence - b.sequence);

    const categoryArticles = [];
    const priorityArticles = [];

    for (const category of rawCategories) {
      const imgData = [];
      const vidData = [];

      for (const article of category.data) {
        if (article.priority) {
          priorityArticles.push(article);
        }

        if (article.type === "vid") {
          vidData.push(article);
        } else {
          imgData.push(article);
        }
      }

      categoryArticles.push({
        category: category.category,
        imgData,
        vidData,
      });
    }

    setState({
      categories: rawCategories,
      menu: json.menu,
      categoryArticles,
      priorityArticles,
      loading: false,
      error: null,
    });

  } catch (err) {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: err.message,
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