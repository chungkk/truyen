import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSiteUrl } from "@/lib/site";
import "./site.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Truyện Online - Kho Truyện Hay Miễn Phí",
    template: "%s | Truyện Online",
  },
  description:
    "Đọc truyện online miễn phí, cập nhật liên tục mỗi ngày. Kho truyện hay, truyện mới nhất đầy đủ thể loại.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Truyện Online",
    title: "Truyện Online - Kho Truyện Hay Miễn Phí",
    description:
      "Đọc truyện online miễn phí, cập nhật liên tục mỗi ngày. Kho truyện hay, truyện mới nhất đầy đủ thể loại.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {/* LOGO / HEADER */}
        <div className="site-logo-wrap">
          <p style={{ margin: "4px 0" }}>
            <Link href="/" title="Truyện Online">
              <span className="site-logo-title">Truyện Online</span>
            </Link>
          </p>
          <h2 className="site-logo-subtitle">
            Truyện hay, đọc truyện mới miễn phí mỗi ngày
          </h2>
        </div>

        {/* NAVBAR */}
        <Navbar />

        {/* DISCLAIMER BOX */}
        <div style={{ background: "#fff", border: "1px solid #88beff", marginTop: "1px", marginBottom: "1px", padding: "6px 5px" }}>
          <div className="dulieu">
            <div className="box">
              Truyện ở trang web này tổng hợp từ nhiều nguồn khác nhau, tất cả
              các truyện ở đây đều là nội dung sáng tác. Vui lòng đọc truyện có
              trách nhiệm.
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div id="content">
          {children}
        </div>

        {/* FOOTER */}
        <footer className="site-footer">
          <div style={{ textAlign: "center", lineHeight: "1.8" }}>
            <div>
              Copyright &copy;{" "}
              <strong>
                <Link href="/">TruyenOnline</Link>
              </strong>{" "}
              {new Date().getFullYear()}
            </div>
            <div>
              Trang web tổng hợp truyện online miễn phí, cập nhật liên tục mỗi ngày.
            </div>
            <div>
              Đọc giả có nhu cầu gửi truyện đăng lên web hoặc đóng góp ý kiến xây dựng web, xin
              vui lòng gửi mail về địa chỉ email:{" "}
              <strong>
                <a href="mailto:contact@truyenonline.com" style={{ color: "#fff" }}>
                  contact@truyenonline.com
                </a>
              </strong>
            </div>
            <div>
              Liên hệ quảng cáo:{" "}
              <strong>
                <Link href="/">@truyenonline</Link>
              </strong>
            </div>
            <br />
            <div>
              <strong>Nhà Tài Trợ:</strong>
            </div>
            <div style={{ marginTop: "4px", fontSize: "12px" }}>
              <Link href="/">Trang chủ</Link>
              {" · "}
              <Link href="/danh-muc">Danh mục</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
