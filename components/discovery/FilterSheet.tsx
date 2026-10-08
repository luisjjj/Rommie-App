import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Chip } from '../ui/primitives';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import {
  BUDGET_RANGES,
  LIFESTYLE_OPTIONS,
  MOVE_IN_OPTIONS,
} from '@/constants/options';
import type { DiscoveryFilters } from '@/types';

export function FilterSheet({
  visible,
  initial,
  onClose,
  onApply,
  onReset,
}: {
  visible: boolean;
  initial: DiscoveryFilters;
  onClose: () => void;
  onApply: (f: DiscoveryFilters) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<DiscoveryFilters>(initial);
  const set = (k: keyof DiscoveryFilters, v: string | number | undefined) =>
    setDraft((d) => ({ ...d, [k]: d[k] === v ? undefined : v }));
  const activeCount = Object.values(draft).filter((v) => v !== undefined && v !== '').length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.handle} />
        <Text style={styles.title}>Filters {activeCount ? `(${activeCount})` : ''}</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.section}>Budget (annual)</Text>
          <View style={styles.row}>
            {BUDGET_RANGES.map((r) => (
              <Chip
                key={r.label}
                label={r.label}
                selected={draft.budgetMin === r.min && draft.budgetMax === r.max}
                onPress={() => setDraft((d) => ({ ...d, budgetMin: r.min, budgetMax: r.max }))}
              />
            ))}
          </View>
          <Text style={styles.section}>Move-in timeframe</Text>
          <View style={styles.row}>
            {MOVE_IN_OPTIONS.map((m) => (
              <Chip key={m} label={m} selected={draft.moveInTiming === m} onPress={() => set('moveInTiming', m)} />
            ))}
          </View>
          {(Object.keys(LIFESTYLE_OPTIONS) as Array<keyof typeof LIFESTYLE_OPTIONS>).map((key) => (
            <View key={key}>
              <Text style={styles.section}>{key.replace(/_/g, ' ')}</Text>
              <View style={styles.row}>
                {LIFESTYLE_OPTIONS[key].map((opt: string) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={(draft as Record<string, unknown>)[key] === opt}
                    onPress={() => set(key as keyof DiscoveryFilters, opt)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable onPress={() => { setDraft({}); onReset(); }} style={styles.reset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Button title="Apply Filters" onPress={() => { onApply(draft); onClose(); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream, padding: spacing.xl, paddingTop: spacing.md },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.grayLight, alignSelf: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.charcoal, marginBottom: spacing.md },
  section: { ...typography.h3, color: colors.charcoal, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'capitalize' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  reset: { paddingHorizontal: spacing.lg, paddingVertical: 14 },
  resetText: { fontWeight: '700', color: colors.forest },
});
