import React from 'react'
import TopStoriesClient from './LatestNews'

export async function generateMetadata() {
  return {
    title: "Latest News | Loksatya",
    description: "Latest news from Loksatya",
  };
}

export default function page() {
  return <TopStoriesClient />
}
