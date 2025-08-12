import { Expense, CashFlowSettings, DailyForecast, Creditor } from '../types';

export const generateDailyForecasts = (
  expenses: Expense[],
  settings: CashFlowSettings,
  creditors: Creditor[]
): DailyForecast[] => {
  const forecasts: DailyForecast[] = [];
  const today = new Date();
  
  let currentCashBalance = settings.cashOnHand;
  let currentBankBalance = settings.bankBalance;
  
  for (let i = 0; i < 90; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    
    const dateString = forecastDate.toISOString().split('T')[0];
    const dayExpenses = expenses.filter(expense => expense.dueDate === dateString);
    
    const openingCashBalance = currentCashBalance;
    const openingBankBalance = currentBankBalance;
    const openingBalance = openingCashBalance + openingBankBalance;
    
    const cashExpenses = dayExpenses
      .filter(expense => expense.paymentMethod === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const bankExpenses = dayExpenses
      .filter(expense => expense.paymentMethod === 'bank')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalExpenses = cashExpenses + bankExpenses;
    
    // Update balances
    currentCashBalance = currentCashBalance + settings.dailyIncome - cashExpenses;
    currentBankBalance = currentBankBalance - bankExpenses;
    
    const closingBalance = currentCashBalance + currentBankBalance;
    
    const expenseCreditors = dayExpenses.map(expense => {
      const creditor = creditors.find(c => c.id === expense.creditorId);
      return creditor ? creditor.name : 'Unknown';
    });
    
    const notes = dayExpenses.map(expense => expense.note).filter(note => note.trim() !== '');
    
    forecasts.push({
      day: i + 1,
      date: dateString,
      openingBalance,
      totalExpenses,
      cashExpenses,
      bankExpenses,
      creditors: expenseCreditors,
      closingBalance,
      notes
    });
  }
  
  return forecasts;
};

export const calculateCreditorOwed = (creditorId: string, expenses: Expense[]): number => {
  return expenses
    .filter(expense => expense.creditorId === creditorId)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};