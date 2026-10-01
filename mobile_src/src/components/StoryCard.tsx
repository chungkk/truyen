import React, { memo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Fonts, Shadow } from '../utils/theme';
import type { StoryMeta } from '../hooks/useData';

interface StoryCardProps {
  story: StoryMeta;
  onPress: () => void;
  style?: ViewStyle;
}

function StoryCard({ story, onPress, style }: StoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, style]}
    >
      {/* Cover placeholder */}
      <View style={styles.cover}>
        <Text style={styles.coverInitial} numberOfLines={1}>
          {story.title.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>

        {story.author ? (
          <Text style={styles.author} numberOfLines={1}>
            ✍️ {story.author}
          </Text>
        ) : null}

        <View style={styles.tagsRow}>
          {story.genres.slice(0, 2).map(g => (
            <View key={g} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{g}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.chapters}>📖 {story.num_chapters} chương</Text>
          {story.status ? (
            <View style={[
              styles.statusBadge,
              story.status === 'Hoàn thành' ? styles.statusDone : styles.statusOngoing
            ]}>
              <Text style={styles.statusText}>{story.status}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.small,
  },
  cover: {
    width: 80,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  coverInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Fonts.sizeBase,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  author: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 2,
  },
  tag: {
    backgroundColor: Colors.tagBg,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.tagBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    maxWidth: 130,
  },
  tagText: {
    fontSize: 10,
    color: Colors.tagText,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  chapters: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusDone: {
    backgroundColor: Colors.success + '22',
  },
  statusOngoing: {
    backgroundColor: Colors.warning + '22',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
});

export default memo(StoryCard);
