import { useState, useEffect } from 'react';
import { Creditor, Expense, CashFlowSettings, User } from '../types';
import { dbApi } from '../api/database';

export function useDatabase(userId: string | null) {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditorTypes, setCreditorTypes] = useState<string[]>([]);
  const [settings, setSettings] = useState<CashFlowSettings>({
    cashOnHand: 0,
    bankBalance: 0,
    dailyIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data when userId changes
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [creditorsData, expensesData, typesData, settingsData] = await Promise.all([
        dbApi.getCreditors(userId),
        dbApi.getExpenses(userId),
        dbApi.getCreditorTypes(userId),
        dbApi.getSettings(userId),
      ]);

      setCreditors(creditorsData);
      setExpenses(expensesData);
      setCreditorTypes(typesData);
      setSettings(settingsData);
    } catch (err) {
      setError('Failed to load data from database');
      console.error('Database load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Creditor operations
  const addCreditor = async (creditorData: Omit<Creditor, 'id' | 'totalOwed'>) => {
    if (!userId) return false;

    const newCreditor = {
      ...creditorData,
      id: Date.now().toString(),
    };

    const success = await dbApi.createCreditor(newCreditor, userId);
    if (success) {
      await loadAllData(); // Reload to get updated totals
    }
    return success;
  };

  const updateCreditor = async (updatedCreditor: Creditor) => {
    if (!userId) return false;

    const success = await dbApi.updateCreditor(updatedCreditor, userId);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  const deleteCreditor = async (creditorId: string) => {
    if (!userId) return false;

    const success = await dbApi.deleteCreditor(creditorId, userId);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  // Expense operations
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!userId) return false;

    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
    };

    const success = await dbApi.createExpense(newExpense, userId);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  const updateExpense = async (updatedExpense: Expense) => {
    if (!userId) return false;

    const success = await dbApi.updateExpense(updatedExpense, userId);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  const deleteExpense = async (expenseId: string) => {
    if (!userId) return false;

    const success = await dbApi.deleteExpense(expenseId, userId);
    if (success) {
      await loadAllData();
    }
    return success;
  };

  // Settings operations
  const updateSettings = async (newSettings: CashFlowSettings) => {
    if (!userId) return false;

    const success = await dbApi.updateSettings(newSettings, userId);
    if (success) {
      setSettings(newSettings);
    }
    return success;
  };

  // Creditor types operations
  const addCreditorType = async (typeName: string) => {
    if (!userId) return false;

    const success = await dbApi.addCreditorType(typeName, userId);
    if (success) {
      const updatedTypes = await dbApi.getCreditorTypes(userId);
      setCreditorTypes(updatedTypes);
    }
    return success;
  };

  return {
    // Data
    creditors,
    expenses,
    creditorTypes,
    settings,
    loading,
    error,

    // Operations
    addCreditor,
    updateCreditor,
    deleteCreditor,
    addExpense,
    updateExpense,
    deleteExpense,
    updateSettings,
    addCreditorType,
    
    // Utility
    refreshData: loadAllData,
  };
}