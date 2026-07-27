import React from 'react'
import Articles from './Articles'

export const metadata = {
  title: "Articles | Admin Dashboard",
  description: "Create new articles news and video.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Articles />
}
