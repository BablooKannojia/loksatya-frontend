import React from 'react'
import NewsLetter from './Newsletter';

export const metadata = {
  title: "NewsLetter | Admin Dashboard",
  description: "Manage your newsletters email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <NewsLetter />
}
