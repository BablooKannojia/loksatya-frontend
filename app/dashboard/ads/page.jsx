import React from 'react'
import Ads from './Ads';

export const metadata = {
  title: "Advertisement Management | Admin Dashboard",
  description: "Create, position, track, and monitor active promotional ad campaigns.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Ads />
}
