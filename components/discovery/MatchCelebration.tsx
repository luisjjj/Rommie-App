import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Confetti } from 'phosphor-react-native';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/primitives';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export function MatchCelebration({
  visible,
  name,
  onMessage,
  onKeepDiscovering,
}: {
  visible: boolean;
  name: string;
  onMessage: () => void;
  onKeepDiscovering: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Avatar name={name} size={84} color={colors.yellowSoft} />
          <View style={styles.titleRow}>
            <Confetti size={28} color={colors.forest} weight="fill" />
            <Text style={styles.title}>It’s a match!</Text>
          </View>
          <Text style={styles.body}>You and {name} both want to get to know each other.</Text>
          <Button title="Send a Message" onPress={onMessage} />
          <Pressable onPress={onKeepDiscovering} style={styles.ghost}>
            <Text style={styles.ghostText}>Keep Discovering</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,30,24,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.md, width: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.h1, color: colors.charcoal },
  body: { ...typography.bodySmall, color: colors.gray, textAlign: 'center' },
  ghost: { padding: 12 },
  ghostText: { fontWeight: '700', color: colors.forest },
});
