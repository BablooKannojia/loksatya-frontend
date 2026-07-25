import React from 'react'
import Video from './Video';

export const metadata = {
  title: "Videos | Admin Dashboard",
  description: "Upload, edit, and organize photo albums for your platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Video />
}
