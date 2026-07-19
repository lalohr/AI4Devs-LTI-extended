import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import LoansScreen from './src/screens/LoansScreen';
import { colors, spacing } from './src/theme';

type TabKey = 'dashboard' | 'money' | 'loans';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'dashboard', label: 'Home', icon: 'home' },
  { key: 'money', label: 'Money', icon: 'swap-vertical' },
  { key: 'loans', label: 'Loans', icon: 'people' },
];

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

function Root() {
  const { isLoaded } = useApp();
  const [tab, setTab] = useState<TabKey>('dashboard');

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.safe, styles.loading]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.screen}>
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'money' && <TransactionsScreen />}
        {tab === 'loans' && <LoansScreen />}
      </View>
      <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                style={styles.tab}
                onPress={() => setTab(t.key)}
              >
                <Ionicons
                  name={t.icon}
                  size={22}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[styles.tabLabel, active && styles.tabActive]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loading: { alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  tabLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tabActive: { color: colors.primary, fontWeight: '700' },
});
