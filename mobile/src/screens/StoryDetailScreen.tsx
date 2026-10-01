import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, Shadow } from '../utils/theme';
import { loadChapterList, updateHistory, ChapterInfo, StoryMeta } from '../hooks/useData';

interface StoryDetailProps {
  navigation: any;
  route: { params: { story: StoryMeta } };
}

export default function StoryDetailScreen({ navigation, route }: StoryDetailProps) {
  const { story } = route.params;
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapterList(story.slug).then(chs => {
      setChapters(chs);
      setLoading(false);
    });
  }, [story.slug]);

  const openChapter = useCallback((chapter: ChapterInfo) => {
    // Update history
    updateHistory({
      slug: story.slug,
      title: story.title,
      lastChapter: chapter.number,
      lastChapterTitle: chapter.title,
      readAt: Date.now(),
    });
    navigation.navigate('Reader', { story, chapter, totalChapters: chapters.length });
  }, [story, chapters, navigation]);

  const renderChapter = useCallback(({ item, index }: { item: ChapterInfo; index: number }) => (
    <TouchableOpacity
      style={styles.chapterRow}
      onPress={() => openChapter(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chapterNumber}>
        <Text style={styles.chapterNumberText}>{item.number}</Text>
      </View>
      <Text style={styles.chapterTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.chapterArrow}>›</Text>
    </TouchableOpacity>
  ), [openChapter]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Mục lục</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Story Info */}
      <View style={styles.storyInfo}>
        <View style={styles.coverLarge}>
          <Text style={styles.coverLargeInitial}>{story.title.charAt(0)}</Text>
        </View>

        <View style={styles.storyMeta}>
          <Text style={styles.storyTitle}>{story.title}</Text>
          {story.author ? <Text style={styles.storyAuthor}>✍️ {story.author}</Text> : null}

          <View style={styles.tagsRow}>
            {story.genres.slice(0, 3).map(g => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statItem}>📖 {story.num_chapters} chương</Text>
            {story.status ? (
              <Text style={[styles.statItem, story.status === 'Hoàn thành' ? styles.done : styles.ongoing]}>
                {story.status === 'Hoàn thành' ? '✅' : '🔄'} {story.status}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Read First / Continue Button */}
      {chapters.length > 0 && (
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => openChapter(chapters[0])}
          activeOpacity={0.8}
        >
          <Text style={styles.readBtnText}>▶  Đọc từ đầu</Text>
        </TouchableOpacity>
      )}

      {/* Chapter List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách chương ({chapters.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={chapters}
          renderItem={renderChapter}
          keyExtractor={item => String(item.number)}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={10}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: Colors.primary,
    lineHeight: 36,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Fonts.sizeMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  storyInfo: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coverLarge: {
    width: 90,
    height: 120,
    backgroundColor: Colors.primary + '33',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  coverLargeInitial: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  storyMeta: {
    flex: 1,
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: Fonts.sizeMedium,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  storyAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tag: {
    backgroundColor: Colors.tagBg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.tagBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: Colors.tagText,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  statItem: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  done: {
    color: Colors.success,
  },
  ongoing: {
    color: Colors.warning,
  },
  readBtn: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.medium,
  },
  readBtnText: {
    fontSize: Fonts.sizeBase,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '66',
    gap: Spacing.md,
  },
  chapterNumber: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  chapterNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textAccent,
  },
  chapterTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  chapterArrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
});
