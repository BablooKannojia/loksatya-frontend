import React from 'react'
import StoriesPage from './Story'

export async function generateMetadata() {
  return {
    title: "Visual Stories | Loksatya",
    description: "Latest visual stories from Loksatya",
  };
}

export default function page() {
  return <StoriesPage />
}
