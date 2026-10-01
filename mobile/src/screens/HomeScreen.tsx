import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, Shadow } from '../utils/theme';
import { useStoriesIndex, useFilteredStories, StoryMeta } from '../hooks/useData';

const metaJson = require('../data/meta.json');
const PAGE_SIZE = 30;

interface Props { navigation: any; }

type Section = 'all' | 'genre' | 'status' | 'search';

export default function HomeScreen({ navigation }: Props) {
  const { stories, loading } = useStoriesIndex();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [section, setSection] = useState<Section>('all');
  const [page, setPage] = useState(1);

  const filtered = useFilteredStories(stories, query, selectedGenre, selectedStatus);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const genres: string[] = useMemo(() => metaJson?.genres || [], []);
  const statuses: string[] = ['Đang ra', 'Hoàn thành'];

  const resetPage = () => setPage(1);

  const onSearch = useCallback((text: string) => {
    setQuery(text);
    setSection(text ? 'search' : 'all');
    setSelectedGenre('');
    setSelectedStatus('');
    resetPage();
  }, []);

  const selectGenre = useCallback((g: string) => {
    if (selectedGenre === g) {
      setSelectedGenre('');
      setSection('all');
    } else {
      setSelectedGenre(g);
      setSelectedStatus('');
      setSection('genre');
    }
    resetPage();
  }, [selectedGenre]);

  const selectStatus = useCallback((s: string) => {
    if (selectedStatus === s) {
      setSelectedStatus('');
      setSection('all');
    } else {
      setSelectedStatus(s);
      setSelectedGenre('');
      setSection('status');
    }
    resetPage();
  }, [selectedStatus]);

  const openStory = useCallback((story: StoryMeta) => {
    navigation.navigate('StoryDetail', { story });
  }, [navigation]);

  const renderItem = useCallback(({ item, index }: { item: StoryMeta; index: number }) => (
    <TouchableOpacity style={styles.row} onPress={() => openStory(item)} activeOpacity={0.7}>
      <Text style={styles.rowNum}>{(page - 1) * PAGE_SIZE + index + 1}.</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {item.author ? `${item.author} · ` : ''}{item.num_chapters} chương
          {item.status ? ` · ${item.status}` : ''}
        </Text>
        {item.genres.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 3 }}>
            {item.genres.slice(0, 3).map(g => (
              <Text key={g} style={styles.tag}>{g}</Text>
            ))}
          </ScrollView>
        )}
      </View>
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  ), [page, openStory]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Show at most 5 page buttons around current page
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
          onPress={() => { if (page > 1) setPage(page - 1); }}
          disabled={page === 1}
        >
          <Text style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}>‹</Text>
        </TouchableOpacity>

        {start > 1 && (
          <>
            <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(1)}>
              <Text style={styles.pageBtnText}>1</Text>
            </TouchableOpacity>
            {start > 2 && <Text style={styles.pageDots}>…</Text>}
          </>
        )}

        {pages.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.pageBtn, p === page && styles.pageBtnActive]}
            onPress={() => setPage(p)}
          >
            <Text style={[styles.pageBtnText, p === page && styles.pageBtnTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <Text style={styles.pageDots}>…</Text>}
            <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(totalPages)}>
              <Text style={styles.pageBtnText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
          onPress={() => { if (page < totalPages) setPage(page + 1); }}
          disabled={page === totalPages}
        >
          <Text style={[styles.pageBtnText, page === totalPages && styles.pageBtnTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm tên truyện, tác giả..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={onSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Trạng thái */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>📋 TRẠNG THÁI</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {statuses.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedStatus === s && styles.chipActive]}
              onPress={() => selectStatus(s)}
            >
              <Text style={[styles.chipText, selectedStatus === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Thể loại */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>📚 THỂ LOẠI</Text>
        <View style={styles.genreGrid}>
          {genres.slice(0, 30).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genreBtn, selectedGenre === g && styles.genreBtnActive]}
              onPress={() => selectGenre(g)}
            >
              <Text style={[styles.genreText, selectedGenre === g && styles.genreTextActive]} numberOfLines={1}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kết quả */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {section === 'search' && query
            ? `🔍 "${query}": ${filtered.length} truyện`
            : section === 'genre' && selectedGenre
            ? `📂 ${selectedGenre}: ${filtered.length} truyện`
            : section === 'status' && selectedStatus
            ? `📋 ${selectedStatus}: ${filtered.length} truyện`
            : `📖 Tất cả: ${filtered.length} truyện`}
        </Text>
        <Text style={styles.resultPage}>Trang {page}/{totalPages || 1}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><Text style={styles.headerTitle}>📚 Đọc Truyện</Text></View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Đang tải danh sách truyện...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgHeader} />

      {/* Header xanh lá */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Đọc Truyện Online</Text>
        <Text style={styles.headerSub}>{stories.length.toLocaleString()} truyện</Text>
      </View>

      <FlatList
        data={paged}
        renderItem={renderItem}
        keyExtractor={item => item.slug}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderPagination}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={10}
        onScrollBeginDrag={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    backgroundColor: Colors.bgHeader,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: Fonts.sizeLarge, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: Fonts.sizeSmall, color: 'rgba(255,255,255,0.85)' },

  // Search
  searchRow: { padding: Spacing.md, backgroundColor: Colors.bgCard },
  searchInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Fonts.sizeBase,
    color: Colors.textPrimary,
  },

  // Section
  sectionBlock: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, backgroundColor: Colors.bgCard, marginBottom: 2 },
  sectionTitle: { fontSize: Fonts.size12, fontWeight: '700', color: Colors.primaryDark, marginBottom: Spacing.xs },

  // Status chips
  chipRow: { marginBottom: Spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    backgroundColor: Colors.bgSurface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  chipText: { fontSize: Fonts.sizeSmall, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // Genre grid
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingBottom: Spacing.md,
  },
  genreBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: Colors.bgSurface,
    maxWidth: 120,
  },
  genreBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  genreText: { fontSize: Fonts.size12, color: Colors.textSecondary },
  genreTextActive: { color: '#fff', fontWeight: '700' },

  // Result header
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryDark,
  },
  resultCount: { fontSize: Fonts.sizeSmall, color: '#fff', fontWeight: '700' },
  resultPage: { fontSize: Fonts.size12, color: 'rgba(255,255,255,0.8)' },

  // Story rows
  listContent: { paddingBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  rowNum: { fontSize: Fonts.sizeSmall, color: Colors.textMuted, width: 24, marginTop: 2 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: Fonts.sizeBase, fontWeight: '700', color: Colors.textAccent },
  rowMeta: { fontSize: Fonts.size12, color: Colors.textSecondary, marginTop: 2 },
  rowArrow: { fontSize: 18, color: Colors.textMuted, alignSelf: 'center' },

  // Tags
  tag: {
    fontSize: 11,
    color: Colors.primaryDark,
    backgroundColor: Colors.tagBg,
    borderWidth: 1,
    borderColor: Colors.tagBorder,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
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
  pageBtnDisabled: { backgroundColor: Colors.bgSurface, borderColor: Colors.borderLight, opacity: 0.4 },
  pageBtnText: { fontSize: Fonts.sizeSmall, color: Colors.textPrimary, fontWeight: '600' },
  pageBtnTextActive: { color: '#fff' },
  pageBtnTextDisabled: { color: Colors.textMuted },
  pageDots: { fontSize: Fonts.sizeBase, color: Colors.textMuted, paddingHorizontal: 4 },
});
