import React from 'react';
import { DollarSign, Users, Calendar, TrendingDown, AlertTriangle } from 'lucide-react';
import { Creditor, Expense, CashFlowSettings } from '../types';
import { formatCurrency, calculateCreditorOwed, generateDailyForecasts } from '../utils/calculations';

interface DashboardProps {
  creditors: Creditor[];
  expenses: Expense[];
  settings: CashFlowSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ creditors, expenses, settings }) => {
  const totalCreditors = creditors.length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return expenseDate <= nextWeek && expenseDate >= new Date();
  });

  const forecasts = generateDailyForecasts(expenses, settings, creditors);
  const criticalDays = forecasts.filter(f => f.closingBalance < 0).slice(0, 5);

  const topCreditors = creditors
    .map(creditor => ({
      ...creditor,
      totalOwed: calculateCreditorOwed(creditor.id, expenses)
    }))
    .sort((a, b) => b.totalOwed - a.totalOwed)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Cash Flow Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {formatCurrency(settings.cashOnHand + settings.bankBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Creditors</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalCreditors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Expenses</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Days</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{criticalDays.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Expenses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            <span className="dark:text-white">Upcoming Expenses (Next 7 Days)</span>
          </h3>
          {upcomingExpenses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No expenses due in the next 7 days</p>
          ) : (
            <div className="space-y-3">
              {upcomingExpenses.slice(0, 5).map(expense => {
                const creditor = creditors.find(c => c.id === expense.creditorId);
                return (
                  <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{creditor?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(expense.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        expense.paymentMethod === 'cash'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcomingExpenses.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  +{upcomingExpenses.length - 5} more expenses
                </p>
              )}
            </div>
          )}
        </div>

        {/* Top Creditors */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
            Top Creditors by Amount Owed
          </h3>
          {topCreditors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No creditors with pending expenses</p>
          ) : (
            <div className="space-y-3">
              {topCreditors.map(creditor => (
                <div key={creditor.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{creditor.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{creditor.type}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${creditor.totalOwed > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {formatCurrency(creditor.totalOwed)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Critical Days Alert */}
      {criticalDays.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400 dark:text-red-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Cash Flow Alert: {criticalDays.length} Critical Days Ahead
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>The following days show negative cash flow:</p>
                <ul className="mt-1 list-disc list-inside">
                  {criticalDays.map(day => (
                    <li key={day.day}>
                      Day {day.day} ({new Date(day.date).toLocaleDateString()}): 
                      <span className="font-semibold ml-1">{formatCurrency(day.closingBalance)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;