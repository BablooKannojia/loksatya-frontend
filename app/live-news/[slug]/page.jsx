import React from 'react'
import LiveNewsPage from './LiveNewsPage'

export async function generateMetadata() {
  try {
    const res = await fetch(`${API_URL}/live-news`, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      return {
        title: "Live News | Loksatya News",
      };
    }

    const response = await res.json();

    console.log("PHOTO API RESPONSE:", response);

    const livenews = response?.data || response;

    const latest = Array.isArray(livenews)
      ? livenews[0]
      : livenews;

    const title = latest?.title || "Live News";

    return {
      title: `${title} | Loksatya News`,
      description:
        latest?.description ||
        `Latest Live News - ${title}`,

      openGraph: {
        title: `${title} | Loksatya News`,
        description:
          latest?.description ||
          `Latest Live News - ${title}`,
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: `${title} | Loksatya News`,
      },
    };
  } catch (error) {
    console.error("Metadata Error:", error);

    return {
      title: "Live News | Loksatya",
      description: "Latest live news from Loksatya",
    };
  }
}

export default function page() {
  return <LiveNewsPage />
}
