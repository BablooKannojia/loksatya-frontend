import React from 'react'
import Stories from './Stories'

export const metadata = {
  title: "Visual Stories | Admin Dashboard",
  description: "Manage and publish interactive visual stories for your audience.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Stories />
}
