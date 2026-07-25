import React from 'react'
import Live from './Live'

export const metadata = {
  title: "Live Streaming | Admin Dashboard",
  description: "Manage YouTube live links, titles, and broadcast descriptions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Live />
}
