import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, Spacing, Fonts, Radius } from '../utils/theme';
import { useStoriesIndex } from '../hooks/useData';

const metaJson = require('../data/meta.json');
const PAGE_SIZE = 30;

interface Props { navigation: any; }

export default function CategoriesScreen({ navigation }: Props) {
  const { stories } = useStoriesIndex();
  const genres: string[] = useMemo(() => metaJson?.genres || [], []);

  // Count stories per genre
  const genreCounts = useMemo(() => {
    const map: Record<string, number> = {};
    stories.forEach(s => s.genres.forEach(g => { map[g] = (map[g] || 0) + 1; }));
    return map;
  }, [stories]);

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filteredStories = useMemo(() => {
    if (!selectedGenre) return [];
    return stories.filter(s => s.genres.includes(selectedGenre));
  }, [stories, selectedGenre]);

  const totalPages = Math.ceil(filteredStories.length / PAGE_SIZE);
  const paged = useMemo(() => filteredStories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredStories, page]);

  const selectGenre = (g: string) => {
    setSelectedGenre(g === selectedGenre ? null : g);
    setPage(1);
  };

  const renderGenreList = () => (
    <FlatList
      data={genres}
      keyExtractor={g => g}
      numColumns={2}
      renderItem={({ item: g }) => (
        <TouchableOpacity
          style={[styles.genreCard, selectedGenre === g && styles.genreCardActive]}
          onPress={() => selectGenre(g)}
        >
          <Text style={[styles.genreName, selectedGenre === g && styles.genreNameActive]} numberOfLines={2}>
            {g}
          </Text>
          <Text style={[styles.genreCount, selectedGenre === g && styles.genreCountActive]}>
            {genreCounts[g] || 0} truyện
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: Spacing.sm, gap: Spacing.sm }}
      columnWrapperStyle={{ gap: Spacing.sm }}
    />
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return (
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.pageBtn, page === 1 && { opacity: 0.4 }]} onPress={() => page > 1 && setPage(page - 1)} disabled={page === 1}>
          <Text style={styles.pageBtnText}>‹</Text>
        </TouchableOpacity>
        {start > 1 && <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(1)}><Text style={styles.pageBtnText}>1</Text></TouchableOpacity>}
        {pages.map(p => (
          <TouchableOpacity key={p} style={[styles.pageBtn, p === page && styles.pageBtnActive]} onPress={() => setPage(p)}>
            <Text style={[styles.pageBtnText, p === page && styles.pageBtnTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
        {end < totalPages && <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(totalPages)}><Text style={styles.pageBtnText}>{totalPages}</Text></TouchableOpacity>}
        <TouchableOpacity style={[styles.pageBtn, page === totalPages && { opacity: 0.4 }]} onPress={() => page < totalPages && setPage(page + 1)} disabled={page === totalPages}>
          <Text style={styles.pageBtnText}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStoryList = () => (
    <View style={{ flex: 1 }}>
      {/* Back to genre list */}
      <TouchableOpacity style={styles.backBar} onPress={() => setSelectedGenre(null)}>
        <Text style={styles.backText}>‹ Tất cả thể loại</Text>
        <Text style={styles.backCount}>{filteredStories.length} truyện · Trang {page}/{totalPages}</Text>
      </TouchableOpacity>

      <FlatList
        data={paged}
        keyExtractor={s => s.slug}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.storyRow}
            onPress={() => navigation.navigate('StoryDetail', { story: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.storyNum}>{(page - 1) * PAGE_SIZE + index + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.storySub}>{item.author} · {item.num_chapters} chương</Text>
            </View>
            <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={renderPagination}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgHeader} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedGenre ? `📂 ${selectedGenre}` : '📂 Danh Mục'}
        </Text>
      </View>
      {selectedGenre ? renderStoryList() : renderGenreList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    backgroundColor: Colors.bgHeader,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: Fonts.sizeLarge, fontWeight: '800', color: '#fff' },

  // Genre grid
  genreCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 64,
    justifyContent: 'center',
  },
  genreCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  genreName: { fontSize: Fonts.sizeBase, fontWeight: '700', color: Colors.textAccent },
  genreNameActive: { color: '#fff' },
  genreCount: { fontSize: Fonts.size12, color: Colors.textMuted, marginTop: 2 },
  genreCountActive: { color: 'rgba(255,255,255,0.85)' },

  // Back bar
  backBar: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backText: { fontSize: Fonts.sizeBase, color: '#fff', fontWeight: '700' },
  backCount: { fontSize: Fonts.size12, color: 'rgba(255,255,255,0.8)' },

  // Story rows
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  storyNum: { fontSize: Fonts.sizeSmall, color: Colors.textMuted, width: 24 },
  storyTitle: { fontSize: Fonts.sizeBase, fontWeight: '700', color: Colors.textAccent },
  storySub: { fontSize: Fonts.size12, color: Colors.textSecondary, marginTop: 2 },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: 4,
    backgroundColor: Colors.bgCard,
  },
  pageBtn: {
    minWidth: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: 8,
  },
  pageBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  pageBtnText: { fontSize: Fonts.sizeSmall, color: Colors.textPrimary, fontWeight: '600' },
  pageBtnTextActive: { color: '#fff' },
});
