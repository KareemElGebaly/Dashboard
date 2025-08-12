import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { CashFlowSettings, DailyForecast, Creditor, Expense } from '../types';
import { generateDailyForecasts, formatCurrency, formatDate } from '../utils/calculations';

interface CashFlowMonitorProps {
  settings: CashFlowSettings;
  onUpdateSettings: (settings: CashFlowSettings) => void;
  expenses: Expense[];
  creditors: Creditor[];
}

const CashFlowMonitor: React.FC<CashFlowMonitorProps> = ({
  settings,
  onUpdateSettings,
  expenses,
  creditors,
}) => {
  const [formData, setFormData] = useState({
    cashOnHand: settings.cashOnHand.toString(),
    bankBalance: settings.bankBalance.toString(),
    dailyIncome: settings.dailyIncome.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      cashOnHand: parseFloat(formData.cashOnHand) || 0,
      bankBalance: parseFloat(formData.bankBalance) || 0,
      dailyIncome: parseFloat(formData.dailyIncome) || 0,
    });
  };

  const forecasts = generateDailyForecasts(expenses, settings, creditors);
  const negativeDays = forecasts.filter(f => f.closingBalance < 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Flow Monitor</h2>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Financial Position</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cash on Hand
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cashOnHand}
              onChange={(e) => setFormData({ ...formData, cashOnHand: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Balance
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.bankBalance}
              onChange={(e) => setFormData({ ...formData, bankBalance: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Income Forecast
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.dailyIncome}
              onChange={(e) => setFormData({ ...formData, dailyIncome: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Update Forecast
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards */}
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
            <DollarSign className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Income</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {formatCurrency(settings.dailyIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">90-Day Outlook</p>
              <p className={`text-lg font-semibold break-words ${
                forecasts[89]?.closingBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(forecasts[89]?.closingBalance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Days</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {negativeDays.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 90-Day Forecast Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">90-Day Cash Flow Forecast</h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Opening Balance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Creditors
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Closing Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {forecasts.map((forecast) => (
                <tr 
                  key={forecast.day} 
                  className={`hover:bg-gray-50 ${
                    forecast.closingBalance < 0 ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {forecast.day}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(forecast.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(forecast.openingBalance)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {forecast.totalExpenses > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(forecast.totalExpenses)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {forecast.totalExpenses > 0 && (
                      <div className="flex gap-1">
                        {forecast.cashExpenses > 0 && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Cash: {formatCurrency(forecast.cashExpenses)}
                          </span>
                        )}
                        {forecast.bankExpenses > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Bank: {formatCurrency(forecast.bankExpenses)}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs">
                    {forecast.creditors.length > 0 && (
                      <div className="truncate">
                        {forecast.creditors.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    forecast.closingBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(forecast.closingBalance)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {forecast.notes.length > 0 && (
                      <div className="truncate">
                        {forecast.notes.join('; ')}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlowMonitor;