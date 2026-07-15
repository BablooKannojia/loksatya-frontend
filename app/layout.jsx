import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers";
import Header from "../src/Components/Global/Header";
import Footer from "../src/Components/Global/Footer";
import MenuBelowSlider from "../src/Components/Global/MenuBelowSlider";

export const metadata = {
  title: "Loksatya News",
  description: "Latest news, videos, photos and visual stories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
