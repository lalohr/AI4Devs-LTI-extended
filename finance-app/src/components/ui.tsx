import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'ghost' && styles.buttonGhostText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.expense,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 15,
  },
  buttonGhostText: {
    color: colors.text,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm - 2,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.primaryText,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.primaryText,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
