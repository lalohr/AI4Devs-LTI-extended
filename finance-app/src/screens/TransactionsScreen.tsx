import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, todayIso } from '../finance';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  Transaction,
  TransactionType,
} from '../types';
import { colors, radius, spacing } from '../theme';
import { Button, Card, Chips, EmptyState, Field, Segmented } from '../components/ui';

interface FormState {
  id: string | null;
  type: TransactionType;
  amount: string;
  category: string;
  note: string;
  date: string;
}

function emptyForm(): FormState {
  return {
    id: null,
    type: 'expense',
    amount: '',
    category: DEFAULT_EXPENSE_CATEGORIES[0],
    note: '',
    date: todayIso(),
  };
}

export default function TransactionsScreen() {
  const { data, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const categories =
    form.type === 'income'
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;

  function openAdd() {
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(t: Transaction) {
    setForm({
      id: t.id,
      type: t.type,
      amount: String(t.amount),
      category: t.category,
      note: t.note,
      date: t.date,
    });
    setModalOpen(true);
  }

  function save() {
    const amount = parseFloat(form.amount);
    if (!isFinite(amount) || amount <= 0) return;
    const payload = {
      type: form.type,
      amount,
      category: form.category,
      note: form.note.trim(),
      date: form.date.trim() || todayIso(),
    };
    if (form.id) {
      updateTransaction({ ...payload, id: form.id });
    } else {
      addTransaction(payload);
    }
    setModalOpen(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Money</Text>
        <Pressable style={styles.addButton} onPress={openAdd}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={data.transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState text="No transactions yet. Tap “+ Add” to record income or an expense." />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openEdit(item)}>
            <Card style={styles.txnCard}>
              <View style={styles.txnInfo}>
                <Text style={styles.txnCategory}>{item.category}</Text>
                <Text style={styles.txnMeta}>
                  {item.date}
                  {item.note ? ` · ${item.note}` : ''}
                </Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  {
                    color:
                      item.type === 'income' ? colors.income : colors.expense,
                  },
                ]}
              >
                {item.type === 'income' ? '+' : '-'}
                {formatCurrency(item.amount).replace('-', '')}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {form.id ? 'Edit transaction' : 'New transaction'}
            </Text>

            <Segmented<TransactionType>
              value={form.type}
              onChange={(type) =>
                setForm((f) => ({
                  ...f,
                  type,
                  category:
                    type === 'income'
                      ? DEFAULT_INCOME_CATEGORIES[0]
                      : DEFAULT_EXPENSE_CATEGORIES[0],
                }))
              }
              options={[
                { label: 'Expense', value: 'expense' },
                { label: 'Income', value: 'income' },
              ]}
            />

            <Field
              label="Amount"
              value={form.amount}
              onChangeText={(amount) => setForm((f) => ({ ...f, amount }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <Chips
              options={categories}
              value={form.category}
              onChange={(category) => setForm((f) => ({ ...f, category }))}
            />

            <Field
              label="Date"
              value={form.date}
              onChangeText={(date) => setForm((f) => ({ ...f, date }))}
              placeholder="YYYY-MM-DD"
            />
            <Field
              label="Note (optional)"
              value={form.note}
              onChangeText={(note) => setForm((f) => ({ ...f, note }))}
              placeholder="e.g. groceries"
            />

            <View style={styles.modalActions}>
              {form.id ? (
                <Button
                  label="Delete"
                  variant="danger"
                  onPress={() => {
                    deleteTransaction(form.id as string);
                    setModalOpen(false);
                  }}
                />
              ) : (
                <Button
                  label="Cancel"
                  variant="ghost"
                  onPress={() => setModalOpen(false)}
                />
              )}
              <View style={styles.actionSpacer} />
              <Button label="Save" onPress={save} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  heading: { color: colors.text, fontSize: 28, fontWeight: '700' },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addButtonText: { color: colors.primaryText, fontWeight: '700' },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnInfo: { flex: 1, paddingRight: spacing.md },
  txnCategory: { color: colors.text, fontSize: 16, fontWeight: '600' },
  txnMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 17, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  fieldLabel: { color: colors.textMuted, marginBottom: spacing.xs, fontSize: 13 },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionSpacer: { flex: 1 },
});
