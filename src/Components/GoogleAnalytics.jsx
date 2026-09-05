'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GoogleAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!window.gtag) return;

        const query = searchParams?.toString();
        const pagePath = query ? `${pathname}?${query}` : pathname;

        window.gtag('config', 'G-8VK0YBCS2Y', {
            page_path: pagePath,
        });
    }, [pathname, searchParams]);

    return null;
}
