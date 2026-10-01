#!/usr/bin/env python3
"""
Export story metadata to JSON for React Native mobile app.
Generates:
  - mobile/src/data/stories_index.json   (metadata only, no content)
  - mobile/src/data/chapters/<slug>.json (chapter list per story)
"""

import os
import json
import glob
import re

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
MOBILE_DATA_DIR = os.path.join(os.path.dirname(__file__), "mobile", "src", "data")
CHAPTERS_DIR = os.path.join(MOBILE_DATA_DIR, "chapters")

os.makedirs(MOBILE_DATA_DIR, exist_ok=True)
os.makedirs(CHAPTERS_DIR, exist_ok=True)

stories = []
genres_set = set()
categories_set = set()

story_dirs = sorted([
    d for d in os.listdir(OUTPUT_DIR)
    if os.path.isdir(os.path.join(OUTPUT_DIR, d))
])

print(f"Found {len(story_dirs)} story directories")

for slug in story_dirs:
    story_dir = os.path.join(OUTPUT_DIR, slug)
    meta_path = os.path.join(story_dir, "metadata.json")
    if not os.path.exists(meta_path):
        continue

    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except Exception as e:
        print(f"  Skip {slug}: {e}")
        continue

    # Collect chapter files
    chapter_files = sorted(
        glob.glob(os.path.join(story_dir, "chapter_*.txt")),
        key=lambda x: int(re.search(r"chapter_(\d+)", x).group(1))
    )

    chapters = []
    for cf in chapter_files:
        num_match = re.search(r"chapter_(\d+)", os.path.basename(cf))
        if not num_match:
            continue
        num = int(num_match.group(1))
        try:
            with open(cf, "r", encoding="utf-8") as f:
                first_line = f.readline().strip()
            chapters.append({"number": num, "title": first_line or f"Chương {num}"})
        except Exception:
            chapters.append({"number": num, "title": f"Chương {num}"})

    num_chapters = len(chapters)
    if num_chapters == 0:
        continue

    # Build story metadata entry WITH embedded chapter list
    story_meta = {
        "slug": slug,
        "title": meta.get("title", slug),
        "author": meta.get("author", ""),
        "genres": meta.get("genres", []),
        "categories": meta.get("categories", []),
        "status": meta.get("status", ""),
        "num_chapters": num_chapters,
        "chapters": chapters,  # embedded - no dynamic require needed
    }
    stories.append(story_meta)

    for g in meta.get("genres", []):
        genres_set.add(g)
    for c in meta.get("categories", []):
        categories_set.add(c)

    # Write per-story chapter index
    out_path = os.path.join(CHAPTERS_DIR, f"{slug}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(chapters, f, ensure_ascii=False, separators=(",", ":"))

# Sort stories by title (Vietnamese locale rough sort)
stories.sort(key=lambda s: s["title"].lower())

# Write stories index
index_path = os.path.join(MOBILE_DATA_DIR, "stories_index.json")
with open(index_path, "w", encoding="utf-8") as f:
    json.dump(stories, f, ensure_ascii=False, separators=(",", ":"))

# Write genres and categories lists
meta_path = os.path.join(MOBILE_DATA_DIR, "meta.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump({
        "genres": sorted(genres_set),
        "categories": sorted(categories_set),
        "total_stories": len(stories),
    }, f, ensure_ascii=False, separators=(",", ":"))

print(f"Exported {len(stories)} stories")
print(f"  -> {index_path}")
print(f"  -> {CHAPTERS_DIR}/ ({len(os.listdir(CHAPTERS_DIR))} files)")
print(f"  -> {meta_path}")
