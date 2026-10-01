import Link from "next/link";
import { Suspense } from "react";
import {
  getAllStories,
  getAllGenres,
  getAllAuthors,
  getAllCategories,
  getGenresWithCount,
  getAuthorsWithCount,
} from "@/lib/data";
import SearchAndFilter from "@/components/SearchAndFilter";
import Pagination from "@/components/Pagination";

const STORIES_PER_PAGE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    author?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.toLowerCase() || "";
  const genreFilter = params.genre || "";
  const authorFilter = params.author || "";
  const categoryFilter = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const allStories = getAllStories();
  const genres = getAllGenres();
  const authors = getAllAuthors();
  const categories = getAllCategories();
  const genresWithCount = getGenresWithCount();
  const authorsWithCount = getAuthorsWithCount();

  let filtered = allStories;

  if (query) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.author.toLowerCase().includes(query)
    );
  }
  if (genreFilter) {
    filtered = filtered.filter((s) => s.genres.includes(genreFilter));
  }
  if (authorFilter) {
    filtered = filtered.filter((s) => s.author === authorFilter);
  }
  if (categoryFilter) {
    filtered = filtered.filter((s) => s.categories.includes(categoryFilter));
  }

  const totalPages = Math.ceil(filtered.length / STORIES_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const stories = filtered.slice(
    (currentPage - 1) * STORIES_PER_PAGE,
    currentPage * STORIES_PER_PAGE
  );

  const hasFilters = query || genreFilter || authorFilter || categoryFilter;

  return (
    <div>
      {/* ===== SEARCH BAR ===== */}
      <div className="phdr">
        <strong>🔍 Tìm kiếm truyện</strong>
      </div>
      <div className="bai-viet-box" style={{ marginBottom: "8px" }}>
        <Suspense>
          <SearchAndFilter genres={genres} authors={authors} />
        </Suspense>
        {hasFilters && (
          <div style={{ marginTop: "6px", fontSize: "12px" }}>
            Tìm thấy <strong>{filtered.length}</strong> truyện ·{" "}
            <Link href="/" style={{ color: "#008000" }}>
              [Xóa bộ lọc]
            </Link>
          </div>
        )}
      </div>

      {/* ===== 1. TRUYỆN MỚI CẬP NHẬT (ở trên) ===== */}
      <div className="phdr">
        <strong>
          {hasFilters
            ? `Kết quả tìm kiếm (${filtered.length} truyện)`
            : `Truyện mới cập nhật — Trang ${currentPage}/${totalPages}`}
        </strong>
      </div>

      {stories.length === 0 ? (
        <div
          className="bai-viet-box"
          style={{ textAlign: "center", padding: "20px" }}
        >
          <p>Không tìm thấy truyện nào.</p>
          <Link href="/" className="button">
            Quay về trang chủ
          </Link>
        </div>
      ) : (
        stories.map((story) => (
          <div key={story.slug}>
            <div className="noibat">
              <Link
                href={`/truyen/${encodeURIComponent(story.slug)}/1`}
                title={story.title}
              >
                <strong>{story.title}</strong>
              </Link>
              {story.num_chapters > 0 && (
                <span className="update-badge">
                  {" "}
                  (Update Phần 1 - {story.num_chapters} chương)
                </span>
              )}
            </div>
            <div className="bai-viet-box">
              <Link
                href={`/truyen/${encodeURIComponent(story.slug)}/1`}
                rel="nofollow"
              >
                <span className="summary">
                  {story.author && (
                    <>
                      <em>Tác giả: {story.author}</em>
                      {" · "}
                    </>
                  )}
                  <em>
                    {story.status === "Hoàn thành"
                      ? "✔ Hoàn thành"
                      : "🔄 Đang ra"}
                  </em>
                </span>
              </Link>
              <br />
              <span className="phan-loai-label">Phân loại: </span>
              <div style={{ wordBreak: "break-word", marginTop: "3px" }}>
                {story.genres.map((g) => (
                  <Link key={g} href={`/?genre=${encodeURIComponent(g)}`}>
                    <span className="theloai">{g}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {/* PAGINATION */}
      <Suspense>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>

      {/* ===== 2. DANH MỤC & TOP CÁC THỨ (ở dưới, chỉ trang 1 không filter) ===== */}
      {!hasFilters && currentPage === 1 && (
        <>
          {/* --- Thể loại chính --- */}
          <div className="phdr" style={{ marginTop: "8px" }}>
            <strong>Thể loại</strong>
          </div>
          <div className="bai-viet-box" style={{ marginBottom: "4px" }}>
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bai-viet-box"
                style={{ margin: "2px 0", padding: "4px 8px" }}
              >
                <h3>
                  <em>
                    <Link
                      href={`/?category=${encodeURIComponent(cat.name)}`}
                      title={cat.name}
                    >
                      {cat.name}
                    </Link>
                  </em>
                </h3>
              </div>
            ))}
          </div>

          {/* --- Thể loại được xem nhiều --- */}
          <div className="phdr">
            <strong>Thể Loại Truyện Được Xem Nhiều</strong>
          </div>
          <div className="bai-viet-box" style={{ marginBottom: "4px" }}>
            {genresWithCount.slice(0, 20).map((g, idx) => (
              <div key={g.name} className="list2">
                <em style={{ color: "red" }}>Top {idx + 1}:</em>{" "}
                <strong>
                  <Link href={`/?genre=${encodeURIComponent(g.name)}`}>
                    {g.name}
                  </Link>
                </strong>
                <span style={{ color: "#6c8661", fontSize: "11px" }}>
                  {" "}({g.count} truyện)
                </span>
              </div>
            ))}
          </div>

          {/* --- Top tác giả --- */}
          {authorsWithCount.length > 0 && (
            <>
              <div className="phdr">
                <strong>Top Tác Giả</strong>
              </div>
              <div className="bai-viet-box" style={{ marginBottom: "4px" }}>
                {authorsWithCount.slice(0, 10).map((a, idx) => (
                  <div key={a.name} className="list2">
                    <em style={{ color: "red" }}>Top {idx + 1}:</em>{" "}
                    <strong>
                      <Link href={`/?author=${encodeURIComponent(a.name)}`}>
                        {a.name}
                      </Link>
                    </strong>
                    <span style={{ color: "#6c8661", fontSize: "11px" }}>
                      {" "}({a.count} truyện)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
