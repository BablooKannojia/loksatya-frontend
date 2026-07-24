import React from 'react'
import Upload from './Upload'

export const metadata = {
  title: "Upload Content | Admin Dashboard",
  description: "Create new news and video.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return <Upload />
}

export default page