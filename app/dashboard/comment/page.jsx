import React from 'react'
import Comments from './Comments';

export const metadata = {
  title: "Comments | Admin Dashboard",
  description: "Manage your comments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Comments />
}
