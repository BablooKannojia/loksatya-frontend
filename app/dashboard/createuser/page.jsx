import CreateUser from "./CreateUser";

export const metadata = {
  title: "Create User | Admin Dashboard",
  description: "Create new users and assign permissions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <CreateUser />;
}