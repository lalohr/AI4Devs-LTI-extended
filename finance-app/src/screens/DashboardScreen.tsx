import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import {
  filterTransactionsByPeriod,
  formatCurrency,
  Period,
  summarizeLoans,
  summarizeTransactions,
  todayIso,
} from '../finance';
import { colors, spacing } from '../theme';
import { Card, EmptyState, Segmented } from '../components/ui';

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
];

const PERIOD_LABEL: Record<Period, string> = {
  day: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
  all: 'all time',
};

export default function DashboardScreen() {
  const { data } = useApp();
  const today = todayIso();
  const [period, setPeriod] = useState<Period>('month');

  const periodTransactions = useMemo(
    () => filterTransactionsByPeriod(data.transactions, period, today),
    [data.transactions, period, today]
  );
  const cashflow = useMemo(
    () => summarizeTransactions(periodTransactions),
    [periodTransactions]
  );
  const loans = useMemo(
    () => summarizeLoans(data.loans, today),
    [data.loans, today]
  );

  const recent = data.transactions.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Overview</Text>

      <Segmented<Period>
        value={period}
        onChange={setPeriod}
        options={PERIOD_OPTIONS}
      />

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Net {PERIOD_LABEL[period]}</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: cashflow.balance >= 0 ? colors.income : colors.expense },
          ]}
        >
          {formatCurrency(cashflow.balance)}
        </Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.metricLabel}>Money in</Text>
          <Text style={[styles.metricValue, { color: colors.income }]}>
            {formatCurrency(cashflow.totalIncome)}
          </Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.metricLabel}>Money out</Text>
          <Text style={[styles.metricValue, { color: colors.expense }]}>
            {formatCurrency(cashflow.totalExpense)}
          </Text>
        </Card>
      </View>

      <Text style={styles.subheading}>Loans to people</Text>
      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.metricLabel}>Outstanding</Text>
          <Text style={[styles.metricValue, { color: colors.warning }]}>
            {formatCurrency(loans.totalOutstanding)}
          </Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.metricLabel}>Total lent</Text>
          <Text style={styles.metricValue}>{formatCurrency(loans.totalLent)}</Text>
        </Card>
      </View>
      <Text style={styles.hint}>
        {loans.activeLoans} active loan{loans.activeLoans === 1 ? '' : 's'}
      </Text>

      <Text style={styles.subheading}>Recent activity</Text>
      {recent.length === 0 ? (
        <EmptyState text="No transactions yet. Add your first one in the Money tab." />
      ) : (
        <Card>
          {recent.map((t, i) => (
            <View
              key={t.id}
              style={[styles.txnRow, i > 0 && styles.txnRowBorder]}
            >
              <View style={styles.txnInfo}>
                <Text style={styles.txnCategory}>{t.category}</Text>
                <Text style={styles.txnMeta}>
                  {t.date}
                  {t.note ? ` · ${t.note}` : ''}
                </Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  { color: t.type === 'income' ? colors.income : colors.expense },
                ]}
              >
                {t.type === 'income' ? '+' : '-'}
                {formatCurrency(t.amount).replace('-', '')}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.md },
  heading: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subheading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  balanceCard: { alignItems: 'flex-start' },
  balanceLabel: { color: colors.textMuted, fontSize: 14 },
  balanceValue: { fontSize: 40, fontWeight: '800', marginTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
  metricLabel: { color: colors.textMuted, fontSize: 13 },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  hint: { color: colors.textMuted, fontSize: 13 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  txnRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  txnInfo: { flex: 1, paddingRight: spacing.md },
  txnCategory: { color: colors.text, fontSize: 15, fontWeight: '600' },
  txnMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: '700' },
});
