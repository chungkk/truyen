import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStoryBySlug,
  getChapterContent,
  getChapterList,
} from "@/lib/data";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter: chapterStr } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const chapterNum = parseInt(chapterStr, 10);

  const story = getStoryBySlug(decodedSlug);
  if (!story) notFound();

  const chapterData = await getChapterContent(decodedSlug, chapterNum);
  if (!chapterData) notFound();

  const chapters = getChapterList(decodedSlug);
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < chapters.length;

  const navButtons = (
    <div className="chapter-nav">
      {hasPrev ? (
        <Link
          href={`/truyen/${encodeURIComponent(decodedSlug)}/${chapterNum - 1}`}
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
      {hasNext ? (
        <Link
          href={`/truyen/${encodeURIComponent(decodedSlug)}/${chapterNum + 1}`}
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

  return (
    <div>
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
        <strong style={{ fontSize: "15px", color: "#008000" }}>
          {story.title}
        </strong>
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
        {chapterData.content.split("\n\n").map((paragraph, i) => (
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
