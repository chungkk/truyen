#!/usr/bin/env python3
"""
Export story chapter CONTENT to JSON for React Native mobile app.
This exports the full text content of each chapter.

Usage:
  python3 export_chapters_content.py [--slug SLUG]  # Export specific story
  python3 export_chapters_content.py                 # Export all stories

Output: mobile/src/data/chapters/<slug>/chapter_NNN.json
Each JSON: {"title": "...", "content": "..."}
"""

import os
import json
import glob
import re
import argparse

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
MOBILE_CONTENT_DIR = os.path.join(os.path.dirname(__file__), "mobile", "src", "data", "chapters")

def parse_chapter_file(filepath):
    """Parse a chapter .txt file into title + content."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            raw = f.read()
        lines = raw.split("\n")
        title = lines[0].strip() if lines else ""
        # Skip separator line (====...)
        content_start = next(
            (i for i, l in enumerate(lines) if i > 0 and not l.startswith("=") and l.strip()),
            1
        )
        content = "\n".join(lines[content_start:]).strip()
        return {"title": title, "content": content}
    except Exception as e:
        return None

def export_story(slug):
    story_dir = os.path.join(OUTPUT_DIR, slug)
    out_dir = os.path.join(MOBILE_CONTENT_DIR, slug)
    os.makedirs(out_dir, exist_ok=True)

    chapter_files = glob.glob(os.path.join(story_dir, "chapter_*.txt"))
    count = 0
    for cf in chapter_files:
        match = re.search(r"chapter_(\d+)\.txt$", os.path.basename(cf))
        if not match:
            continue
        num = int(match.group(1))
        data = parse_chapter_file(cf)
        if not data:
            continue

        out_path = os.path.join(out_dir, f"chapter_{str(num).zfill(3)}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        count += 1

    return count

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Export specific story by slug")
    args = parser.parse_args()

    os.makedirs(MOBILE_CONTENT_DIR, exist_ok=True)

    if args.slug:
        n = export_story(args.slug)
        print(f"Exported {n} chapters for '{args.slug}'")
        return

    story_dirs = [d for d in os.listdir(OUTPUT_DIR) if os.path.isdir(os.path.join(OUTPUT_DIR, d))]
    total_chapters = 0
    for i, slug in enumerate(sorted(story_dirs)):
        n = export_story(slug)
        total_chapters += n
        if (i + 1) % 100 == 0:
            print(f"  Progress: {i+1}/{len(story_dirs)} stories, {total_chapters} chapters...")

    print(f"\nDone! Exported {total_chapters} chapters from {len(story_dirs)} stories")
    print(f"Output: {MOBILE_CONTENT_DIR}/")

if __name__ == "__main__":
    main()
