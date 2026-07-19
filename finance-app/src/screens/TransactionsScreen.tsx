import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { categoriesFor, formatCurrency, sumLineItems, todayIso } from '../finance';
import { LineItem, Transaction, TransactionType } from '../types';
import { colors, radius, spacing } from '../theme';
import {
  Button,
  Card,
  Chips,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Segmented,
} from '../components/ui';

interface ItemDraft {
  id: string;
  name: string;
  amount: string;
}

interface FormState {
  id: string | null;
  type: TransactionType;
  amount: string;
  category: string;
  note: string;
  date: string;
  itemized: boolean;
  items: ItemDraft[];
}

function draftId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyForm(): FormState {
  return {
    id: null,
    type: 'expense',
    amount: '',
    category: 'Rent',
    note: '',
    date: todayIso(),
    itemized: false,
    items: [{ id: draftId(), name: '', amount: '' }],
  };
}

export default function TransactionsScreen() {
  const { data, addTransaction, updateTransaction, deleteTransaction, addCategory } =
    useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const categories = useMemo(
    () => categoriesFor(form.type, data.customCategories),
    [form.type, data.customCategories]
  );

  const itemsTotal = useMemo(
    () =>
      sumLineItems(
        form.items
          .map((i) => ({ id: i.id, name: i.name, amount: parseFloat(i.amount) }))
          .filter((i) => isFinite(i.amount))
      ),
    [form.items]
  );

  function openAdd() {
    setForm({ ...emptyForm(), category: categoriesFor('expense', data.customCategories)[0] });
    setAddingCategory(false);
    setNewCategory('');
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
      itemized: !!t.items && t.items.length > 0,
      items:
        t.items && t.items.length > 0
          ? t.items.map((i) => ({ id: i.id, name: i.name, amount: String(i.amount) }))
          : [{ id: draftId(), name: '', amount: '' }],
    });
    setAddingCategory(false);
    setNewCategory('');
    setModalOpen(true);
  }

  function confirmNewCategory() {
    const name = newCategory.trim();
    if (!name) return;
    addCategory(form.type, name);
    setForm((f) => ({ ...f, category: name }));
    setNewCategory('');
    setAddingCategory(false);
  }

  function save() {
    let amount: number;
    let items: LineItem[] | undefined;
    if (form.itemized) {
      items = form.items
        .map((i) => ({ id: i.id, name: i.name.trim(), amount: parseFloat(i.amount) }))
        .filter((i) => i.name && isFinite(i.amount) && i.amount > 0);
      if (items.length === 0) return;
      amount = sumLineItems(items);
    } else {
      amount = parseFloat(form.amount);
      if (!isFinite(amount) || amount <= 0) return;
    }

    const payload = {
      type: form.type,
      amount,
      category: form.category,
      note: form.note.trim(),
      date: form.date.trim() || todayIso(),
      ...(items ? { items } : {}),
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
        <IconButton label="Add" icon="add" onPress={openAdd} />
      </View>

      <FlatList
        data={data.transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState text="No transactions yet. Tap “Add” to record income or an expense." />
        }
        renderItem={({ item }) => {
          const hasItems = !!item.items && item.items.length > 0;
          return (
            <Pressable onPress={() => openEdit(item)}>
              <Card>
                <View style={styles.txnTop}>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnCategory}>{item.category}</Text>
                    <Text style={styles.txnMeta}>
                      {item.date}
                      {item.note ? ` · ${item.note}` : ''}
                      {hasItems ? ` · ${item.items!.length} items` : ''}
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
                </View>
                {hasItems ? (
                  <View style={styles.itemsBreakdown}>
                    {item.items!.map((li) => (
                      <View key={li.id} style={styles.breakdownRow}>
                        <Text style={styles.breakdownName}>{li.name}</Text>
                        <Text style={styles.breakdownAmount}>
                          {formatCurrency(li.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card>
            </Pressable>
          );
        }}
      />

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {form.id ? 'Edit transaction' : 'New transaction'}
              </Text>

              <Segmented<TransactionType>
                value={form.type}
                onChange={(type) =>
                  setForm((f) => ({
                    ...f,
                    type,
                    category: categoriesFor(type, data.customCategories)[0],
                  }))
                }
                options={[
                  { label: 'Expense', value: 'expense' },
                  { label: 'Income', value: 'income' },
                ]}
              />

              <View style={styles.itemizeRow}>
                <View style={styles.itemizeLabel}>
                  <Icon name="list" size={16} color={colors.textMuted} />
                  <Text style={styles.itemizeText}>Itemized (line items)</Text>
                </View>
                <Pressable
                  onPress={() => setForm((f) => ({ ...f, itemized: !f.itemized }))}
                  style={[styles.toggle, form.itemized && styles.toggleOn]}
                >
                  <View
                    style={[styles.knob, form.itemized && styles.knobOn]}
                  />
                </Pressable>
              </View>

              {form.itemized ? (
                <View style={styles.itemsEditor}>
                  {form.items.map((it, idx) => (
                    <View key={it.id} style={styles.itemEditRow}>
                      <TextInput
                        style={[styles.input, styles.itemName]}
                        placeholder="Item (e.g. Cement)"
                        placeholderTextColor={colors.textMuted}
                        value={it.name}
                        onChangeText={(name) =>
                          setForm((f) => ({
                            ...f,
                            items: f.items.map((x, i) =>
                              i === idx ? { ...x, name } : x
                            ),
                          }))
                        }
                      />
                      <TextInput
                        style={[styles.input, styles.itemAmount]}
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                        value={it.amount}
                        onChangeText={(amount) =>
                          setForm((f) => ({
                            ...f,
                            items: f.items.map((x, i) =>
                              i === idx ? { ...x, amount } : x
                            ),
                          }))
                        }
                      />
                      <Pressable
                        onPress={() =>
                          setForm((f) => ({
                            ...f,
                            items:
                              f.items.length > 1
                                ? f.items.filter((_, i) => i !== idx)
                                : f.items,
                          }))
                        }
                        style={styles.removeItem}
                      >
                        <Icon name="trash-outline" size={18} color={colors.expense} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    style={styles.addItem}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        items: [...f.items, { id: draftId(), name: '', amount: '' }],
                      }))
                    }
                  >
                    <Icon name="add-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.addItemText}>Add line</Text>
                  </Pressable>
                  <View style={styles.itemsTotalRow}>
                    <Text style={styles.itemsTotalLabel}>Total</Text>
                    <Text style={styles.itemsTotalValue}>
                      {formatCurrency(itemsTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Field
                  label="Amount"
                  value={form.amount}
                  onChangeText={(amount) => setForm((f) => ({ ...f, amount }))}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              )}

              <Text style={styles.fieldLabel}>Category</Text>
              <Chips
                options={categories}
                value={form.category}
                onChange={(category) => setForm((f) => ({ ...f, category }))}
              />
              {addingCategory ? (
                <View style={styles.newCategoryRow}>
                  <TextInput
                    style={[styles.input, styles.newCategoryInput]}
                    placeholder="New category name"
                    placeholderTextColor={colors.textMuted}
                    value={newCategory}
                    onChangeText={setNewCategory}
                    autoFocus
                  />
                  <Pressable style={styles.confirmCategory} onPress={confirmNewCategory}>
                    <Icon name="checkmark" size={18} color={colors.primaryText} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.addCategoryChip}
                  onPress={() => setAddingCategory(true)}
                >
                  <Icon name="add" size={14} color={colors.primary} />
                  <Text style={styles.addCategoryText}>Add category</Text>
                </Pressable>
              )}

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
                    icon="trash-outline"
                    onPress={() => {
                      deleteTransaction(form.id as string);
                      setModalOpen(false);
                    }}
                  />
                ) : (
                  <Button
                    label="Cancel"
                    variant="ghost"
                    icon="close"
                    onPress={() => setModalOpen(false)}
                  />
                )}
                <View style={styles.actionSpacer} />
                <Button label="Save" icon="checkmark" onPress={save} />
              </View>
            </ScrollView>
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
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  txnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnInfo: { flex: 1, paddingRight: spacing.md },
  txnCategory: { color: colors.text, fontSize: 16, fontWeight: '600' },
  txnMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 17, fontWeight: '700' },
  itemsBreakdown: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownName: { color: colors.textMuted, fontSize: 13 },
  breakdownAmount: { color: colors.text, fontSize: 13 },
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
  itemizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemizeLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemizeText: { color: colors.text, fontSize: 14 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.textMuted,
  },
  knobOn: { backgroundColor: colors.primaryText, alignSelf: 'flex-end' },
  itemsEditor: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  itemEditRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemName: { flex: 1 },
  itemAmount: { width: 90 },
  removeItem: { padding: spacing.xs },
  addItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addItemText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  itemsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  itemsTotalLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  itemsTotalValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  addCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  addCategoryText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  newCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  newCategoryInput: { flex: 1 },
  confirmCategory: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionSpacer: { flex: 1 },
});
