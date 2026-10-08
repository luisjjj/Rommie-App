import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Heart, X } from 'phosphor-react-native';
import { Avatar, EmptyState, LifestyleChip } from '../ui/primitives';
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens';
import { formatBudget, lifestyleEntries } from '@/utils/format';
import type { Profile } from '@/types';

const SWIPE_THRESHOLD = 120;
const OFFSCREEN_X = 550;

function SwipeCard({ profile, onPress }: { profile: Profile; onPress: (p: Profile) => void }) {
  const place = [profile.university ?? profile.city, profile.preferredArea].filter(Boolean).join(' • ');
  const placeKey = [profile.university ?? profile.city, profile.preferredArea].filter(Boolean) as string[];
  const tags = [
    formatBudget(profile.budgetMin, profile.budgetMax),
    profile.moveInTiming,
    ...lifestyleEntries(profile.lifestyle).map(([, v]) => v),
  ]
    .filter((t): t is string => !!t && !placeKey.includes(t))
    .slice(0, 6);

  return (
    <View style={styles.card}>
      {profile.photoUrl ? (
        <Image source={{ uri: profile.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoFallback]}>
          <Avatar name={profile.displayName} size={88} />
        </View>
      )}
      <Pressable onPress={() => onPress(profile)} style={styles.body}>
        <Text style={styles.name}>
          {profile.displayName}, {profile.age}
        </Text>
        {place ? <Text style={styles.sub}>{place}</Text> : null}
        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        ) : null}
        <View style={styles.tags}>
          {tags.map((t) => (
            <LifestyleChip key={t} label={t} />
          ))}
        </View>
      </Pressable>
    </View>
  );
}

interface DeckProps {
  profiles: Profile[];
  /** Resets the deck whenever this key changes (e.g. new filters). */
  resetKey: string;
  onLike: (p: Profile) => void;
  onPass: (p: Profile) => void;
  onViewProfile: (p: Profile) => void;
  onEmptyAction: () => void;
}

export function SwipeDeck({ profiles, resetKey, onLike, onPass, onViewProfile, onEmptyAction }: DeckProps) {
  const [index, setIndex] = React.useState(0);
  const indexRef = React.useRef(0);
  const profilesRef = React.useRef(profiles);
  profilesRef.current = profiles;

  const lock = useSharedValue(false);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  React.useEffect(() => {
    indexRef.current = 0;
    setIndex(0);
    tx.value = 0;
    ty.value = 0;
    lock.value = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleSwipe = (dir: 'like' | 'pass') => {
    const p = profilesRef.current[indexRef.current];
    if (p) {
      if (dir === 'like') onLike(p);
      else onPass(p);
    }
    indexRef.current += 1;
    setIndex(indexRef.current);
    tx.value = 0;
    ty.value = 0;
    lock.value = false;
  };

  const swipe = (dir: 'like' | 'pass') => {
    if (lock.value || !profilesRef.current[indexRef.current]) return;
    lock.value = true;
    tx.value = withTiming(dir === 'like' ? OFFSCREEN_X : -OFFSCREEN_X, { duration: 220 }, (fin) => {
      if (fin) runOnJS(handleSwipe)(dir);
    });
  };

  const openProfile = () => {
    const p = profilesRef.current[indexRef.current];
    if (p) onViewProfile(p);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (lock.value) return;
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd(() => {
      if (lock.value) return;
      if (tx.value > SWIPE_THRESHOLD) {
        lock.value = true;
        tx.value = withTiming(OFFSCREEN_X, { duration: 220 }, (fin) => {
          if (fin) runOnJS(handleSwipe)('like');
        });
      } else if (tx.value < -SWIPE_THRESHOLD) {
        lock.value = true;
        tx.value = withTiming(-OFFSCREEN_X, { duration: 220 }, (fin) => {
          if (fin) runOnJS(handleSwipe)('pass');
        });
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(openProfile)();
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${tx.value / 18}deg` }],
  }));
  const likeStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [20, 110], [0, 1]),
  }));
  const nopeStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-110, -20], [1, 0]),
  }));

  if (index >= profiles.length) {
    return (
      <View style={styles.deck}>
        <EmptyState
          title="Looks like you've reached the end for now."
          body="Try adjusting your filters or check back as more people join Roomie."
          actionLabel="Adjust Filters"
          onAction={onEmptyAction}
        />
      </View>
    );
  }

  const visible = profiles.slice(index, index + 3);

  return (
    <View style={styles.deck}>
      <View style={styles.stack}>
        {visible.map((p, i) => {
          if (i === 0) {
            return (
              <GestureDetector key={p.id} gesture={Gesture.Race(pan, tap)}>
                <Animated.View style={[styles.fill, styles.topCard, cardStyle]}>
                  <SwipeCard profile={p} onPress={onViewProfile} />
                  <Animated.View style={[styles.stamp, styles.stampLike, likeStamp]}>
                    <Text style={[styles.stampText, { color: colors.forest }]}>LIKE</Text>
                  </Animated.View>
                  <Animated.View style={[styles.stamp, styles.stampNope, nopeStamp]}>
                    <Text style={[styles.stampText, { color: colors.danger }]}>NOPE</Text>
                  </Animated.View>
                </Animated.View>
              </GestureDetector>
            );
          }
          return (
            <View
              key={p.id}
              pointerEvents="none"
              style={[styles.fill, styles.underCard, { transform: [{ scale: 1 - i * 0.05 }, { translateY: i * 12 }] }]}
            >
              <SwipeCard profile={p} onPress={onViewProfile} />
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => swipe('pass')}
          accessibilityLabel="Pass"
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
        >
          <X size={30} color={colors.charcoal} weight="bold" />
        </Pressable>
        <Pressable
          onPress={() => swipe('like')}
          accessibilityLabel="Like"
          style={({ pressed }) => [styles.likeBtn, pressed && { opacity: 0.7 }]}
        >
          <Heart size={30} color={colors.white} weight="fill" />
        </Pressable>
      </View>
      <Text style={styles.hint}>Swipe right to like, left to pass — or tap a card for the full profile.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, paddingBottom: 104 },
  stack: { flex: 1 },
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  topCard: { zIndex: 3 },
  underCard: { zIndex: 1, opacity: 0.9 },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden', ...shadows.card },
  photo: { flex: 1.1, backgroundColor: colors.grayMuted },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: spacing.xl },
  name: { ...typography.h1, color: colors.charcoal },
  sub: { ...typography.bodySmall, color: colors.gray, marginTop: 2 },
  bio: { ...typography.bodySmall, color: colors.charcoal, marginTop: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  stamp: {
    position: 'absolute',
    top: 24,
    borderWidth: 4,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  stampLike: { left: 20, borderColor: colors.forest, transform: [{ rotate: '-18deg' }] },
  stampNope: { right: 20, borderColor: colors.danger, transform: [{ rotate: '18deg' }] },
  stampText: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xxl, marginTop: spacing.lg },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  likeBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  hint: { ...typography.caption, color: colors.gray, textAlign: 'center', marginTop: spacing.md },
});
