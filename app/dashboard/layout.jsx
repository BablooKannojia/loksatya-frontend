'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/src/API';
import SideBar from '../../src/Components/AdminComponets/SideBar';

export default function DashboardLayout({ children }) {
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("id");

    if (!userId) {
      router.replace("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/user?id=${userId}`);

        const user = res.data?.[0];

        if (!user) {
          localStorage.clear();
          router.replace("/login");
          return;
        }

        const userAccess = user.acsses || [];
        setAccess(userAccess);

        // Admin ko full access
        if (user.role === "admin") {
          setHasAccess(true);
          return;
        }

        // Current page
        const currentPage = pathname.replace("/dashboard/", "");

        // Dashboard home
        if (
          pathname === "/dashboard" ||
          currentPage === "" ||
          currentPage === "dashboard"
        ) {
          setHasAccess(true);
          return;
        }

        // Nested routes bhi support karega
        const moduleName = currentPage.split("/")[0];

        setHasAccess(userAccess.includes(moduleName));
      } catch (err) {
        console.log(err);
        localStorage.clear();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#D90429] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex">
      {/* Dynamic Sidebar */}
      <aside className="overflow-x-hidden w-64 bg-[#131C31] border-r border-slate-800 fixed top-0 bottom-0 left-0 z-40 overflow-y-auto hidden md:block">
        <SideBar accessList={access} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0B1120]">
        {!hasAccess ? (
          <div className="flex flex-col items-center justify-center h-[70vh] bg-[#131C31] rounded-2xl border border-slate-800 p-8 text-center">
            <h1 className="text-4xl font-extrabold text-[#D90429] mb-2">403</h1>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied (अनुमति नहीं है)</h2>
            <p className="text-slate-400 text-sm max-w-md">
              आपके पास इस पेज को देखने की अनुमति नहीं है। कृपया एडमिनिस्ट्रेटर से संपर्क करें।
            </p>
          </div>
        ) : (
          /* Clone children and pass access prop to pages */
          React.isValidElement(children)
            ? React.cloneElement(children, { accessList: access })
            : children
        )}
      </main>
    </div>
  );
}