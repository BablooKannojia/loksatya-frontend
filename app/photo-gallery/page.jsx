import { API_URL } from "../../src/API";
import PhotoGalleryPage from "./PhotoGalleryPage";

export async function generateMetadata() {
  console.log("🔥 generateMetadata PHOTO GALLERY RUNNING");

  return {
    title: "Photo Gallery | Loksatya",
    description: "Latest photo galleries from Loksatya",
  };
}

export default function Page() {
  return <PhotoGalleryPage />;
}