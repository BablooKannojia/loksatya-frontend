import React from 'react'
import StoriesPage from './Stories'

export async function generateMetadata() {
  return {
    title: "Top Stories | Loksatya",
    description: "Latest top stories from Loksatya",
  };
}

export default function page() {
  return <StoriesPage />
}
