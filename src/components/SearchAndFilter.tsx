"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface Props {
  genres: string[];
  authors: string[];
}

export default function SearchAndFilter({ genres, authors }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");

  const applyFilters = useCallback(
    (q: string, g: string, a: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (g) params.set("genre", g);
      if (a) params.set("author", a);
      params.set("page", "1");
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router]
  );

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm tên truyện, tác giả..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          applyFilters(e.target.value, genre, author);
        }}
        style={{ flex: 1, minWidth: "160px" }}
      />
      <select
        value={genre}
        onChange={(e) => {
          setGenre(e.target.value);
          applyFilters(search, e.target.value, author);
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
        value={author}
        onChange={(e) => {
          setAuthor(e.target.value);
          applyFilters(search, genre, e.target.value);
        }}
      >
        <option value="">-- Tác giả --</option>
        {authors.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <button
        className="search-btn"
        onClick={() => applyFilters(search, genre, author)}
      >
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
