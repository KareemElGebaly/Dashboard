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
import { useDatabase } from './hooks/useDatabase';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    creditors,
    expenses,
    creditorTypes,
    settings,
    loading,
    error,
    addCreditor,
    updateCreditor,
    deleteCreditor,
    addExpense,
    updateExpense,
    deleteExpense,
    updateSettings,
    addCreditorType,
  } = useDatabase(user?.id || null);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            onAddCreditor={addCreditor}
            onUpdateCreditor={updateCreditor}
            onDeleteCreditor={deleteCreditor}
            creditorTypes={creditorTypes}
            onAddCreditorType={addCreditorType}
          />
        );
      case 'expenses':
        return (
          <ExpenseManager
            expenses={expenses}
            creditors={creditors}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
          />
        );
      case 'cash-flow':
        return (
          <CashFlowMonitor
            settings={settings}
            onUpdateSettings={updateSettings}
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