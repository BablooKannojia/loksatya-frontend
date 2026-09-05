'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.gtag || !pathname) return;

    window.gtag('config', 'G-8VK0YBCS2Y', {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
