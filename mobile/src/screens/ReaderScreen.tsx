import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Slider,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, Shadow } from '../utils/theme';
import {
  loadChapterContent,
  isBookmarked,
  saveBookmark,
  removeBookmark,
  saveReaderSettings,
  getReaderSettings,
  updateHistory,
  ReaderSettings,
  StoryMeta,
  ChapterInfo,
} from '../hooks/useData';

interface ReaderScreenProps {
  navigation: any;
  route: {
    params: {
      story: StoryMeta;
      chapter: ChapterInfo;
      totalChapters: number;
    };
  };
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const READER_THEMES = {
  dark: { bg: '#0D1117', text: '#D1D5DB', headerBg: '#161B22', statusBar: 'light-content' as const },
  light: { bg: '#FAFAFA', text: '#111827', headerBg: '#FFFFFF', statusBar: 'dark-content' as const },
  sepia: { bg: '#F5E6C8', text: '#3D2B1F', headerBg: '#EDD9A3', statusBar: 'dark-content' as const },
};

export default function ReaderScreen({ navigation, route }: ReaderScreenProps) {
  const { story, chapter: initialChapter, totalChapters } = route.params;
  const [chapter, setChapter] = useState(initialChapter);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({ fontSize: 17, theme: 'dark' });

  const scrollRef = useRef<ScrollView>(null);
  const uiOpacity = useRef(new Animated.Value(1)).current;

  const theme = READER_THEMES[settings.theme];

  // Load settings on mount
  useEffect(() => {
    getReaderSettings().then(s => setSettings(s));
  }, []);

  // Load chapter content
  useEffect(() => {
    setLoading(true);
    setContent('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    loadChapterContent(story.slug, chapter.number).then(data => {
      if (data) setContent(data.content);
      setLoading(false);
    });

    isBookmarked(story.slug, chapter.number).then(setBookmarked);

    // Update history
    updateHistory({
      slug: story.slug,
      title: story.title,
      lastChapter: chapter.number,
      lastChapterTitle: chapter.title,
      readAt: Date.now(),
    });
  }, [chapter, story]);

  const toggleUI = useCallback(() => {
    const next = !showUI;
    setShowUI(next);
    Animated.timing(uiOpacity, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showUI, uiOpacity]);

  const toggleBookmark = useCallback(async () => {
    if (bookmarked) {
      await removeBookmark(story.slug, chapter.number);
      setBookmarked(false);
    } else {
      await saveBookmark({
        slug: story.slug,
        title: story.title,
        chapterNum: chapter.number,
        chapterTitle: chapter.title,
        savedAt: Date.now(),
      });
      setBookmarked(true);
    }
  }, [bookmarked, story, chapter]);

  const goToChapter = useCallback((num: number) => {
    if (num < 1 || num > totalChapters) return;
    setChapter({ number: num, title: `Chương ${num}` });
  }, [totalChapters]);

  const updateSettings = useCallback(async (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveReaderSettings(updated);
  }, [settings]);

  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.headerBg} />

      {/* Top Header */}
      <Animated.View style={[styles.topBar, { backgroundColor: theme.headerBg, opacity: uiOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={[styles.navBtnText, { color: Colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.storyTitleSmall, { color: theme.text }]} numberOfLines={1}>
            {story.title}
          </Text>
          <Text style={[styles.chapterLabel, { color: Colors.textMuted }]}>
            Chương {chapter.number}/{totalChapters}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleBookmark} style={styles.navBtn}>
          <Text style={styles.bookmarkIcon}>{bookmarked ? '🔖' : '📄'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.navBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={[styles.content, { backgroundColor: theme.bg }]}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => showUI && toggleUI()}
      >
        <TouchableOpacity activeOpacity={1} onPress={toggleUI}>
          {/* Chapter Title */}
          <Text style={[styles.chapterTitle, { color: Colors.primary, fontSize: settings.fontSize + 2 }]}>
            {chapter.title}
          </Text>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={{ color: Colors.textMuted, marginTop: 12 }}>Đang tải chương...</Text>
            </View>
          ) : paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <Text
                key={i}
                style={[
                  styles.paragraph,
                  { color: theme.text, fontSize: settings.fontSize, lineHeight: settings.fontSize * 1.8 }
                ]}
              >
                {para.trim()}
              </Text>
            ))
          ) : (
            <Text style={[styles.paragraph, { color: Colors.textMuted }]}>
              Không thể tải nội dung chương này.
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <Animated.View style={[styles.bottomBar, { backgroundColor: theme.headerBg, opacity: uiOpacity }]}>
        <TouchableOpacity
          style={[styles.chapterNavBtn, chapter.number <= 1 && styles.disabledBtn]}
          onPress={() => goToChapter(chapter.number - 1)}
          disabled={chapter.number <= 1}
        >
          <Text style={[styles.chapterNavText, chapter.number <= 1 && styles.disabledText]}>
            ‹ Trước
          </Text>
        </TouchableOpacity>

        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>
            {chapter.number} / {totalChapters}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.chapterNavBtn, chapter.number >= totalChapters && styles.disabledBtn]}
          onPress={() => goToChapter(chapter.number + 1)}
          disabled={chapter.number >= totalChapters}
        >
          <Text style={[styles.chapterNavText, chapter.number >= totalChapters && styles.disabledText]}>
            Sau ›
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={[styles.settingsPanel, { backgroundColor: Colors.bgCard }]} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsPanelTitle}>Cài đặt đọc truyện</Text>

            {/* Font Size */}
            <Text style={styles.settingsLabel}>Cỡ chữ: {settings.fontSize}px</Text>
            <View style={styles.fontSizeRow}>
              {[13, 15, 17, 19, 21, 23].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontSizeBtn, settings.fontSize === size && styles.fontSizeBtnActive]}
                  onPress={() => updateSettings({ fontSize: size })}
                >
                  <Text style={[styles.fontSizeBtnText, settings.fontSize === size && styles.fontSizeBtnTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme */}
            <Text style={styles.settingsLabel}>Giao diện</Text>
            <View style={styles.themeRow}>
              {(['dark', 'light', 'sepia'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.themeBtn, { backgroundColor: READER_THEMES[t].bg }, settings.theme === t && styles.themeBtnActive]}
                  onPress={() => updateSettings({ theme: t })}
                >
                  <Text style={[styles.themeBtnText, { color: READER_THEMES[t].text }]}>
                    {t === 'dark' ? '🌙 Tối' : t === 'light' ? '☀️ Sáng' : '📜 Sepia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '44',
    gap: 4,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  storyTitleSmall: {
    fontSize: 13,
    fontWeight: '700',
  },
  chapterLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  bookmarkIcon: { fontSize: 18 },
  settingsIcon: { fontSize: 18 },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  chapterTitle: {
    fontWeight: '800',
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 28,
  },
  paragraph: {
    marginBottom: Spacing.lg,
    textAlign: 'justify',
    letterSpacing: 0.3,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingTop: 60,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '44',
  },
  chapterNavBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...Shadow.small,
  },
  disabledBtn: {
    backgroundColor: Colors.bgSurface,
  },
  chapterNavText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledText: {
    color: Colors.textMuted,
  },
  progressWrap: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  settingsPanel: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 40,
  },
  settingsPanelTitle: {
    fontSize: Fonts.sizeMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fontSizeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fontSizeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
  },
  fontSizeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  fontSizeBtnText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  fontSizeBtnTextActive: {
    color: '#fff',
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  themeBtnActive: {
    borderColor: Colors.primary,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
