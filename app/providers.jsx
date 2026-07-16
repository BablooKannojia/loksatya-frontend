"use client";

import { useState } from "react";
import "../src/i18n/config.js";
import { LanguageSelect, Loading, OnEdit } from "../src/Context";
import { AdProvider } from "../src/Context/TopAdContext";
import { CommonProvider } from "../src/Context/CommonContext.jsx";
import { HomeProvider } from "@/src/Context/HomeContext.jsx";
import { StoryProvider } from "@/src/Context/StoryContext.jsx";

export default function Providers({ children }) {
  const [lang, setLang] = useState("ur");
  const [loading, setLoading] = useState(false);
  const [effect, setEffect] = useState(false);
  const [onEdit, setOnEdit] = useState(false);
  const [id, setId] = useState("");

  return (
    <CommonProvider>
      <HomeProvider>
        <StoryProvider>
            <AdProvider>
              <Loading.Provider value={{ loading, setLoading, effect, setEffect }}>
                <LanguageSelect.Provider value={{ lang, setLang }}>
                  <OnEdit.Provider value={{ onEdit, setOnEdit, id, setId }}>
                    {children}
                  </OnEdit.Provider>
                </LanguageSelect.Provider>
              </Loading.Provider>
            </AdProvider>
        </StoryProvider>
      </HomeProvider>
    </CommonProvider>
  );
}