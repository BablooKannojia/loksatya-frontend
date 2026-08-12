import { API_URL } from "../../../src/API";
import PhotoGalleryDetailsPage from "./PhotoGalleryDetailsPage";

export async function generateMetadata() {
  try {
    const res = await fetch(`${API_URL}/photo`, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      return {
        title: "Photo Gallery | Loksatya News",
      };
    }

    const response = await res.json();

    console.log("PHOTO API RESPONSE:", response);

    const photos = response?.data || response;

    const latest = Array.isArray(photos)
      ? photos[0]
      : photos;

    const title = latest?.title || "Photo Gallery";

    return {
      title: `${title} | Loksatya News`,
      description:
        latest?.description ||
        `Latest photo gallery - ${title}`,

      openGraph: {
        title: `${title} | Loksatya News`,
        description:
          latest?.description ||
          `Latest photo gallery - ${title}`,
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
      title: "Photo Gallery | Loksatya",
      description: "Latest photo galleries from Loksatya",
    };
  }
}

export default function Page() {
  return <PhotoGalleryDetailsPage />;
}