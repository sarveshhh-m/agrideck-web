'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Users, Building, BarChart3, MapPin, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">AgriDeck Admin</h1>
          </div>

          <nav className="px-4 py-6 flex-grow overflow-y-auto">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/superuser"
                  className="flex items-center px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/superuser/users"
                  className="flex items-center px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </Link>
              </li>
              <li>
                <Link
                  href="/superuser/commodities"
                  className="flex items-center px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Building className="w-5 h-5 mr-3" />
                  Commodities
                </Link>
              </li>
              <li>
                <Link
                  href="/superuser/mandis"
                  className="flex items-center px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Building className="w-5 h-5 mr-3" />
                  Mandis
                </Link>
              </li>
              <li>
                <Link
                  href="/superuser/states"
                  className="flex items-center px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <MapPin className="w-5 h-5 mr-3" />
                  States
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button at bottom */}
          <div className="px-4 py-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white shadow-md border-b border-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            </div>
          </header>

          <main className="p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  );
}
