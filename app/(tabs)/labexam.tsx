import React, { useState, useMemo, useRef } from 'react';
import {SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, StyleSheet, StatusBar,} from 'react-native';

const COLORS = {
  background: '#f3f4f6',
  card: '#ffffff',
  total: '#10b981',
  selected: '#3b82f6',
  primary: '#1f2937',
  danger: '#ef4444',
  border: '#d1d5db',
  inactiveFilter: '#e5e7eb',
  emptyText: '#9ca3af',
  totalLabel: '#e6fffa',
  disabled: '#9ca3af',
};

type Category = 'Food' | 'Transpo' | 'Bills';
type FilterOption = 'All' | Category;
type Expense = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  emoji: string;
};

const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '🍟',
  Transpo: '🚗',
  Bills: '💵',
};

const ALL_CATEGORIES: Category[] = ['Food', 'Transpo', 'Bills'];
const ALL_FILTERS: FilterOption[] = ['All', 'Food', 'Transpo', 'Bills'];

type ExpenseCardProps = {
  expense: Expense;
  onDelete: (id: string) => void;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  return (
    <View style={styles.expenseCard}>
      <Text style={styles.expenseEmoji}>{expense.emoji}</Text>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle} numberOfLines={1}>
          {expense.title}
        </Text>
        <Text style={styles.expenseCategory}>{expense.category}</Text>
      </View>
      <Text style={styles.expenseAmount}>₱{expense.amount.toFixed(2)}</Text>
      <TouchableOpacity
        onPress={() => onDelete(expense.id)}
        style={styles.deleteButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

type CategoryButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  variant?: 'square' | 'pill';
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  label,
  isActive,
  onPress,
  variant = 'square',
}) => {
  const isPill = variant === 'pill';
  return (
    <TouchableOpacity
      style={[
        isPill ? styles.filterPill : styles.categoryButton,
        isActive && (isPill ? styles.filterPillActive : styles.categoryButtonActive),
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          isPill ? styles.filterPillText : styles.categoryButtonText,
          isActive && styles.activeButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', title: 'Jollibee Lunch', amount: 180, category: 'Food', emoji: CATEGORY_EMOJI.Food },
    { id: '2', title: 'Angkas Ride', amount: 95, category: 'Transpo', emoji: CATEGORY_EMOJI.Transpo },
    { id: '3', title: 'Meralco Bill', amount: 1500, category: 'Bills', emoji: CATEGORY_EMOJI.Bills },
  ]);

  const [titleInput, setTitleInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Food');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const listRef = useRef<FlatList<Expense>>(null);
  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'All') return expenses;
    return expenses.filter((expense) => expense.category === activeFilter);
  }, [expenses, activeFilter]);

  const totalCost = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const isFormValid = useMemo(() => {
    const trimmedTitle = titleInput.trim();
    const parsedAmount = parseFloat(amountInput);
    return trimmedTitle.length > 0 && !isNaN(parsedAmount) && parsedAmount > 0;
  }, [titleInput, amountInput]);

  const handleAddExpense = () => {
    const trimmedTitle = titleInput.trim();
    const parsedAmount = parseFloat(amountInput);
    if (trimmedTitle.length === 0) {
      setErrorMessage('Please enter an item description.');
      return;
    }

    if (amountInput.trim().length === 0 || isNaN(parsedAmount)) {
      setErrorMessage('Please enter a valid numeric amount.');
      return;
    }

    if (parsedAmount < 0) {
      setErrorMessage('Negative numbers are not allowed.');
      return;
    }

    if (parsedAmount === 0) {
      setErrorMessage('Amount must be greater than 0.');
      return;
    }

    setErrorMessage('');
    const newExpense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: trimmedTitle,
      amount: parsedAmount,
      category: selectedCategory,
      emoji: CATEGORY_EMOJI[selectedCategory],
    };

    setExpenses((previousExpenses) => [newExpense, ...previousExpenses]);
    setTitleInput('');
    setAmountInput('');
    Keyboard.dismiss();
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((previousExpenses) => previousExpenses.filter((expense) => expense.id !== id));
  };

  const handleFilterPress = (filter: FilterOption) => {
    setActiveFilter(filter);
  };

  const emptyStateMessage =
    activeFilter === 'All'
      ? 'No expenses yet. Add one above!'
      : `No "${activeFilter}" expenses yet.`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>My Expense Tracker</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          keyExtractor={(item) => item.id}
          data={filteredExpenses}
          renderItem={({ item }) => (
            <ExpenseCard expense={item} onDelete={handleDeleteExpense} />
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={true}
          onScrollBeginDrag={Keyboard.dismiss}
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={true}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>
                  TOTAL ({activeFilter === 'All' ? 'ALL' : activeFilter.toUpperCase()})
                </Text>
                <Text style={styles.totalValue}>₱{totalCost.toLocaleString()}</Text>
              </View>
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Item (Baon, Pamasahe)"
                  placeholderTextColor="#9CA3AF"
                  value={titleInput}
                  onChangeText={setTitleInput}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Amount (₱)"
                  placeholderTextColor="#9CA3AF"
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="numeric"
                />
                {errorMessage.length > 0 && (
                  <Text style={styles.errorText}>⚠ {errorMessage}</Text>
                )}
                <Text style={styles.sectionLabel}>SELECT CATEGORY:</Text>
                <View style={styles.categoryRow}>
                  {ALL_CATEGORIES.map((category) => (
                    <CategoryButton
                      key={category}
                      label={category}
                      isActive={selectedCategory === category}
                      onPress={() => setSelectedCategory(category)}
                      variant="square"
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.addButton, !isFormValid && styles.addButtonDisabled]}
                  onPress={handleAddExpense}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>+ Add Expense</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionLabel}>FILTER / SORT:</Text>
              <View style={styles.filterRow}>
                {ALL_FILTERS.map((filter) => (
                  <CategoryButton
                    key={filter}
                    label={filter}
                    isActive={activeFilter === filter}
                    onPress={() => handleFilterPress(filter)}
                    variant="pill"
                  />
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyStateMessage}</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  totalCard: {
    backgroundColor: COLORS.total,
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    color: COLORS.totalLabel,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  formContainer: {
    marginBottom: 8,
    backgroundColor: COLORS.card,  
    borderWidth: 1,                 
    borderColor: COLORS.border,     
    borderRadius: 12,               
    padding: 14,                    
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.selected,
    borderColor: COLORS.selected,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeButtonText: {
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: COLORS.primary, 
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,                  
  },
  addButtonDisabled: {
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: COLORS.inactiveFilter,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.emptyText,
    marginTop: 30,
    fontSize: 14,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expenseCategory: {
    fontSize: 12,
    color: COLORS.emptyText,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginRight: 10,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});
