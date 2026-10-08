import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import type { Message } from '@/types';

export function ChatBubble({ message }: { message: Message }) {
  const mine = message.mine;
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={[styles.text, mine ? { color: colors.white } : { color: colors.charcoal }]}>
          {message.text}
        </Text>
        <Text style={[styles.meta, mine ? { color: '#D7E3DC' } : { color: colors.gray }]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {mine ? (message.status === 'sending' ? ' • sending' : message.status === 'failed' ? ' • failed — tap to retry' : '') : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.sm },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  mine: { backgroundColor: colors.forest, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.grayLight },
  text: { ...typography.bodySmall },
  meta: { ...typography.caption, marginTop: 2, fontSize: 11 },
});
