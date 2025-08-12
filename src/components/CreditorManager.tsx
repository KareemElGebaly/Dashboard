import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Creditor } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CreditorManagerProps {
  creditors: Creditor[];
  onAddCreditor: (creditor: Omit<Creditor, 'id' | 'totalOwed'>) => void;
  onUpdateCreditor: (creditor: Creditor) => void;
  onDeleteCreditor: (id: string) => void;
  creditorTypes: string[];
  onAddCreditorType: (type: string) => void;
}

const CreditorManager: React.FC<CreditorManagerProps> = ({
  creditors,
  onAddCreditor,
  onUpdateCreditor,
  onDeleteCreditor,
  creditorTypes,
  onAddCreditorType,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<Creditor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contactInfo: '',
  });
  const [newType, setNewType] = useState('');
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', type: '', contactInfo: '' });
    setEditingCreditor(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;

    if (editingCreditor) {
      onUpdateCreditor({ ...editingCreditor, ...formData });
    } else {
      onAddCreditor(formData);
    }
    resetForm();
  };

  const handleEdit = (creditor: Creditor) => {
    setFormData({
      name: creditor.name,
      type: creditor.type,
      contactInfo: creditor.contactInfo || '',
    });
    setEditingCreditor(creditor);
    setShowForm(true);
  };

  const handleAddNewType = () => {
    if (newType.trim() && !creditorTypes.includes(newType.trim())) {
      onAddCreditorType(newType.trim());
      setFormData({ ...formData, type: newType.trim() });
      setNewType('');
      setShowNewTypeInput(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creditor Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Creditor
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingCreditor ? 'Edit Creditor' : 'Add New Creditor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select type...</option>
                  {creditorTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewTypeInput(!showNewTypeInput)}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  + New
                </button>
              </div>
              
              {showNewTypeInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter new type..."
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewType}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Info
              </label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Phone, email, or address..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingCreditor ? 'Update' : 'Add'} Creditor
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {creditors.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No creditors added yet. Add your first creditor to get started.</p>
          </div>
        ) : (
          creditors.map(creditor => (
            <div key={creditor.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{creditor.name}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {creditor.type}
                    </span>
                  </div>
                  {creditor.contactInfo && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{creditor.contactInfo}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Owed:</span>
                    <span className={`font-semibold ${creditor.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(creditor.totalOwed)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(creditor)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCreditor(creditor.id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditorManager;