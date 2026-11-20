"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDanhMuc = pathname === "/danh-muc" || pathname.startsWith("/danh-muc/");

  return (
    <div className="navbar1">
      <Link href="/" title="Trang chủ">
        <span className={`item${!isDanhMuc ? " selected" : ""}`}>Trang chủ</span>
      </Link>
      <Link href="/danh-muc" title="Danh mục">
        <span className={`item${isDanhMuc ? " selected" : ""}`}>Danh mục</span>
      </Link>
    </div>
  );
}
