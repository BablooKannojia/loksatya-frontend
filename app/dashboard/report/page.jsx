import React from 'react'
import Report from './Reports'

export const metadata = {
  title: "Reports | Admin Dashboard",
  description: "Manage your reports.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return <Report />
}

export default page