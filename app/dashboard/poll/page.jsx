import React from 'react'
import Polls from './Polls';

export const metadata = {
  title: "Polls | Admin Dashboard",
  description: "Create, filter, and view response analytics for public polls.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Polls />
}
