"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

interface Props {
  genres: string[];
  authors: string[];
}

export default function SearchAndFilter({ genres, authors }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQ = searchParams.get("q") || "";
  const urlGenre = searchParams.get("genre") || "";
  const urlAuthor = searchParams.get("author") || "";
  const urlCategory = searchParams.get("category") || "";

  // Track in-progress typing tied to the current URL query so external URL
  // changes (e.g. "[Xóa bộ lọc]" or tag clicks) reset the input automatically.
  const [draft, setDraft] = useState<{ base: string; value: string } | null>(null);
  const search = draft && draft.base === urlQ ? draft.value : urlQ;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const applyFilters = useCallback(
    (q: string, g: string, a: string, replace = false) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (g) params.set("genre", g);
      if (a) params.set("author", a);
      if (urlCategory) params.set("category", urlCategory);
      if (params.toString()) params.set("page", "1");

      const target = params.toString() ? `/?${params.toString()}` : "/";
      startTransition(() => {
        if (replace) {
          router.replace(target);
        } else {
          router.push(target);
        }
      });
    },
    [router, urlCategory]
  );

  const handleSearchChange = (value: string) => {
    setDraft({ base: urlQ, value });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(value, urlGenre, urlAuthor, true);
    }, 300);
  };

  const handleImmediateSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFilters(search, urlGenre, urlAuthor, false);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm tên truyện, tác giả..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleImmediateSearch();
        }}
        style={{ flex: 1, minWidth: "160px" }}
      />
      <select
        value={urlGenre}
        onChange={(e) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          applyFilters(search, e.target.value, urlAuthor, false);
        }}
      >
        <option value="">-- Thể loại --</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        value={urlAuthor}
        onChange={(e) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          applyFilters(search, urlGenre, e.target.value, false);
        }}
      >
        <option value="">-- Tác giả --</option>
        {authors.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <button className="search-btn" onClick={handleImmediateSearch}>
        Tìm
      </button>
      {isPending && (
        <span style={{ fontSize: "12px", color: "#71bc00", alignSelf: "center" }}>
          Đang tìm...
        </span>
      )}
    </div>
  );
}
