import React from 'react'
import TagsCategory from './TagsCategory';

export const metadata = {
  title: "Tags & Category | Admin Dashboard",
  description: "Create new Tags and Category.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <TagsCategory />
}
