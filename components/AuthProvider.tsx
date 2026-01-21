'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    console.log('🔍 AuthProvider: Initializing...');

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log('📋 AuthProvider: Initial session:', session);

        if (error) {
          console.error('❌ AuthProvider: Session error:', error);
          setError(error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err: any) {
        console.error('❌ AuthProvider: Failed to get initial session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthProvider: Auth state changed:', event, 'Session:', !!session);

      setSession(session);
      setUser(session?.user ?? null);
      setError(null);

      // Don't set loading here as it interferes with OTP flow
    });

    return () => {
      console.log('🧹 AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect to check admin role when user/session changes
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user || !session) {
        console.log('🚪 AuthProvider: No user or session, setting not authenticated');
        setIsAuthenticated(false);
        return;
      }

      console.log('👤 AuthProvider: Checking admin role for user:', user.id);

      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role, status, full_name')
          .eq('id', user.id)
          .single();

        console.log('👤 AuthProvider: User profile:', userProfile);
        console.log('❌ AuthProvider: Profile error:', profileError);

        if (profileError) {
          console.error('❌ AuthProvider: Database error:', profileError);
          setError(`Database error: ${profileError.message}`);
          setIsAuthenticated(false);
          return;
        }

        if (!userProfile) {
          console.error('❌ AuthProvider: User not found in database');
          setError('User profile not found in database');
          setIsAuthenticated(false);
          return;
        }

        const isAdmin = userProfile.role === 'admin';
        const isActive = userProfile.status === 'active';

        console.log('🔐 AuthProvider: Role check - Admin:', isAdmin, 'Active:', isActive);

        if (isAdmin && isActive) {
          console.log('✅ AuthProvider: User is admin and active');
          setIsAuthenticated(true);
          setError(null);
        } else {
          const reason = !isAdmin ? 'Admin role required' : 'Account not active';
          console.log('❌ AuthProvider: Access denied -', reason);
          setError(`Access denied: ${reason}`);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.error('❌ AuthProvider: Role check error:', err);
        setError(`Role verification failed: ${err.message}`);
        setIsAuthenticated(false);
      }
    };

    // Only run role check if we have a user and are not in loading state
    if (!loading) {
      checkAdminRole();
    }
  }, [user, session, loading]);

  console.log('🔄 AuthProvider render:', {
    loading,
    hasSession: !!session,
    hasUser: !!user,
    isAuthenticated,
    error,
  });

  if (loading) {
    console.log('⏳ AuthProvider: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing authentication</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    console.log('🔒 AuthProvider: No session, showing login form');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in with your admin phone number
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 AuthProvider: Session exists but not authenticated, showing access denied');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You don't have admin privileges
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ AuthProvider: Showing dashboard');
  return <>{children}</>;
}

function AuthForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if the phone number belongs to an admin user
      const phoneForQuery = phone.replace(/^\+/, '');
      console.log('📱 AuthForm: Checking admin phone:', phoneForQuery);

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role, phone_number, full_name, status')
        .eq('phone_number', phoneForQuery)
        .eq('role', 'admin')
        .single();

      console.log('👤 AuthForm: Admin check result:', userProfile);

      if (profileError || !userProfile) {
        throw new Error('This phone number is not registered as an admin user.');
      }

      if (userProfile.status !== 'active') {
        throw new Error('Admin account is not active.');
      }

      // Send OTP
      console.log('📤 AuthForm: Sending OTP to:', phone);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (otpError) throw otpError;

      console.log('✅ AuthForm: OTP sent successfully');
      setStep('otp');
      setResendTimer(60);
    } catch (error: any) {
      console.error('❌ AuthForm: Send OTP error:', error);
      setError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 AuthForm: Verifying OTP:', otp);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (verifyError) throw verifyError;

      console.log('✅ AuthForm: OTP verified successfully');
      // AuthProvider will automatically detect the session change
    } catch (error: any) {
      console.error('❌ AuthForm: Verify OTP error:', error);
      setError(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 AuthForm: Resending OTP');
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      setResendTimer(60);
    } catch (error: any) {
      console.error('❌ AuthForm: Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 'phone' ? (
        <form className="space-y-6" onSubmit={handleSendOTP}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Admin Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">Only admin users can access this dashboard</p>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleVerifyOTP}>
          <div>
            <div className="text-sm text-gray-600 mb-2">Code sent to {phone}</div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Change phone number
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </>
  );
}
