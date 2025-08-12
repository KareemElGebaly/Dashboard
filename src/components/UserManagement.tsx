import React, { useState } from 'react';
import { Plus, Trash2, Users, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const { isAdmin, inviteUser, getInvitedUsers, deleteUser } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load invited users on component mount
  useEffect(() => {
    loadInvitedUsers();
  }, []);

  const loadInvitedUsers = async () => {
    try {
      const users = await getInvitedUsers();
      setInvitedUsers(users);
    } catch (error) {
      console.error('Failed to load invited users:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await inviteUser(formData.email, formData.name);
      if (result) {
        setSuccess('User invited successfully!');
        setFormData({ email: '', name: '' });
        setShowInviteForm(false);
        await loadInvitedUsers(); // Reload users list
      } else {
        setError('Failed to invite user. User may already exist.');
      }
    } catch (err) {
      setError('An error occurred while inviting the user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await deleteUser(userId);
      if (result) {
        setSuccess('User deleted successfully!');
        await loadInvitedUsers(); // Reload users list
      } else {
        setError('Failed to delete user.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ email: '', name: '' });
    setShowInviteForm(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </button>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          error 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
        }`}>
          {error || success}
        </div>
      )}

      {showInviteForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Invitation
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Invited Users ({invitedUsers.length})
          </h3>
        </div>
        
        {invitedUsers.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No users invited yet. Invite your first user to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invited Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invitedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;