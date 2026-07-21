import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IoTimeOutline, IoArrowBack, IoPersonOutline } from "react-icons/io5";
import ShareButtons from "./ShareButtons";
import { API_URL } from "../../../src/API";
import TopStories from "../../../src/Components/Global/TopStories";
import SidebarLatestNews from "../../../src/Components/DetailsPage/SidebarLatestNews";
import RelatedNewsSection from "../../../src/Components/DetailsPage/RelatedNewsSection";
import Comments from "../../../src/Components/DetailsPage/Comments";

// ⚡ 1. Backend API Fetching Function
async function getArticleDetails(id, slug) {
  if (!id) return null;

  try {
    const pageUrl = `https://loksatya.com/details/${slug}?id=${id}`;
    
    const res = await fetch(
      `${API_URL}/article?id=${id}&url=${encodeURIComponent(pageUrl)}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// ⚡ 2. Clean HTML String
function processDescription(rawHtml = "") {
  if (!rawHtml) return "";

  return rawHtml
    .replace(
      /<blockquote class="twitter-tweet">/g,
      '<blockquote class="twitter-tweet" data-lang="hi" data-theme="light">'
    )
    .replace(/font-size:[^;"]*%;?/gi, "font-size:16px;")
    .replace(/<font[^>]*size[^>]*>/gi, '<font style="font-size:16px;">');
}

// ⚡ 3. Dynamic SEO Metadata
export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { id } = await searchParams;
  const article = await getArticleDetails(id, slug);

  if (!article) {
    return { title: "Article Not Found | Loksatya News" };
  }

  const plainTextDescription = article.discription
    ? article.discription.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    : "Stay updated with the latest news on Loksatya.";

  const shareUrl = `https://loksatya.com/details/${slug}?id=${id}`;
  const imageUrl = article.image || "https://loksatya.com/assets/Logo-new-BNYCZvJK.PNG";

  return {
    title: `${article.title} | Loksatya News`,
    description: plainTextDescription,
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title: article.title,
      description: plainTextDescription,
      url: shareUrl,
      siteName: "LokSatya News",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: "hi_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: plainTextDescription,
      images: [imageUrl],
      site: "@LokSatyaNews",
    },
  };
}

// ⚡ 4. Page Skeleton
function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="w-24 h-6 bg-gray-200 rounded-full" />
      <div className="w-full h-8 sm:h-12 bg-gray-200 rounded" />
      <div className="w-3/4 h-8 sm:h-12 bg-gray-200 rounded" />
      <div className="w-full h-12 border-y border-gray-200 py-3 flex justify-between items-center">
        <div className="w-48 h-4 bg-gray-200 rounded" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-full h-[260px] sm:h-[400px] bg-gray-200 rounded-xl" />
      <div className="space-y-3 pt-4">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-5/6 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ⚡ 5. Article Content Component
async function ArticleContent({ id, slug }) {
  const article = await getArticleDetails(id, slug);

  if (!article) {
    notFound();
  }

  const processedHtml = processDescription(article.discription);
  const shareUrl = `https://loksatya.com/details/${slug}?id=${id}`;

  const formattedDate = article.updatedAt || article.createdAt
    ? new Date(article.updatedAt || article.createdAt).toLocaleDateString("hi-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "20 July 2026";

  return (
    <>
      {/* Category / Topic */}
      {article.topic && (
        <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          {article.topic}
        </span>
      )}

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
        {article.title}
      </h1>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center justify-between border-y border-gray-200 py-3 mb-6 text-sm text-gray-600 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 font-medium text-gray-800">
            <IoPersonOutline className="text-base text-red-600" />
            <span>{article.reportedBy || "लोकसत्य"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <IoTimeOutline className="text-base" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Social Share Buttons */}
        <ShareButtons shareUrl={shareUrl} title={article.title} />
      </div>

      {/* Featured Image */}
      {article.image && (
        <div className="relative w-full h-[260px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden mb-8 bg-gray-100 shadow-sm">
          <Image
            src={article.image}
            alt={article.title || "News Image"}
            fill
            priority={true}
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
            className="object-cover"
          />
        </div>
      )}

      {/* Article HTML Content */}
      <div 
        className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4 font-sans"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />

      {/* 📍 2. आर्टिकल के अंत में संबंधित ख़बरें (Related News) यहाँ जोड़ा गया है */}
      <RelatedNewsSection currentNewId={id} topic={article?.topic} />

      {/* 💬 3. आर्टिकल के सबसे नीचे टिप्पणियाँ (Comments) */}
      <Comments postId={id} />
    </>
  );
}

// ⚡ 6. Main Page Export
export default async function DetailsPage({ params, searchParams }) {
  const { slug } = await params;
  const { id } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* 2 Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Article Content (8 Columns) */}
        <article className="lg:col-span-8">
          <Suspense fallback={<ArticleSkeleton />}>
            <ArticleContent id={id} slug={slug} />
          </Suspense>
        </article>

        {/* Right Side: Sidebar (4 Columns) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 flex flex-col">
            <TopStories />
            <SidebarLatestNews />
          </div>
        </aside>

      </div>
    </div>
  );
}