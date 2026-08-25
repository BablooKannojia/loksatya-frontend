import React from 'react'
import TopStories from './TopStories'

export const metadata = {
  title: "TopStories Content | Admin Dashboard",
  description: "Create new news and video.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <TopStories />
}
