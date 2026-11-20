import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStoryBySlug,
  getChapterContent,
  getChapterList,
} from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter: chapterStr } = await params;
  const decodedSlug = decodeURIComponent(slug);
  if (!/^\d+$/.test(chapterStr)) return { title: "Không tìm thấy chương" };
  const chapterNum = parseInt(chapterStr, 10);

  const story = getStoryBySlug(decodedSlug);
  if (!story) return { title: "Không tìm thấy truyện" };

  const chapters = getChapterList(decodedSlug);
  if (!chapters.some((c) => c.number === chapterNum)) {
    return { title: "Không tìm thấy chương" };
  }

  const chapterData = await getChapterContent(decodedSlug, chapterNum);
  const titleSuffix =
    chapterData && chapterData.title !== `Chương ${chapterNum}`
      ? `Chương ${chapterNum}: ${chapterData.title}`
      : `Chương ${chapterNum}`;
  const title = `${story.title} - ${titleSuffix}`;

  const excerpt = chapterData?.content
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);
  const description = excerpt
    ? `${excerpt}...`
    : `Đọc truyện ${story.title} - Chương ${chapterNum} miễn phí tại Truyện Online.`;

  const canonical = `/truyen/${encodeURIComponent(decodedSlug)}/${chapterNum}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter: chapterStr } = await params;
  const decodedSlug = decodeURIComponent(slug);
  if (!/^\d+$/.test(chapterStr)) notFound();
  const chapterNum = parseInt(chapterStr, 10);
  if (Number.isNaN(chapterNum) || chapterNum < 1) notFound();

  const story = getStoryBySlug(decodedSlug);
  if (!story) notFound();

  const chapters = getChapterList(decodedSlug);
  const currentIndex = chapters.findIndex((c) => c.number === chapterNum);
  if (currentIndex === -1) notFound();

  const chapterData = await getChapterContent(decodedSlug, chapterNum);
  if (!chapterData) notFound();

  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const navButtons = (
    <div className="chapter-nav">
      {prevChapter ? (
        <Link
          href={`/truyen/${encodeURIComponent(decodedSlug)}/${prevChapter.number}`}
          className="button"
          style={{ fontSize: "13px", padding: "5px 12px" }}
        >
          « Chương trước
        </Link>
      ) : (
        <span
          className="button"
          style={{ fontSize: "13px", padding: "5px 12px", background: "#aaa", cursor: "not-allowed" }}
        >
          « Chương trước
        </span>
      )}
      <Link
        href={`/truyen/${encodeURIComponent(decodedSlug)}`}
        className="button"
        style={{ fontSize: "13px", padding: "5px 12px", background: "#046106" }}
      >
        📋 Mục lục
      </Link>
      {nextChapter ? (
        <Link
          href={`/truyen/${encodeURIComponent(decodedSlug)}/${nextChapter.number}`}
          className="button"
          style={{ fontSize: "13px", padding: "5px 12px" }}
        >
          Chương sau »
        </Link>
      ) : (
        <span
          className="button"
          style={{ fontSize: "13px", padding: "5px 12px", background: "#aaa", cursor: "not-allowed" }}
        >
          Chương sau »
        </span>
      )}
    </div>
  );

  const siteUrl = getSiteUrl();
  const storyUrl = `${siteUrl}/truyen/${encodeURIComponent(decodedSlug)}`;
  const chapterUrl = `${storyUrl}/${chapterNum}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: story.title, item: storyUrl },
      {
        "@type": "ListItem",
        position: 3,
        name: `Chương ${chapterNum}`,
        item: chapterUrl,
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* BREADCRUMB */}
      <div className="bai-viet-box" style={{ marginBottom: "4px", fontSize: "12px" }}>
        <Link href="/">Trang chủ</Link>
        {" » "}
        <Link href={`/truyen/${encodeURIComponent(decodedSlug)}`}>
          {story.title}
        </Link>
        {" » "}
        <strong>Chương {chapterNum}</strong>
      </div>

      {/* CHAPTER TITLE */}
      <div className="noibat" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "15px", color: "#008000", fontWeight: "bold" }}>
          {story.title}
        </h1>
        <br />
        <em style={{ color: "#333", fontSize: "13px" }}>
          {chapterData.title} · Chương {chapterNum}/{chapters.length}
        </em>
      </div>

      {/* NAV TOP */}
      <div className="bai-viet-box" style={{ textAlign: "center", padding: "6px" }}>
        {navButtons}
      </div>

      {/* CHAPTER CONTENT */}
      <div className="noidungtruyen">
        {chapterData.content
          .split(/\n{2,}/)
          .filter((p) => p.trim() !== "")
          .map((paragraph, i) => (
            <p key={i} style={{ marginBottom: "12px" }}>
              {paragraph}
            </p>
          ))}
      </div>

      {/* NAV BOTTOM */}
      <div className="bai-viet-box" style={{ textAlign: "center", padding: "6px" }}>
        {navButtons}
      </div>

      {/* STORY INFO FOOTER */}
      <div className="bai-viet-box" style={{ fontSize: "12px" }}>
        <span style={{ color: "brown" }}>Truyện: </span>
        <Link href={`/truyen/${encodeURIComponent(decodedSlug)}`}>
          <strong>{story.title}</strong>
        </Link>
        {story.author && (
          <>
            {" · "}
            <span style={{ color: "brown" }}>Tác giả: </span>
            <Link href={`/?author=${encodeURIComponent(story.author)}`}>
              {story.author}
            </Link>
          </>
        )}
        {story.genres.length > 0 && (
          <div style={{ marginTop: "4px", wordBreak: "break-word" }}>
            <span style={{ color: "brown" }}>Thể loại: </span>
            {story.genres.map((g) => (
              <Link key={g} href={`/?genre=${encodeURIComponent(g)}`}>
                <span className="theloai">{g}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
