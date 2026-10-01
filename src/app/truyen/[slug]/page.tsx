import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug, getChapterList } from "@/lib/data";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const story = getStoryBySlug(decodedSlug);
  if (!story) notFound();

  const chapters = await getChapterList(decodedSlug);

  return (
    <div>
      {/* BREADCRUMB */}
      <div className="bai-viet-box" style={{ marginBottom: "4px", fontSize: "12px" }}>
        <Link href="/">Trang chủ</Link>
        {" » "}
        <strong>{story.title}</strong>
      </div>

      {/* STORY INFO */}
      <div className="noibat">
        <strong style={{ fontSize: "16px" }}>{story.title}</strong>
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
              href={`/truyen/${encodeURIComponent(decodedSlug)}/1`}
              className="button"
            >
              📖 Đọc từ đầu
            </Link>
            <Link
              href={`/truyen/${encodeURIComponent(decodedSlug)}/${chapters.length}`}
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
                <em style={{ color: "red", marginRight: "4px" }}>
                  Chương {ch.number}:
                </em>
                {ch.title}
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
