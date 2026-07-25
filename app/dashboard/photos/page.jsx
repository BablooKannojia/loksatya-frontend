import React from 'react'
import Photos from './Photos';

export const metadata = {
  title: "Photos Gallery | Admin Dashboard",
  description: "Upload, edit, and organize photo albums for your platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Photos />
}
