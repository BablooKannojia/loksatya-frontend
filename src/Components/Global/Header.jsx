"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCommonData } from "../../Context/CommonContext";

function categoryHref(text = "") {
  return `/category/${encodeURIComponent(text.trim())}`;
}

/* ---------- single nav item with its own dropdown ---------- */
function NavItem({ item }) {
  const isHome = item._id === "static-home";
  const href = isHome ? "/" : categoryHref(item.text);
  const hasSub = !isHome && item.subcategories?.length > 0;

  return (
    <li className="group relative">
      <Link
        href={href}
        className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-devanagari text-[14px] font-semibold text-white transition-colors group-hover:bg-white group-hover:text-brand"
      >
        {/* अगर होम है तो छोटा सा घर का आइकॉन */}
        {isHome && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        )}
        
        <span>{item.text}</span>
        
        {/* 🌟 डेस्कटॉप पैरेंट के लिए डाउन शेवरॉन आइकॉन */}
        {hasSub && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180 opacity-80">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </Link>

      {hasSub && (
        <div className="invisible absolute left-0 top-full z-50 min-w-[190px] translate-y-1.5 border-t-[3px] border-brand bg-white opacity-0 shadow-2xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <ul className="py-1.5">
            {item.subcategories.map((sub) => (
              <li key={sub._id}>
                <Link
                  href={categoryHref(sub.text)}
                  className="block border-l-[3px] border-transparent px-4 py-2 font-devanagari text-[13.5px] text-ink-soft hover:border-brand hover:bg-brand-light hover:text-brand"
                >
                  {sub.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/* ---------- nav that auto-collapses overflow into "और" dropdown ---------- */
function HeaderNav({ menu }) {
  const containerRef = useRef(null);
  const hiddenRef = useRef(null);
  const moreBtnRef = useRef(null);
  const moreWrapRef = useRef(null);
  
  const fullMenu = [{ _id: "static-home", text: "होम" }, ...menu];

  const [visibleCount, setVisibleCount] = useState(fullMenu.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openSubMenuId, setOpenSubMenuId] = useState(null);

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const hidden = hiddenRef.current;
    if (!container || !hidden) return;

    const containerWidth = container.getBoundingClientRect().width;
    const moreWidth = moreBtnRef.current ? moreBtnRef.current.getBoundingClientRect().width + 8 : 80;
    const children = Array.from(hidden.children);
    
    let total = 0;
    let count = 0;

    for (let i = 0; i < children.length; i++) {
      const itemWidth = children[i].getBoundingClientRect().width + 2; 
      const isLastItem = i === children.length - 1;
      const reserve = isLastItem ? 0 : moreWidth;

      if (total + itemWidth + reserve > containerWidth) {
        break; 
      }

      total += itemWidth;
      count = i + 1;
    }

    setVisibleCount(Math.max(count, 1));
  }, []);

  useLayoutEffect(() => {
    recalc();
  }, [menu, recalc]);

  useEffect(() => {
    const ro = new ResizeObserver(() => recalc());
    if (containerRef.current) ro.observe(containerRef.current);
    document.fonts?.ready.then(recalc);
    return () => ro.disconnect();
  }, [recalc]);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnOutside = (e) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target)) {
        setMoreOpen(false);
        setOpenSubMenuId(null);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [moreOpen]);

  const visibleItems = fullMenu.slice(0, visibleCount);
  const hiddenItems = fullMenu.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      
      {/* मापने वाली हिडन लिस्ट */}
      <ul
        ref={hiddenRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 flex items-center gap-0.5 whitespace-nowrap"
        style={{ pointerEvents: "none", visibility: "hidden" }}
      >
        {fullMenu.map((item) => {
          const isHome = item._id === "static-home";
          const hasSub = !isHome && item.subcategories?.length > 0;
          return (
            <li 
              key={item._id} 
              className="rounded-md px-3 py-2 font-devanagari text-[14px] font-semibold flex items-center gap-1.5"
            >
              {isHome && <span className="w-4 h-4 inline-block" />}
              <span>{item.text}</span>
              {hasSub && <span className="w-3 h-3 inline-block" />}
            </li>
          );
        })}
      </ul>

      {/* वास्तविक रेंडर होने वाला मेनू */}
      <nav aria-label="मुख्य मेन्यू" className="w-full">
        <ul className="flex w-full items-center justify-end gap-0.5 whitespace-nowrap">
          {visibleItems.map((item) => (
            <NavItem key={item._id} item={item} />
          ))}

          {hiddenItems.length > 0 && (
            <li ref={moreWrapRef} className="relative">
              <button
                ref={moreBtnRef}
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white/10 px-3 py-2 font-devanagari text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-brand"
              >
                और
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* ड्रॉपडाउन मेनू */}
              <div
                className={`absolute right-0 top-full z-50 min-w-[240px] border-t-[3px] border-brand bg-white shadow-2xl transition-all duration-150 ${
                  moreOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0"
                }`}
              >
                <ul className="max-h-[60vh] overflow-y-auto py-1.5">
                  {hiddenItems.map((item) => {
                    const isHome = item._id === "static-home";
                    const hasSub = !isHome && item.subcategories?.length > 0;
                    const isSubOpen = openSubMenuId === item._id;
                    const href = isHome ? "/" : categoryHref(item.text);

                    return (
                      <li key={item._id} className="border-b border-gray-50 last:border-0">
                        <div className="flex items-center justify-between hover:bg-brand-light group">
                          <Link
                            href={href}
                            onClick={() => setMoreOpen(false)}
                            className="flex-1 px-4 py-2.5 font-devanagari text-[13.5px] font-medium text-ink-soft group-hover:text-brand"
                          >
                            {item.text}
                          </Link>
                          {hasSub && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSubMenuId(isSubOpen ? null : item._id);
                              }}
                              className="px-4 py-2.5 text-ink-soft hover:text-brand"
                            >
                              {/* 🌟 'और' ड्रॉपडाउन के अंदर का शेवरॉन */}
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform duration-200 ${isSubOpen ? "rotate-180 text-brand" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* सब-कैटेगरीज़ Accordion */}
                        {hasSub && (
                          <ul className={`overflow-hidden bg-gray-50 transition-all duration-300 ${isSubOpen ? "max-h-[400px] border-t border-gray-100" : "max-h-0"}`}>
                            {item.subcategories.map((sub) => (
                              <li key={sub._id}>
                                <Link
                                  href={categoryHref(sub.text)}
                                  onClick={() => {
                                    setMoreOpen(false);
                                    setOpenSubMenuId(null);
                                  }}
                                  className="block py-2 pl-8 pr-4 font-devanagari text-[13px] text-ink-soft hover:bg-gray-100 hover:text-brand"
                                >
                                  {sub.text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default function Header() {
  const { menu, loading } = useCommonData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  const fullMobileMenu = [{ _id: "static-home", text: "होम" }, ...menu];

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* ===== Top utility strip ===== */}
      <div className="flex items-center gap-2 bg-ink px-5 py-1.5 font-devanagari text-[12px] text-gray-300">
        <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-white animate-livepulse" />
        <span className="font-medium">सबसे तेज़, सबसे सटीक खबरें</span>
      </div>

      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 bg-brand shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-0"> {/* py कम किया क्योंकि लोगो बाहर निकलेगा */}
          
          {/* 🌟 आज़तक जैसा उभरा (Pop-out) हुआ लोगो */}
          <Link
            href="/"
            aria-label="होमपेज"
            className="flex-shrink-0 relative z-50 rounded-b-lg bg-white px-4 pb-3 pt-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transform translate-y-1 transition-transform hover:translate-y-1.5"
          >
            <Image
              src="/logo.png"
              alt="न्यूज़ लोगो"
              width={150}
              height={48}
              priority
              className="h-[42px] w-auto object-contain"
            />
          </Link>

          {/* Nav — Desktop only */}
          {!loading && menu.length > 0 && (
            <div className="hidden lg:block lg:flex-1 lg:min-w-0 py-2.5">
              <HeaderNav menu={menu} />
            </div>
          )}

          {/* Hamburger (Mobile only) */}
          <button
            type="button"
            aria-label="मेन्यू खोलें"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="ml-auto flex h-[38px] w-[38px] flex-shrink-0 flex-col justify-center gap-[5px] lg:hidden"
          >
            <span className="h-[2.5px] w-full rounded bg-white" />
            <span className="h-[2.5px] w-full rounded bg-white" />
            <span className="h-[2.5px] w-full rounded bg-white" />
          </button>
        </div>
      </header>

      {/* ===== Mobile Drawer Backdrop ===== */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* ===== Mobile drawer ===== */}
      <aside
        aria-hidden={!drawerOpen}
        className={`fixed left-0 top-0 z-[70] flex h-full w-[min(82vw,340px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-[3px] border-brand-dark bg-brand px-4 py-3.5">
          <div className="rounded-md bg-white px-2.5 py-1">
            <Image src="/logo.png" alt="न्यूज़ लोगो" width={120} height={38} />
          </div>
          <button
            type="button"
            aria-label="मेन्यू बंद करें"
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-brand font-bold"
          >
            ✕
          </button>
        </div>

        <nav aria-label="मोबाइल मेन्यू" className="flex-1 overflow-y-auto pb-6 font-devanagari">
          {loading && <p className="p-4 text-sm text-ink-soft">लोड हो रहा है...</p>}

          <ul>
            {fullMobileMenu.map((item) => {
              const isHome = item._id === "static-home";
              const hasSub = !isHome && item.subcategories?.length > 0;
              const isOpen = openAccordion === item._id;
              const href = isHome ? "/" : categoryHref(item.text);

              return (
                <li key={item._id} className="border-b border-gray-100">
                  <div className="flex items-stretch">
                    <Link
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 border-l-4 border-transparent px-4.5 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-light hover:text-brand flex items-center gap-2"
                    >
                      {isHome && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-ink-soft">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                      )}
                      <span>{item.text}</span>
                    </Link>

                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item._id)}
                        aria-label={`${item.text} की सूची ${isOpen ? "बंद" : "खोलें"}`}
                        className="w-12 flex items-center justify-center text-ink-soft"
                      >
                        {/* 🌟 मोबाइल पैरेंट के लिए शेवरॉन */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand" : ""}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {hasSub && (
                    <ul className={`overflow-hidden bg-gray-50 transition-all duration-300 ${isOpen ? "max-h-[600px]" : "max-h-0"}`}>
                      {item.subcategories.map((sub) => (
                        <li key={sub._id}>
                          <Link
                            href={categoryHref(sub.text)}
                            onClick={() => setDrawerOpen(false)}
                            className="block border-l-4 border-transparent py-2.5 pl-[34px] pr-4 text-[13.5px] text-ink-soft hover:border-brand hover:text-brand"
                          >
                            {sub.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}