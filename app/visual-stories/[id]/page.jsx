import React from 'react'
import VisualStoryDetailsPage from './VisualStoryDetailsPage'
import { API_URL } from '../../../src/API';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/story?id=${id}`, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      return {
        title: "Visual Story | Loksatya",
        description: "Loksatya Visual Story",
      };
    }

    const response = await res.json();

    const story = Array.isArray(response?.data)
      ? response.data[0]
      : response?.data || response;

    if (!story) {
      return {
        title: "Visual Story | Loksatya",
        description: "Loksatya Visual Story",
      };
    }

    const title = story.title || "Visual Story";

    // Tumhare API me images array hai
    const image =
      story?.images?.[0]?.img ||
      story?.images?.[0]?.image ||
      null;

    const description =
      story?.description ||
      story?.images?.[0]?.text ||
      `देखिए ${title} से जुड़ी पूरी विजुअल स्टोरी Loksatya पर।`;

    return {
      title: `${title} | Loksatya`,
      description,

      keywords: [
        title,
        "Visual Story",
        "Loksatya",
        "लोकसत्य",
        "Latest News",
      ],

      alternates: {
        canonical: `https://loksatya.com/visual-story/${id}`,
      },

      openGraph: {
        title: `${title} | Loksatya`,
        description,
        url: `https://loksatya.com/visual-story/${id}`,
        siteName: "Loksatya",
        type: "article",

        ...(image && {
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }),
      },

      twitter: {
        card: image
          ? "summary_large_image"
          : "summary",

        title: `${title} | Loksatya`,
        description,

        ...(image && {
          images: [image],
        }),
      },
    };
  } catch (error) {
    console.error("Visual Story Metadata Error:", error);

    return {
      title: "Visual Story | Loksatya",
      description: "Loksatya Visual Story",
    };
  }
}
export default function page() {
  return <VisualStoryDetailsPage />
}
