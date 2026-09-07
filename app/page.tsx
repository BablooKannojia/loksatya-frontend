import MainPage from "../src/Module/MainPage";
import { API_URL } from "../src/API";

export const metadata = {
  title: "Loksatya News: Breaking News, Latest News, News Headlines Today, India & World News",
  description: "Stay Updated with Latest News on Loksatya News: Catch Breaking News, Top News Headlines from India and Around the World. Explore Today's Updates in Sports, Cricket, Entertainment, Business, Politics, Technology, and More. Stay Informed with Daily News and Developments Across India and Globally",
};

// ⚡ Server-side par hi slider fetch kar lete hain, taaki HTML ke saath
// image ka URL bhi turant browser ko mil jaaye — client-side axios wait
// (jo pehle skeleton dikhata tha) hat jaata hai, image download page load
// hote hi shuru ho jaati hai.
async function getInitialSlider() {
  try {
    const res = await fetch(`${API_URL}/article/slider`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success && data?.data ? data.data : null;
  } catch (error) {
    console.error("Error fetching initial slider:", error);
    return null;
  }
}

export default async function Home() {
  const initialSlider = await getInitialSlider();
  return <MainPage initialSlider={initialSlider} />;
}