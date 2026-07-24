import React from 'react'
import FlashNews from './FlashNews'

export const metadata = {
  title: "Flash News | Admin Dashboard",
  description: "Create new flash news.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return <FlashNews />
}

export default page