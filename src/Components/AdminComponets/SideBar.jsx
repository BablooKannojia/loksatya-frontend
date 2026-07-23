'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiUsers,
  FiUploadCloud,
  FiTrendingUp,
  FiZap,
  FiFileText,
  FiTag,
  FiTv,
  FiFilm,
  FiDollarSign,
  FiMessageSquare,
  FiBarChart2,
  FiAlertCircle,
  FiVideo,
  FiImage,
  FiUserPlus,
  FiMail,
  FiLogOut
} from 'react-icons/fi';
import Image from 'next/image';

export default function SideBar({ accessList = [] }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid, key: 'dashboard' },
    { name: 'Users', path: '/dashboard/users', icon: FiUsers, key: 'users' },
    { name: 'Upload', path: '/dashboard/upload', icon: FiUploadCloud, key: 'upload' },
    { name: 'Articles', path: '/dashboard/articles', icon: FiFileText, key: 'articles' },
    { name: 'Top Stories', path: '/dashboard/topstories', icon: FiTrendingUp, key: 'topstories' },
    { name: 'Breaking News', path: '/dashboard/breakingnews', icon: FiZap, key: 'breakingnews' },
    { name: 'Flash News', path: '/dashboard/flashnews', icon: FiAlertCircle, key: 'flashnews' },
    { name: 'Categories & Tags', path: '/dashboard/content', icon: FiTag, key: 'content' },
    { name: 'Live Stream', path: '/dashboard/live', icon: FiTv, key: 'live' },
    { name: 'Visual Stories', path: '/dashboard/stories', icon: FiFilm, key: 'stories' },
    { name: 'Videos', path: '/dashboard/videos', icon: FiVideo, key: 'videos' },
    { name: 'Photos', path: '/dashboard/photos', icon: FiImage, key: 'photos' },
    { name: 'Create User', path: '/dashboard/createuser', icon: FiUserPlus, key: 'creatuser' },
    { name: 'Ads Management', path: '/dashboard/ads', icon: FiDollarSign, key: 'ads' },
    { name: 'Polls', path: '/dashboard/poll', icon: FiBarChart2, key: 'poll' },
    { name: 'Comments', path: '/dashboard/comment', icon: FiMessageSquare, key: 'comment' },
    { name: 'Newsletter', path: '/dashboard/newsletter', icon: FiMail, key: 'newsletter' },
    { name: 'Report', path: '/dashboard/report', icon: FiFileText, key: 'report' },
  ];

  const filteredMenu = menuItems.filter((item) => {
    if (item.key === 'dashboard') return true;
    return accessList.includes(item.key);
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="h-full flex flex-col justify-between bg-[#131C31] text-slate-300 w-64 border-r border-slate-800">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="न्यूज़ लोगो"
              width={180}
              height={48}
              priority
              className="h-[48px] w-auto object-contain rounded-lg"
            />
            {/* Optimized Admin Badge */}
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin
            </span>
          </Link>
        </div>
        {/* Navigation Menu Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>

          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.key}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D90429] text-white shadow-lg shadow-[#D90429]/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-all border border-red-500/20"
        >
          <FiLogOut size={18} />
          <span>लॉगआउट (Logout)</span>
        </button>
      </div>
    </div>
  );
}