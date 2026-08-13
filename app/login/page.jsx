import React from 'react'
import Login from './Login'

export async function generateMetadata() {
  return {
    title: "Login | Loksatya News",
    description: "Login with your credentials",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function page() {
  return <Login />
}
