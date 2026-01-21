'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database';

type User = Tables<'users'>;
type UserMandi = Tables<'user_mandis'> & {
  mandis: {
    name: string;
    districts: { name: string } | null;
    states: { name: string } | null;
  } | null;
};

interface UserDetails extends User {
  user_mandis: UserMandi[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      // Fetch user details with associated mandis
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(
          `
          *,
          user_mandis (
            *,
            mandis (
              name,
              districts (name),
              states (name)
            )
          )
        `
        )
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
          <Link
            href="/superuser/users"
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/superuser/users"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Users
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
              <p className="text-gray-600">User Details & Associated Markets</p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.phone_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
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
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
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
                </dd>
              </div>
              {user.business_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.business_name}</dd>
                </div>
              )}
              {user.farm_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Farm Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.farm_name}</dd>
                </div>
              )}
              {user.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.address}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">District</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.district_id || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.state_id || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Language</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.language_preference}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Preferred Currency</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.preferred_currency || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price Unit</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.price_unit || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.average_rating || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rating Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.rating_count}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}{' '}
                  {new Date(user.created_at).toLocaleTimeString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updated_at).toLocaleDateString()}{' '}
                  {new Date(user.updated_at).toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Associated Markets */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Associated Markets ({user.user_mandis?.length || 0})
            </h2>
          </div>
          <div className="p-6">
            {user.user_mandis && user.user_mandis.length > 0 ? (
              <div className="grid gap-4">
                {user.user_mandis.map(userMandi => (
                  <div key={userMandi.mandi_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {userMandi.mandis?.name || 'Unknown Market'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {userMandi.mandis?.districts?.name && userMandi.mandis?.states?.name
                            ? `${userMandi.mandis.districts.name}, ${userMandi.mandis.states.name}`
                            : 'Location not available'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        Added: {new Date(userMandi.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No markets associated with this user</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
