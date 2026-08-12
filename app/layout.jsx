'use client';

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import Providers from "./providers";
import Header from "../src/Components/Global/Header";
import Footer from "../src/Components/Global/Footer";
// import Script from "next/script";


export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") ||  pathname.startsWith("/visual-stories")
                      || pathname.startsWith("/photo-gallery") 

  return (
    <html lang="hi">

      {/* Google Analytics  */}
      {/* <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8VK0YBCS2Y"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8VK0YBCS2Y');
          `}
        </Script>
      </head> */}

      <body>
        <Providers>
          {/* If not found Dashboard, Then Header show */}
          {!isDashboard && <Header />}

          {children}

          {/* If not found Dashboard, Then Footer show */}
          {!isDashboard && <Footer />}
        </Providers>
      </body>
    </html>
  );
}