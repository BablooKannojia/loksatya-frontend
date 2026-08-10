import React from 'react'
import LiveNewsPage from './LiveNews'

export const metadata = {
  title: "Live News Streaming | Admin Dashboard",
  description: "Create new live streaming content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <LiveNewsPage />
}
