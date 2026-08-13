import { API_URL } from "../../src/API";
import PhotoGalleryPage from "./PhotoGalleryPage";

export async function generateMetadata() {
  return {
    title: "Photo Gallery | Loksatya",
    description: "Latest photo galleries from Loksatya",
  };
}

export default function Page() {
  return <PhotoGalleryPage />;
}