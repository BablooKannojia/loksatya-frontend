import React from 'react'
import CreateLiveNewsPage from './CreateLiveNews';

export const metadata = {
  title: "Create Live News Streaming | Admin Dashboard",
  description: "Create new live streaming content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
    return <CreateLiveNewsPage />
}