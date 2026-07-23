'use client';

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import Providers from "./providers";
import Header from "../src/Components/Global/Header";
import Footer from "../src/Components/Global/Footer";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // यदि URL /dashboard से शुरू होता है तो यह true होगा
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <html lang="hi">
      <body>
        <Providers>
          {/* अगर Dashboard पेज नहीं है, तभी Header दिखाएं */}
          {!isDashboard && <Header />}

          {children}

          {/* अगर Dashboard पेज नहीं है, तभी Footer दिखाएं */}
          {!isDashboard && <Footer />}
        </Providers>
      </body>
    </html>
  );
}