import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, Shadow } from '../utils/theme';
import StoryCard from '../components/StoryCard';
import { useStoriesIndex, useFilteredStories, StoryMeta } from '../hooks/useData';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { stories, loading } = useStoriesIndex();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useFilteredStories(stories, query, selectedGenre, selectedCategory);

  // Get unique genres from loaded stories
  const allGenres = React.useMemo(() => {
    const s = new Set<string>();
    stories.forEach(st => st.genres.forEach(g => s.add(g)));
    return ['', ...Array.from(s).sort()];
  }, [stories]);

  const renderStory = useCallback(({ item }: { item: StoryMeta }) => (
    <StoryCard
      story={item}
      onPress={() => navigation.navigate('StoryDetail', { story: item })}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item: StoryMeta) => item.slug, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thư viện truyện...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📚 Truyện Online</Text>
          <Text style={styles.headerSub}>{stories.length.toLocaleString()} truyện</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(v => !v)}
        >
          <Text style={styles.filterBtnText}>🔖 Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm truyện, tác giả..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Genre Filter chips */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScroll}
          >
            {allGenres.slice(0, 30).map(g => (
              <TouchableOpacity
                key={g || '__all'}
                style={[styles.chip, selectedGenre === g && styles.chipActive]}
                onPress={() => setSelectedGenre(g)}
              >
                <Text style={[styles.chipText, selectedGenre === g && styles.chipTextActive]}>
                  {g || 'Tất cả'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results count */}
      {(query || selectedGenre) ? (
        <View style={styles.resultsBanner}>
          <Text style={styles.resultsText}>
            {filtered.length.toLocaleString()} kết quả
            {selectedGenre ? ` • ${selectedGenre}` : ''}
          </Text>
          <TouchableOpacity onPress={() => { setQuery(''); setSelectedGenre(''); }}>
            <Text style={styles.clearFilter}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Story List */}
      <FlatList
        data={filtered}
        renderItem={renderStory}
        keyExtractor={keyExtractor}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>Không tìm thấy truyện nào</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizeBase,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Fonts.sizeXXL,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
  },
  filterBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Fonts.sizeBase,
    height: '100%',
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  clearBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
  },
  genreScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  resultsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  resultsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  clearFilter: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: Fonts.sizeBase,
    color: Colors.textMuted,
  },
});
