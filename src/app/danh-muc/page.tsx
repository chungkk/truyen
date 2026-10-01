import Link from "next/link";
import { getAllCategories, getGenresWithCount } from "@/lib/data";

export default async function DanhMucPage() {
  const categories = getAllCategories();
  const genres = getGenresWithCount();

  return (
    <div>
      {/* BREADCRUMB */}
      <div className="bai-viet-box" style={{ marginBottom: "4px", fontSize: "12px" }}>
        <Link href="/">Trang chủ</Link>
        {" » "}
        <strong>Danh mục</strong>
      </div>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <>
          <div className="phdr">
            <strong>Phân loại ({categories.length})</strong>
          </div>
          <div className="bai-viet-box" style={{ marginBottom: "8px" }}>
            <div style={{ wordBreak: "break-word" }}>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                >
                  <span className="theloai">
                    {cat.name}{" "}
                    <strong style={{ color: "#008000" }}>({cat.count})</strong>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* GENRES */}
      <div className="phdr">
        <strong>Thể loại ({genres.length})</strong>
      </div>
      <div className="bai-viet-box">
        <div style={{ wordBreak: "break-word" }}>
          {genres.map((g) => (
            <Link
              key={g.name}
              href={`/?genre=${encodeURIComponent(g.name)}`}
            >
              <span className="theloai">
                {g.name}{" "}
                <strong style={{ color: "#008000" }}>({g.count})</strong>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* GENRE LIST (Table view) */}
      <div className="phdr" style={{ marginTop: "6px" }}>
        <strong>Chi tiết thể loại</strong>
      </div>
      <div className="bai-viet-box">
        {genres.map((g) => (
          <div key={g.name} className="list2">
            <Link href={`/?genre=${encodeURIComponent(g.name)}`}>
              <strong>{g.name}</strong>
            </Link>
            {" "}
            <span style={{ color: "#6c8661", fontSize: "11px" }}>
              — {g.count} truyện
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
