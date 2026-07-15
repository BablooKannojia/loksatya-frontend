"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from "../API";

const CategoriesContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategoriesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const categoryResponse = await axios.get(`${API_URL}/content?type=category`);
      const sortedCategories = categoryResponse.data?.sort((a, b) => {
        const seqA = a.sequence !== undefined ? a.sequence : Number.MAX_VALUE;
        const seqB = b.sequence !== undefined ? b.sequence : Number.MAX_VALUE;
        return seqA - seqB;
      }) || [];

      setCategories(sortedCategories);

      // Fetch all subcategories in parallel
      const subcategoryPromises = sortedCategories.map(async (category) => {
        try {
          const res = await axios.get(`${API_URL}/subcategory?category=${category.text}`);
          return { category: category.text, data: res.data };
        } catch (err) {
          console.error("Failed to fetch subcategories for:", category.text, err);
          return { category: category.text, data: [] };
        }
      });

      const subcategoryResults = await Promise.all(subcategoryPromises);
      const subcategoryMap = {};
      
      subcategoryResults.forEach(({ category, data }) => {
        subcategoryMap[category] = data;
      });

      setSubcategories(subcategoryMap);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories data:", err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const value = {
    categories,
    subcategories,
    loading,
    error,
    refetch: fetchCategoriesData
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};