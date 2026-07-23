import MainDashBoard from '../../src/Components/AdminPages/MainDashBoard';

export const metadata = {
  title: "Dashboard | Admin Dashboard",
  description: "Manage new users, article, and other facility.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <MainDashBoard />;
}