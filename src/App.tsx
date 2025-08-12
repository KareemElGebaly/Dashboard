import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CreditorManager from './components/CreditorManager';
import ExpenseManager from './components/ExpenseManager';
import CashFlowMonitor from './components/CashFlowMonitor';
import UserManagement from './components/UserManagement';
import { Creditor, Expense, CashFlowSettings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateCreditorOwed } from './utils/calculations';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [creditors, setCreditors] = useLocalStorage<Creditor[]>('creditors', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [creditorTypes, setCreditorTypes] = useLocalStorage<string[]>('creditorTypes', ['Supplier', 'Landlord']);
  const [settings, setSettings] = useLocalStorage<CashFlowSettings>('cashFlowSettings', {
    cashOnHand: 0,
    bankBalance: 0,
    dailyIncome: 0,
  });

  // Update creditor totals when expenses change
  useEffect(() => {
    const updatedCreditors = creditors.map(creditor => ({
      ...creditor,
      totalOwed: calculateCreditorOwed(creditor.id, expenses),
    }));
    setCreditors(updatedCreditors);
  }, [expenses, creditors]);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const handleAddCreditor = (creditorData: Omit<Creditor, 'id' | 'totalOwed'>) => {
    const newCreditor: Creditor = {
      ...creditorData,
      id: Date.now().toString(),
      totalOwed: 0,
    };
    setCreditors([...creditors, newCreditor]);
  };

  const handleUpdateCreditor = (updatedCreditor: Creditor) => {
    setCreditors(creditors.map(creditor => 
      creditor.id === updatedCreditor.id ? updatedCreditor : creditor
    ));
  };

  const handleDeleteCreditor = (id: string) => {
    setCreditors(creditors.filter(creditor => creditor.id !== id));
    setExpenses(expenses.filter(expense => expense.creditorId !== id));
  };

  const handleAddCreditorType = (type: string) => {
    if (!creditorTypes.includes(type)) {
      setCreditorTypes([...creditorTypes, type]);
    }
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            creditors={creditors}
            expenses={expenses}
            settings={settings}
          />
        );
      case 'creditors':
        return (
          <CreditorManager
            creditors={creditors}
            onAddCreditor={handleAddCreditor}
            onUpdateCreditor={handleUpdateCreditor}
            onDeleteCreditor={handleDeleteCreditor}
            creditorTypes={creditorTypes}
            onAddCreditorType={handleAddCreditorType}
          />
        );
      case 'expenses':
        return (
          <ExpenseManager
            expenses={expenses}
            creditors={creditors}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'cash-flow':
        return (
          <CashFlowMonitor
            settings={settings}
            onUpdateSettings={setSettings}
            expenses={expenses}
            creditors={creditors}
          />
        );
      case 'users':
        return isAdmin ? <UserManagement /> : <Dashboard creditors={creditors} expenses={expenses} settings={settings} />;
      default:
        return <Dashboard creditors={creditors} expenses={expenses} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;