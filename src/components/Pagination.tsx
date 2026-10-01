"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="phantrang">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)}>
          « Trang trước
        </Link>
      )}
      {" "}
      {pages.map((p, i) =>
        typeof p === "string" ? (
          <span key={`dot-${i}`} style={{ margin: "0 2px", color: "#666" }}>
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={p === currentPage ? "page-numbers current" : "page-numbers"}
          >
            {p}
          </Link>
        )
      )}
      {" "}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)}>
          Trang sau »
        </Link>
      )}
    </div>
  );
}
