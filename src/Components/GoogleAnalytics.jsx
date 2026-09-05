'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.gtag || !pathname) return;

    // Admin/private pages ko Google Analytics me track mat karo
    const excludedPaths = [
      '/dashboard',
      '/login',
    ];

    const shouldExclude = excludedPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (shouldExclude) return;

    window.gtag('config', 'G-8VK0YBCS2Y', {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
