'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';

type User = Tables<'users'>;

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchUsers = useCallback(
    async (search = '') => {
      try {
        let query = supabase.from('users').select('*').order('created_at', { ascending: false });

        if (search.trim()) {
          query = query.or(
            `full_name.ilike.%${search}%,business_name.ilike.%${search}%,phone_number.ilike.%${search}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers(searchQuery);
  }, [searchQuery, fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleUserClick = (userId: string) => {
    window.location.href = `/superuser/users/${userId}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, business name, or phone..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="text-sm text-gray-500">{users.length} users</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  {user.business_name && (
                    <div className="text-sm text-gray-500">{user.business_name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phone_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'farmer'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">No users match your search</div>
      )}
      {users.length === 0 && !searchQuery && (
        <div className="text-center py-8 text-gray-500">No users found</div>
      )}
    </div>
  );
}
