'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import SearchInput from '@/app/components/SearchInput';
import {
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Star,
  Building,
  Home,
  Shield,
  CheckCircle,
  XCircle,
  HelpCircle,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import type { Tables } from '@/lib/supabase/database';

// Types (from original file)
type User = Tables<'users'>;
type UserMandi = Tables<'user_mandis'> & {
  mandis: {
    name: string;
    districts: { name: string } | null;
    states: { name: string } | null;
  } | null;
};

interface UserDetails extends User {
  districts: { name: string } | null;
  states: { name: string } | null;
  user_mandis: UserMandi[];
}

type Market = {
  id: number;
  name: string;
  district_id: string | null;
  state_id: string | null;
  districts: { name: string } | null;
  states: { name: string } | null;
};

// Reusable components for the page

const InfoCard = ({ title, children }: { title: string | React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      {typeof title === 'string' ? (
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      ) : (
        <div className="text-xl font-semibold text-gray-800">{title}</div>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500 flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </dt>
    <dd className="mt-1 text-md text-gray-900">{value}</dd>
  </div>
);

const RoleBadge = ({ role }: { role: string }) => {
  const roleStyles: { [key: string]: string } = {
    admin: 'bg-purple-100 text-purple-800',
    farmer: 'bg-green-100 text-green-800',
    trader: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
        roleStyles[role] || roleStyles.default
      }`}
    >
      <Shield className="w-4 h-4 mr-2" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: { class: string; icon: React.ReactNode } } = {
    active: { class: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4 mr-2" /> },
    suspended: { class: 'bg-yellow-100 text-yellow-800', icon: <HelpCircle className="w-4 h-4 mr-2" /> },
    inactive: { class: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4 mr-2" /> },
    default: { class: 'bg-gray-100 text-gray-800', icon: <HelpCircle className="w-4 h-4 mr-2" /> },
  };

  const currentStatus = statusStyles[status] || statusStyles.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.class}`}
    >
      {currentStatus.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main page component
export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);
  const [availableMarkets, setAvailableMarkets] = useState<Market[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [processingMarket, setProcessingMarket] = useState<string | number | null>(null);
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
          districts (name),
          states (name),
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

  const fetchAvailableMarkets = async () => {
    if (!user?.state_id) {
      alert('User does not have a state assigned.');
      return;
    }

    setLoadingMarkets(true);
    try {
      const { data: marketsData, error: marketsError } = await supabase
        .from('mandis')
        .select(
          `
          id,
          name,
          district_id,
          state_id,
          districts (name),
          states (name)
        `
        )
        .eq('state_id', user.state_id)
        .order('name');

      if (marketsError) throw marketsError;
      setAvailableMarkets((marketsData || []) as unknown as Market[]);
    } catch (error) {
      console.error('Error fetching markets:', error);
      alert('Failed to load markets. Please try again.');
    } finally {
      setLoadingMarkets(false);
    }
  };

  const handleRemoveMarket = async (mandiId: string | number) => {
    if (!confirm('Are you sure you want to remove this market from the user?')) {
      return;
    }

    setProcessingMarket(mandiId);
    try {
      const { error } = await supabase
        .from('user_mandis')
        .delete()
        .eq('user_id', userId)
        .eq('mandi_id', mandiId);

      if (error) throw error;

      await fetchUserDetails();
      alert('Market removed successfully!');
    } catch (error) {
      console.error('Error removing market:', error);
      alert('Failed to remove market. Please try again.');
    } finally {
      setProcessingMarket(null);
    }
  };

  const handleAddMarket = async (mandiId: string | number) => {
    setProcessingMarket(mandiId);
    try {
      const { error } = await supabase.from('user_mandis').insert({
        user_id: userId,
        mandi_id: mandiId,
      });

      if (error) throw error;

      await fetchUserDetails();
      setShowAddMarketModal(false);
      setSearchQuery('');
      alert('Market assigned successfully!');
    } catch (error: any) {
      console.error('Error adding market:', error);
      if (error?.code === '23505') {
        alert('This market is already assigned to the user.');
      } else {
        alert('Failed to assign market. Please try again.');
      }
    } finally {
      setProcessingMarket(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700">User not found</h2>
          <p className="text-gray-500 mt-2">The requested user could not be found.</p>
          <Link
            href="/superuser/users"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users List
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/superuser/users"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Users
          </Link>
          <div className="mt-4 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:truncate">
                {user.full_name}
              </h1>
              <p className="mt-1 text-md text-gray-500">@{user.phone_number}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Details */}
            <InfoCard title="User Details">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                <InfoItem
                  icon={<User className="w-5 h-5 text-gray-400" />}
                  label="Full Name"
                  value={user.full_name}
                />
                <InfoItem
                  icon={<Phone className="w-5 h-5 text-gray-400" />}
                  label="Phone Number"
                  value={user.phone_number}
                />
                {user.business_name && (
                  <InfoItem
                    icon={<Briefcase className="w-5 h-5 text-gray-400" />}
                    label="Business Name"
                    value={user.business_name}
                  />
                )}
                {user.farm_name && (
                  <InfoItem
                    icon={<Home className="w-5 h-5 text-gray-400" />}
                    label="Farm Name"
                    value={user.farm_name}
                  />
                )}
                {user.address && (
                  <InfoItem
                    icon={<MapPin className="w-5 h-5 text-gray-400" />}
                    label="Address"
                    value={user.address}
                  />
                )}
              </dl>
            </InfoCard>
            {/* Status */}
            <InfoCard title="Status & Role">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <RoleBadge role={user.role ?? 'N/A'} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <StatusBadge status={user.status ?? 'N/A'} />
                </div>
              </div>
            </InfoCard>

            {/* Additional Info */}
            <InfoCard title="Additional Information">
              <dl className="space-y-6">
                <InfoItem
                  icon={<Star className="w-5 h-5 text-gray-400" />}
                  label="Average Rating"
                  value={`${user.average_rating || 'N/A'} (${user.rating_count} ratings)`}
                />
                <InfoItem
                  icon={<Clock className="w-5 h-5 text-gray-400" />}
                  label="Account Created"
                  value={new Date(user.created_at).toLocaleString()}
                />
                <InfoItem
                  icon={<Clock className="w-5 h-5 text-gray-400" />}
                  label="Last Updated"
                  value={new Date(user.updated_at).toLocaleString()}
                />
                <InfoItem
                  icon={<Building className="w-5 h-5 text-gray-400" />}
                  label="District"
                  value={user.districts?.name || 'N/A'}
                />
                <InfoItem
                  icon={<Building className="w-5 h-5 text-gray-400" />}
                  label="State"
                  value={user.states?.name || 'N/A'}
                />
              </dl>
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Associated Markets */}
            <InfoCard
              title={
                <div className="flex items-center justify-between">
                  <span>Associated Markets ({user.user_mandis?.length || 0})</span>
                  <button
                    onClick={() => {
                      setShowAddMarketModal(true);
                      fetchAvailableMarkets();
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Market
                  </button>
                </div>
              }
            >
              {user.user_mandis && user.user_mandis.length > 0 ? (
                <div className="space-y-4">
                  {user.user_mandis.map(userMandi => (
                    <div
                      key={userMandi.mandi_id}
                      className="border rounded-lg p-4 flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {userMandi.mandis?.name || 'Unknown Market'}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {userMandi.mandis?.districts?.name && userMandi.mandis?.states?.name
                            ? `${userMandi.mandis.districts.name}, ${userMandi.mandis.states.name}`
                            : 'Location not available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Added: {new Date(userMandi.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveMarket(userMandi.mandi_id)}
                        disabled={processingMarket === userMandi.mandi_id}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Remove market"
                      >
                        {processingMarket === userMandi.mandi_id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No markets associated with this user
                </p>
              )}
            </InfoCard>
          </div>
        </div>

        {/* Add Market Modal */}
        {showAddMarketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Assign Market to User</h2>
                <button
                  onClick={() => {
                    setShowAddMarketModal(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search markets by name or location..."
                />
              </div>

              {/* Markets List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingMarkets ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableMarkets
                      .filter(market => {
                        const searchLower = searchQuery.toLowerCase();
                        const alreadyAssigned = user?.user_mandis?.some(
                          um => um.mandi_id === market.id
                        );
                        if (alreadyAssigned) return false;

                        return (
                          market.name.toLowerCase().includes(searchLower) ||
                          market.districts?.name.toLowerCase().includes(searchLower) ||
                          market.states?.name.toLowerCase().includes(searchLower)
                        );
                      })
                      .map(market => (
                        <div
                          key={market.id}
                          className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{market.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {market.districts?.name && market.states?.name
                                ? `${market.districts.name}, ${market.states.name}`
                                : 'Location not available'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddMarket(market.id)}
                            disabled={processingMarket === market.id}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingMarket === market.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              'Assign'
                            )}
                          </button>
                        </div>
                      ))}
                    {availableMarkets.filter(market => {
                      const searchLower = searchQuery.toLowerCase();
                      const alreadyAssigned = user?.user_mandis?.some(um => um.mandi_id === market.id);
                      if (alreadyAssigned) return false;
                      return (
                        market.name.toLowerCase().includes(searchLower) ||
                        market.districts?.name.toLowerCase().includes(searchLower) ||
                        market.states?.name.toLowerCase().includes(searchLower)
                      );
                    }).length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        {searchQuery
                          ? 'No markets found matching your search'
                          : 'All available markets are already assigned to this user'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
