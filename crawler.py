import requests
from bs4 import BeautifulSoup
import os
import sys
import time
import re
import json

BASE_URL = "https://truyensex18.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

PROGRESS_FILE = "output/crawl_progress.json"


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed_stories": [], "current_page": 1}


def save_progress(progress):
    os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def get_stories_from_page(page_num):
    """Lấy danh sách URL truyện từ trang listing."""
    url = f"{BASE_URL}/truyen-moi?page={page_num}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    stories = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if not href.startswith(BASE_URL + "/"):
            continue
        slug = href.replace(BASE_URL + "/", "").strip("/")
        # Bỏ qua link không phải truyện
        if not slug or "/" in slug or slug in (
            "truyen-moi", "truyen-da-hoan-thanh", "fillter", "history"
        ) or slug.startswith(("danh-muc/", "the-loai/", "tac-gia/", "top/", "image/")):
            continue
        full_url = f"{BASE_URL}/{slug}"
        if full_url not in stories:
            stories.append(full_url)

    return stories


def get_all_story_urls():
    """Lấy toàn bộ URL truyện bằng cách duyệt qua tất cả trang."""
    all_urls = []
    seen = set()
    page = 1

    while True:
        print(f"[*] Đang quét trang listing {page}...")
        try:
            stories = get_stories_from_page(page)
        except Exception as e:
            print(f"[!] Lỗi trang {page}: {e}")
            break

        if not stories:
            print(f"[*] Trang {page} không có truyện, kết thúc quét.")
            break

        new_count = 0
        for url in stories:
            if url not in seen:
                seen.add(url)
                all_urls.append(url)
                new_count += 1

        print(f"    -> {new_count} truyện mới (tổng: {len(all_urls)})")

        if new_count == 0:
            break

        page += 1
        time.sleep(0.5)

    return all_urls


def get_story_metadata(story_url):
    """Lấy metadata từ trang chính của truyện (tác giả, thể loại, phân loại)."""
    resp = requests.get(story_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    metadata = {"url": story_url, "title": "", "author": "", "genres": [], "categories": [], "status": ""}

    title_tag = soup.find("h1")
    if title_tag:
        metadata["title"] = title_tag.get_text(strip=True)

    # Parse metadata từ các grid row trong phần thông tin truyện
    seen_labels = set()
    grid_rows = soup.find_all("div", class_=lambda c: c and "grid" in c and "grid-cols-1" in c)
    for row in grid_rows:
        label_span = row.find("span", class_=lambda c: c and "font-semibold" in c)
        if not label_span:
            continue
        label = label_span.get_text(strip=True)
        if label in seen_labels:
            break
        seen_labels.add(label)

        links = row.find_all("a", href=True)
        if label == "Tác giả":
            for a in links:
                if "/tac-gia/" in a["href"]:
                    metadata["author"] = a.get_text(strip=True)
                    break
        elif label == "Thể loại":
            for a in links:
                if "/the-loai/" in a["href"]:
                    text = a.get_text(strip=True)
                    if text and text not in metadata["genres"]:
                        metadata["genres"].append(text)
        elif label == "Phân loại":
            for a in links:
                href = a["href"]
                if "/danh-muc/" in href or "truyen-sex" in href:
                    text = a.get_text(strip=True)
                    if text and text not in metadata["categories"]:
                        metadata["categories"].append(text)
        elif label == "Tình trạng":
            row_text = row.get_text(strip=True).replace(label, "").strip()
            metadata["status"] = row_text

    return metadata


def get_chapter_list(story_url):
    """Lấy danh sách chapter từ trang chapter đầu tiên."""
    resp = requests.get(f"{story_url}/chapter-1", headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    chapters = []
    select = soup.find("select")
    if select:
        for opt in select.find_all("option"):
            val = opt.get("value", "")
            text = opt.get_text(strip=True)
            if val:
                chapters.append((text, val))
        chapters.sort(key=lambda x: int(re.search(r"chapter-(\d+)", x[1]).group(1)) if re.search(r"chapter-(\d+)", x[1]) else 0)

    if not chapters:
        for a in soup.find_all("a", href=True):
            href = a["href"]
            match = re.search(r"/chapter-(\d+)", href)
            if match:
                num = int(match.group(1))
                full_url = href if href.startswith("http") else f"{BASE_URL}{href}"
                chapters.append((f"Chapter {num}", full_url))
        seen = set()
        unique = []
        for name, url in chapters:
            if url not in seen:
                seen.add(url)
                unique.append((name, url))
        chapters = sorted(unique, key=lambda x: int(re.search(r"chapter-(\d+)", x[1]).group(1)))

    return chapters


def get_story_title(story_url):
    """Lấy tên truyện từ trang chapter 1."""
    resp = requests.get(f"{story_url}/chapter-1", headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)
        title = re.split(r"\s*[–\-|]", title)[0].strip()
        return title
    return "truyen"


def get_chapter_content(chapter_url):
    """Lấy nội dung text của một chapter."""
    resp = requests.get(chapter_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    content_div = None
    for selector in ["div.chapter-content", "div.reading-content", "div.text-content",
                     "div.entry-content", "div.content", "article"]:
        content_div = soup.select_one(selector)
        if content_div:
            break

    if not content_div:
        divs = soup.find_all("div")
        max_p = 0
        for d in divs:
            p_count = len(d.find_all("p", recursive=False))
            if p_count > max_p:
                max_p = p_count
                content_div = d

    if not content_div:
        return ""

    paragraphs = content_div.find_all("p")
    if paragraphs:
        lines = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
    else:
        lines = [content_div.get_text(separator="\n").strip()]

    return "\n\n".join(lines)


def crawl_story(story_url, output_dir="output"):
    """Crawl toàn bộ truyện và lưu ra file."""
    print(f"\n[*] Đang lấy thông tin truyện từ: {story_url}")

    # Lấy metadata từ trang chính
    metadata = {}
    try:
        metadata = get_story_metadata(story_url)
        title = metadata.get("title", "")
        print(f"[*] Tên truyện: {title}")
        print(f"[*] Tác giả: {metadata.get('author', 'N/A')}")
        print(f"[*] Thể loại: {', '.join(metadata.get('genres', []))}")
        print(f"[*] Phân loại: {', '.join(metadata.get('categories', []))}")
    except Exception as e:
        print(f"[!] Không lấy được metadata: {e}")
        title = ""

    if not title:
        try:
            title = get_story_title(story_url)
        except Exception:
            title = story_url.rstrip("/").split("/")[-1]

    try:
        chapters = get_chapter_list(story_url)
    except Exception as e:
        print(f"[!] Không lấy được danh sách chapter: {e}")
        return False

    if not chapters:
        print("[!] Không tìm thấy chapter nào.")
        return False

    print(f"[*] Tìm thấy {len(chapters)} chapter")

    safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')
    story_dir = os.path.join(output_dir, safe_title or "truyen")
    os.makedirs(story_dir, exist_ok=True)

    # Lưu metadata
    if metadata:
        metadata["num_chapters"] = len(chapters)
        meta_file = os.path.join(story_dir, "metadata.json")
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

    # Header cho file tổng hợp
    header_lines = [f"# {title}"]
    if metadata:
        if metadata.get("author"):
            header_lines.append(f"Tác giả: {metadata['author']}")
        if metadata.get("genres"):
            header_lines.append(f"Thể loại: {', '.join(metadata['genres'])}")
        if metadata.get("categories"):
            header_lines.append(f"Phân loại: {', '.join(metadata['categories'])}")
        if metadata.get("status"):
            header_lines.append(f"Tình trạng: {metadata['status']}")
    header_lines.append("")
    all_content = ["\n".join(header_lines)]

    for i, (ch_name, ch_url) in enumerate(chapters, 1):
        if not ch_url.startswith("http"):
            ch_url = f"{BASE_URL}{ch_url}"

        print(f"  [{i}/{len(chapters)}] Đang crawl: {ch_name} ...")
        try:
            content = get_chapter_content(ch_url)
            if content:
                ch_file = os.path.join(story_dir, f"chapter_{i:03d}.txt")
                with open(ch_file, "w", encoding="utf-8") as f:
                    f.write(f"{ch_name}\n{'=' * 40}\n\n{content}")

                all_content.append(f"\n\n{'=' * 60}\n{ch_name}\n{'=' * 60}\n\n{content}")
                print(f"    -> OK ({len(content)} ký tự)")
            else:
                print(f"    -> Không lấy được nội dung!")
        except Exception as e:
            print(f"    -> Lỗi: {e}")

        time.sleep(1)

    full_file = os.path.join(story_dir, f"{safe_title}_full.txt")
    with open(full_file, "w", encoding="utf-8") as f:
        f.write("\n".join(all_content))

    print(f"[*] Hoàn tất! Đã lưu vào: {story_dir}")
    print(f"    - {len(chapters)} file chapter riêng")
    print(f"    - 1 file tổng hợp: {full_file}")
    print(f"    - metadata.json")
    return True


def crawl_all(output_dir="output"):
    """Crawl toàn bộ truyện trên site, có resume."""
    progress = load_progress()
    completed = set(progress["completed_stories"])
    print(f"[*] Đã crawl trước đó: {len(completed)} truyện")

    print("[*] Bắt đầu quét danh sách truyện...")
    all_urls = get_all_story_urls()
    print(f"[*] Tổng cộng: {len(all_urls)} truyện")

    remaining = [u for u in all_urls if u not in completed]
    print(f"[*] Còn lại cần crawl: {len(remaining)} truyện")

    for idx, story_url in enumerate(remaining, 1):
        print(f"\n{'#' * 60}")
        print(f"# [{idx}/{len(remaining)}] {story_url}")
        print(f"{'#' * 60}")

        try:
            crawl_story(story_url, output_dir)
        except Exception as e:
            print(f"[!] Lỗi crawl truyện {story_url}: {e}")

        completed.add(story_url)
        progress["completed_stories"] = list(completed)
        save_progress(progress)

        time.sleep(1)

    print(f"\n[*] HOÀN TẤT! Đã crawl {len(completed)} truyện.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1].rstrip("/")
        if arg == "--all":
            crawl_all()
        else:
            crawl_story(arg)
    else:
        crawl_all()
