import React from 'react'
import BreakingNews from './BreakingNews'

export const metadata = {
  title: "Breaking News | Admin Dashboard",
  description: "Create new breaking news and video.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <BreakingNews />
}