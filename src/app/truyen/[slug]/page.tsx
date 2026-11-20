import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug, getChapterList } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const story = getStoryBySlug(decodedSlug);
  if (!story) return { title: "Không tìm thấy truyện" };

  const genresText = story.genres.slice(0, 5).join(", ");
  const description = [
    `Đọc truyện ${story.title}`,
    story.author ? `tác giả ${story.author}` : "",
    story.num_chapters > 0 ? `(${story.num_chapters} chương)` : "",
    story.status ? `- ${story.status}` : "",
    genresText ? `. Thể loại: ${genresText}.` : ".",
  ]
    .filter(Boolean)
    .join(" ");

  const canonical = `/truyen/${encodeURIComponent(decodedSlug)}`;

  return {
    title: story.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "book",
      title: story.title,
      description,
      url: canonical,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const story = getStoryBySlug(decodedSlug);
  if (!story) notFound();

  const chapters = getChapterList(decodedSlug);
  const siteUrl = getSiteUrl();
  const storyUrl = `${siteUrl}/truyen/${encodeURIComponent(decodedSlug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        name: story.title,
        url: storyUrl,
        ...(story.author ? { author: { "@type": "Person", name: story.author } } : {}),
        ...(story.genres.length > 0 ? { genre: story.genres } : {}),
        inLanguage: "vi",
        numberOfPages: chapters.length,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: story.title, item: storyUrl },
        ],
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
        <strong>{story.title}</strong>
      </div>

      {/* STORY INFO */}
      <div className="noibat">
        <h1 style={{ fontSize: "16px", fontWeight: "bold" }}>{story.title}</h1>
      </div>

      <div className="bai-viet-box">
        <table style={{ border: "none", width: "100%" }}>
          <tbody>
            {story.author && (
              <tr>
                <td style={{ border: "none", color: "brown", fontSize: "12px", width: "100px", padding: "2px 4px" }}>
                  Tác giả:
                </td>
                <td style={{ border: "none", padding: "2px 4px" }}>
                  <Link href={`/?author=${encodeURIComponent(story.author)}`}>
                    {story.author}
                  </Link>
                </td>
              </tr>
            )}
            <tr>
              <td style={{ border: "none", color: "brown", fontSize: "12px", padding: "2px 4px" }}>
                Số chương:
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <strong style={{ color: "#008000" }}>{story.num_chapters}</strong> chương
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", color: "brown", fontSize: "12px", padding: "2px 4px" }}>
                Tình trạng:
              </td>
              <td style={{ border: "none", padding: "2px 4px" }}>
                <strong style={{ color: story.status === "Hoàn thành" ? "green" : "#cc8800" }}>
                  {story.status || "Đang ra"}
                </strong>
              </td>
            </tr>
            {story.genres.length > 0 && (
              <tr>
                <td style={{ border: "none", color: "brown", fontSize: "12px", padding: "2px 4px", verticalAlign: "top" }}>
                  Thể loại:
                </td>
                <td style={{ border: "none", padding: "2px 4px", wordBreak: "break-word" }}>
                  {story.genres.map((g) => (
                    <Link key={g} href={`/?genre=${encodeURIComponent(g)}`}>
                      <span className="theloai">{g}</span>
                    </Link>
                  ))}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {chapters.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <Link
              href={`/truyen/${encodeURIComponent(decodedSlug)}/${chapters[0].number}`}
              className="button"
            >
              📖 Đọc từ đầu
            </Link>
            <Link
              href={`/truyen/${encodeURIComponent(decodedSlug)}/${chapters[chapters.length - 1].number}`}
              className="button"
              style={{ background: "#118638", marginLeft: "4px" }}
            >
              ⏩ Đọc chương mới nhất
            </Link>
          </div>
        )}
      </div>

      {/* CHAPTER LIST */}
      <div className="phdr">
        <strong>Danh sách chương ({chapters.length} chương)</strong>
      </div>

      <div className="bai-viet-box">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2px" }}>
          {chapters.map((ch) => (
            <div key={ch.number} className="list2">
              <Link
                href={`/truyen/${encodeURIComponent(decodedSlug)}/${ch.number}`}
              >
                <em style={{ color: "red" }}>
                  Chương {ch.number}
                </em>
                {ch.title !== `Chương ${ch.number}` && `: ${ch.title}`}
              </Link>
            </div>
          ))}
        </div>

        {chapters.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", padding: "12px" }}>
            Chưa có chương nào.
          </p>
        )}
      </div>
    </div>
  );
}
