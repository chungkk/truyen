# 📚 TruyenApp - React Native iOS App

App đọc truyện iOS xây dựng bằng React Native CLI, lấy dữ liệu từ local JSON files được export từ crawler.

## 📱 Tính năng

- ✅ Danh sách truyện với tìm kiếm nhanh
- ✅ Lọc theo thể loại
- ✅ Đọc chương với điều hướng trước/sau
- ✅ Bookmark đánh dấu vị trí đọc
- ✅ Lịch sử đọc
- ✅ Tùy chỉnh font size (13–23px)
- ✅ 3 giao diện đọc: Tối / Sáng / Sepia
- ✅ Thiết kế premium dark mode (violet/indigo)

## 🏗️ Cấu trúc dự án

```
mobile/
├── App.tsx                    # Root app + navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Danh sách truyện + tìm kiếm
│   │   ├── StoryDetailScreen.tsx  # Chi tiết truyện + danh sách chương
│   │   ├── ReaderScreen.tsx   # Đọc chương + cài đặt
│   │   └── BookmarksScreen.tsx # Lịch sử + bookmark
│   ├── components/
│   │   └── StoryCard.tsx      # Card component cho truyện
│   ├── hooks/
│   │   └── useData.ts         # Data hooks + AsyncStorage
│   ├── utils/
│   │   └── theme.ts           # Design system (colors, fonts, spacing)
│   └── data/
│       ├── stories_index.json # Metadata tất cả truyện
│       ├── meta.json          # Genres + categories
│       └── chapters/          # Chapter list per story (slug.json)
└── ios/                       # iOS native code (auto-generated)
```

## 🚀 Setup

### Bước 1: Export dữ liệu từ crawler

```bash
cd /Users/chungkk/Code/truyen-crawler
python3 export_for_mobile.py
```

Script sẽ tạo:
- `mobile/src/data/stories_index.json` — metadata tất cả truyện
- `mobile/src/data/chapters/*.json` — danh sách chương per story
- `mobile/src/data/meta.json` — genres/categories

### Bước 2: Cài dependencies

```bash
cd mobile
npm install
```

### Bước 3: Cài pods (iOS)

```bash
cd ios && pod install && cd ..
```

### Bước 4: Chạy app

```bash
npm start
# Terminal khác:
npm run ios
```

## 📦 Xử lý content chương

> **Lưu ý:** App load chapter content qua `react-native-fs`. Có 3 lựa chọn:

### Option A: Bundle .txt files vào iOS app (offline hoàn toàn)
Kéo thư mục `output/` vào Xcode, chọn "Create folder references"

### Option B: Serve qua Next.js API (khuyến nghị cho dev)
Thêm API route: `web/src/app/api/chapter/[slug]/[chapter]/route.ts`

### Option C: Pre-export content vào JSON (tốt nhất cho production)
Sửa `export_for_mobile.py` để export cả nội dung chương.

## 🔧 Dependencies

| Package | Mục đích |
|---------|----------|
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Tab bar |
| `@react-native-async-storage/async-storage` | Bookmarks/settings |
| `react-native-fs` | Đọc file local |
| `react-native-screens` | Tối ưu navigation |
| `react-native-safe-area-context` | Safe area iPhone |

## 🎨 Design System

- **Primary:** Violet `#7C3AED`
- **Background:** Near-black `#0F0F1A`  
- **Reader themes:** Dark / Light / Sepia
