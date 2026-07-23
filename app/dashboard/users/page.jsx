import UserList from "./UserList";

export const metadata = {
  title: "User List | Admin Dashboard",
  description: "User List.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return <UserList />
};

export default Page;