import React from 'react'
import TopStoriesPage from './BreakingNews'

export async function  generateMetadata() {
  return {
    title: "Breaking News | Loksatya",
    description: "Latest breaking news from Loksatya",
  }
}
export default function page() {
  return <TopStoriesPage />
}
