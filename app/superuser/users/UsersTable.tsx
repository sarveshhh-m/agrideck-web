'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';
import Table from '@/app/components/Table';
import Badge from '@/app/components/Badge';
import SearchInput from '@/app/components/SearchInput';
import FilterDropdown from '@/app/components/FilterDropdown';
import Pagination from '@/app/components/Pagination';

type User = Tables<'users'>;

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500, 1000];

// Loading Skeleton
const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-md w-full"></div>
    <div className="space-y-2">
      <div className="h-12 bg-gray-200 rounded-md"></div>
      <div className="h-12 bg-gray-200 rounded-md"></div>
      <div className="h-12 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

type State = { id: string; name: string };
type District = { id: string; name: string };

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const supabase = createClient();

  const fetchUsers = useCallback(
    async (search = '', page = 1, size = 10, stateId = '', districtId = '') => {
      setLoading(true);
      try {
        const from = (page - 1) * size;
        const to = from + size - 1;

        let query = supabase
          .from('users')
          .select('*, districts(name), states(name)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (search.trim()) {
          query = query.or(
            `full_name.ilike.%${search}%,business_name.ilike.%${search}%,phone_number.ilike.%${search}%`
          );
        }

        if (stateId) query = query.eq('state_id', stateId);
        if (districtId) query = query.eq('district_id', districtId);

        const { data, error, count } = await query;

        if (error) throw error;
        setUsers(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );
  
  const fetchStates = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('states').select('id, name').order('name');
      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  }, [supabase]);

  const fetchDistricts = useCallback(async (stateId = '') => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    try {
      const { data, error } = await supabase.from('districts').select('id, name').eq('state_id', stateId).order('name');
      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    fetchDistricts(selectedState);
  }, [selectedState, fetchDistricts]);

  useEffect(() => {
    fetchUsers(searchQuery, currentPage, pageSize, selectedState, selectedDistrict);
  }, [searchQuery, currentPage, pageSize, selectedState, selectedDistrict, fetchUsers]);

  const handleUserClick = (user: User) => {
    window.location.href = `/superuser/users/${user.id}`;
  };

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessor: (user: User) => (
          <div>
            <div className="font-medium text-gray-900">{user.full_name}</div>
            {user.business_name && <div className="text-gray-500">{user.business_name}</div>}
          </div>
        ),
      },
      {
        header: 'Phone',
        accessor: 'phone_number',
      },
      {
        header: 'State',
        accessor: (user: any) => user.states?.name || 'N/A',
      },
      {
        header: 'District',
        accessor: (user: any) => user.districts?.name || 'N/A',
      },
      {
        header: 'Role',
        accessor: (user: User) => <Badge type="role" value={user.role} />,
      },
      {
        header: 'Status',
        accessor: (user: User) => <Badge type="status" value={user.status} />,
      },
      {
        header: 'Created',
        accessor: (user: User) => new Date(user.created_at).toLocaleDateString(),
      },
    ],
    []
  );

  if (loading) return <TableSkeleton />;

  const stateOptions = states.map(s => ({ value: s.id, label: s.name }));
  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / pageSize)}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
        <div className="flex flex-wrap gap-4 items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, business, or phone..."
            className="flex-1 min-w-[250px]"
          />
          <FilterDropdown
            label="State"
            value={selectedState}
            onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setCurrentPage(1); }}
            options={stateOptions}
            defaultOptionLabel="All States"
          />
          <FilterDropdown
            label="District"
            value={selectedDistrict}
            onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
            options={districtOptions}
            disabled={!selectedState}
            defaultOptionLabel="All Districts"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <Table data={users} columns={columns} onRowClick={handleUserClick} searchQuery={searchQuery} />
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <h3 className="text-lg font-semibold">No Users Found</h3>
          <p>{searchQuery ? 'No users match your search.' : 'There are currently no users to display.'}</p>
        </div>
      )}
    </div>
  );
}
