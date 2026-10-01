import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts } from '../utils/theme';
import { getBookmarks, getHistory, Bookmark, HistoryEntry } from '../hooks/useData';
import type { StoryMeta } from '../hooks/useData';

interface BookmarksScreenProps {
  navigation: any;
}

type Tab = 'history' | 'bookmarks';

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
  const [tab, setTab] = useState<Tab>('history');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const loadData = useCallback(async () => {
    const [bms, hist] = await Promise.all([getBookmarks(), getHistory()]);
    setBookmarks(bms);
    setHistory(hist);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  const openBookmark = useCallback((b: Bookmark) => {
    const storyMeta: StoryMeta = {
      slug: b.slug,
      title: b.title,
      author: '',
      genres: [],
      categories: [],
      status: '',
      num_chapters: 0,
    };
    navigation.navigate('Reader', {
      story: storyMeta,
      chapter: { number: b.chapterNum, title: b.chapterTitle },
      totalChapters: 999,
    });
  }, [navigation]);

  const openHistory = useCallback((h: HistoryEntry) => {
    const storyMeta: StoryMeta = {
      slug: h.slug,
      title: h.title,
      author: '',
      genres: [],
      categories: [],
      status: '',
      num_chapters: 0,
    };
    navigation.navigate('Reader', {
      story: storyMeta,
      chapter: { number: h.lastChapter, title: h.lastChapterTitle },
      totalChapters: 999,
    });
  }, [navigation]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity style={styles.item} onPress={() => openBookmark(item)} activeOpacity={0.75}>
      <View style={styles.itemIcon}>
        <Text style={styles.itemIconText}>🔖</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemSub} numberOfLines={1}>{item.chapterTitle}</Text>
        <Text style={styles.itemDate}>{formatDate(item.savedAt)}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderHistory = ({ item }: { item: HistoryEntry }) => (
    <TouchableOpacity style={styles.item} onPress={() => openHistory(item)} activeOpacity={0.75}>
      <View style={styles.itemIcon}>
        <Text style={styles.itemIconText}>📖</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemSub} numberOfLines={1}>
          Chương {item.lastChapter}: {item.lastChapterTitle}
        </Text>
        <Text style={styles.itemDate}>{formatDate(item.readAt)}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const emptyData = tab === 'bookmarks' ? bookmarks : history;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Thư viện</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            📖 Lịch sử đọc
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'bookmarks' && styles.tabActive]}
          onPress={() => setTab('bookmarks')}
        >
          <Text style={[styles.tabText, tab === 'bookmarks' && styles.tabTextActive]}>
            🔖 Đánh dấu
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'history' ? (
        <FlatList
          data={history}
          renderItem={renderHistory}
          keyExtractor={item => `${item.slug}-${item.readAt}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyText}>Chưa có lịch sử đọc</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmark}
          keyExtractor={item => `${item.slug}-${item.chapterNum}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyText}>Chưa có đánh dấu nào</Text>
              <Text style={styles.emptyHint}>Nhấn 🔖 khi đọc để lưu vị trí</Text>
            </View>
          }
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
    backgroundColor: Colors.bgHeader,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Fonts.sizeLarge,
    fontWeight: '800',
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Fonts.sizeSmall,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '66',
    gap: Spacing.md,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconText: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: Fonts.sizeBase,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Fonts.sizeMedium,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
});
