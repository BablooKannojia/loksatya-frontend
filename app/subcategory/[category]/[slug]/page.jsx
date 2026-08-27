import { API_URL } from "../../../../src/API";
import SubCategoryPage from "./SubCategoryData";

export async function generateMetadata({ params }) {
  const { category, slug } = await params;

  const categoryName = decodeURIComponent(category);
  const subCategoryName = decodeURIComponent(slug);

  return {
    title: `${subCategoryName} - ${categoryName} News | Loksatya News`,
    description: `Read latest ${subCategoryName} news from ${categoryName} on Loksatya News.`,
    alternates: {
      canonical: `https://loksatya.com/subcategory/${encodeURIComponent(
        categoryName
      )}/${encodeURIComponent(subCategoryName)}`,
    },
  };
}

export default async function Page({ params }) {
  const { category, slug } = await params;

  return (
    <SubCategoryPage
      category={decodeURIComponent(category)}
      slug={decodeURIComponent(slug)}
    />
  );
}