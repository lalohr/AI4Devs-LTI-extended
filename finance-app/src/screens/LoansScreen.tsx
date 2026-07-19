import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, summarizeLoan, todayIso } from '../finance';
import { Loan, LoanPaymentKind } from '../types';
import { colors, radius, spacing } from '../theme';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Segmented,
} from '../components/ui';

export default function LoansScreen() {
  const { data } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const selected = data.loans.find((l) => l.id === selectedId) ?? null;

  if (selected) {
    return (
      <LoanDetail loan={selected} onBack={() => setSelectedId(null)} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Loans</Text>
        <IconButton label="New" icon="add" onPress={() => setAddOpen(true)} />
      </View>

      <FlatList
        data={data.loans}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState text="No loans yet. Tap “New” to record money you lent to someone." />
        }
        renderItem={({ item }) => {
          const s = summarizeLoan(item, todayIso());
          return (
            <Pressable onPress={() => setSelectedId(item.id)}>
              <Card style={styles.loanCard}>
                <View style={styles.loanTop}>
                  <Text style={styles.loanName}>{item.borrower.name}</Text>
                  <Text
                    style={[
                      styles.loanBadge,
                      {
                        color: s.isSettled ? colors.income : colors.warning,
                      },
                    ]}
                  >
                    {s.isSettled ? 'Settled' : 'Active'}
                  </Text>
                </View>
                <Text style={styles.loanMeta}>
                  Lent {formatCurrency(item.principal)} · {item.annualInterestRate}%/yr
                </Text>
                <View style={styles.loanFooter}>
                  <Text style={styles.loanOwedLabel}>Owed now</Text>
                  <Text style={styles.loanOwed}>
                    {formatCurrency(s.totalOwed)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      <AddLoanModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

function AddLoanModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addLoan } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [note, setNote] = useState('');

  function reset() {
    setName('');
    setPhone('');
    setEmail('');
    setPrincipal('');
    setRate('');
    setStartDate(todayIso());
    setNote('');
  }

  function save() {
    const amount = parseFloat(principal);
    const r = parseFloat(rate);
    if (!name.trim() || !isFinite(amount) || amount <= 0) return;
    addLoan({
      borrower: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        note: '',
      },
      principal: amount,
      annualInterestRate: isFinite(r) ? r : 0,
      startDate: startDate.trim() || todayIso(),
      note: note.trim(),
    });
    reset();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView>
            <Text style={styles.modalTitle}>New loan</Text>
            <Field label="Borrower name" value={name} onChangeText={setName} placeholder="Jane Doe" />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 555 000 0000" />
            <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="jane@example.com" />
            <Field label="Capital lent" value={principal} onChangeText={setPrincipal} keyboardType="decimal-pad" placeholder="1000.00" />
            <Field label="Annual interest rate (%)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="12" />
            <Field label="Start date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. for car repair" />
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="ghost" icon="close" onPress={onClose} />
              <View style={styles.actionSpacer} />
              <Button label="Save loan" icon="checkmark" onPress={save} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function LoanDetail({ loan, onBack }: { loan: Loan; onBack: () => void }) {
  const { addLoanPayment, deleteLoanPayment, deleteLoan } = useApp();
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<LoanPaymentKind>('principal');
  const [isPrepayment, setIsPrepayment] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');

  const s = summarizeLoan(loan, todayIso());

  function savePayment() {
    const value = parseFloat(amount);
    if (!isFinite(value) || value <= 0) return;
    addLoanPayment(loan.id, {
      amount: value,
      kind,
      isPrepayment: kind === 'principal' ? isPrepayment : false,
      date: date.trim() || todayIso(),
      note: note.trim(),
    });
    setAmount('');
    setNote('');
    setIsPrepayment(false);
    setPayOpen(false);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.detailContent}
    >
      <Pressable onPress={onBack} style={styles.backLink}>
        <Icon name="chevron-back" size={16} color={colors.primary} />
        <Text style={styles.backText}>Back to loans</Text>
      </Pressable>

      <Text style={styles.heading}>{loan.borrower.name}</Text>
      {(loan.borrower.phone || loan.borrower.email) ? (
        <Text style={styles.contact}>
          {[loan.borrower.phone, loan.borrower.email].filter(Boolean).join('  ·  ')}
        </Text>
      ) : null}
      {loan.note ? <Text style={styles.contact}>{loan.note}</Text> : null}

      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Capital lent</Text>
          <Text style={styles.summaryValue}>{formatCurrency(s.principal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Capital repaid</Text>
          <Text style={styles.summaryValue}>{formatCurrency(s.principalPaid)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Remaining capital</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(s.remainingPrincipal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Interest accrued</Text>
          <Text style={styles.summaryValue}>{formatCurrency(s.interestAccrued)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Interest paid</Text>
          <Text style={styles.summaryValue}>{formatCurrency(s.interestPaid)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Owed now</Text>
          <Text style={styles.summaryTotalValue}>{formatCurrency(s.totalOwed)}</Text>
        </View>
        <Text style={styles.rateHint}>
          {loan.annualInterestRate}% annual · started {loan.startDate}
        </Text>
      </Card>

      <View style={styles.paymentsHeader}>
        <Text style={styles.subheading}>Payments</Text>
        <IconButton label="Record" icon="cash-outline" onPress={() => setPayOpen(true)} />
      </View>

      {loan.payments.length === 0 ? (
        <EmptyState text="No payments recorded yet." />
      ) : (
        <Card>
          {loan.payments.map((p, i) => (
            <View
              key={p.id}
              style={[styles.payRow, i > 0 && styles.payRowBorder]}
            >
              <View style={styles.payInfo}>
                <Text style={styles.payKind}>
                  {p.kind === 'principal' ? 'Capital' : 'Interest'}
                  {p.isPrepayment ? ' · Prepayment' : ''}
                </Text>
                <Text style={styles.payMeta}>
                  {p.date}
                  {p.note ? ` · ${p.note}` : ''}
                </Text>
              </View>
              <Text style={styles.payAmount}>{formatCurrency(p.amount)}</Text>
              <Pressable
                onPress={() => deleteLoanPayment(loan.id, p.id)}
                style={styles.payDelete}
              >
                <Icon name="trash-outline" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.deleteLoanWrap}>
        <Button
          label="Delete loan"
          variant="danger"
          icon="trash-outline"
          onPress={() => {
            deleteLoan(loan.id);
            onBack();
          }}
        />
      </View>

      <Modal
        visible={payOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPayOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Record payment</Text>
            <Segmented<LoanPaymentKind>
              value={kind}
              onChange={setKind}
              options={[
                { label: 'Capital', value: 'principal' },
                { label: 'Interest', value: 'interest' },
              ]}
            />
            <Field
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            {kind === 'principal' ? (
              <Pressable
                style={styles.checkRow}
                onPress={() => setIsPrepayment((v) => !v)}
              >
                <View
                  style={[styles.checkbox, isPrepayment && styles.checkboxOn]}
                >
                  {isPrepayment ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.checkLabel}>
                  Anticipated payment to capital (prepayment)
                </Text>
              </Pressable>
            ) : null}
            <Field
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
            <Field
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. partial repayment"
            />
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="ghost" icon="close" onPress={() => setPayOpen(false)} />
              <View style={styles.actionSpacer} />
              <Button label="Save" icon="checkmark" onPress={savePayment} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  loanCard: { gap: spacing.xs },
  loanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  loanBadge: { fontSize: 12, fontWeight: '700' },
  loanMeta: { color: colors.textMuted, fontSize: 13 },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loanOwedLabel: { color: colors.textMuted, fontSize: 13 },
  loanOwed: { color: colors.warning, fontSize: 18, fontWeight: '700' },
  detailContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.xs,
  },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  contact: { color: colors.textMuted, fontSize: 14 },
  summaryCard: { marginTop: spacing.md, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.textMuted, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  summaryTotalLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  summaryTotalValue: { color: colors.warning, fontSize: 18, fontWeight: '800' },
  rateHint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  subheading: { color: colors.text, fontSize: 18, fontWeight: '600' },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  payRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  payInfo: { flex: 1, paddingRight: spacing.sm },
  payKind: { color: colors.text, fontSize: 15, fontWeight: '600' },
  payMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  payAmount: { color: colors.text, fontSize: 15, fontWeight: '700' },
  payDelete: { paddingLeft: spacing.md },
  deleteLoanWrap: { marginTop: spacing.xl },
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
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionSpacer: { flex: 1 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.primaryText, fontSize: 14, fontWeight: '700' },
  checkLabel: { color: colors.text, fontSize: 14, flex: 1 },
});
