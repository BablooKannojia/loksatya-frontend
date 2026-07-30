import CategoryPage from "./CategoryData";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const api = process.env.NEXT_PUBLIC_API_URL;

  if (!api) {
    return {
      title: "Loksatya",
      description: "Latest News",
    };
  }

  const res = await fetch(`${api}/api/category/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      title: `${slug} | Loksatya News`,
    };
  }

  const data = await res.json();

  const category = data?.category || {};

  const title = category.metaTitle || `${category.name} News | Loksatya News`;
  const description =
    category.metaDescription ||
    `Read latest ${category.name} news, updates and breaking stories.`;

  const image =
    category.metaImage || "https://loksatya.com/logo.png";

  const url = `https://loksatya.com/category/${slug}`;

  return {
    title,
    description,
    keywords: category.metaKeywords || `${category.name}, news, loksatya`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: "Loksatya",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;

  return <CategoryPage slug={slug} />;
}