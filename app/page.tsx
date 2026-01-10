import { Sprout, Users, TrendingUp, Shield, Globe, Smartphone, MessageSquare, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-primary-600">For Next Generation Farmers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Check daily mandi prices, list your produce, negotiate with buyers, and close deals—all in one platform.
              Empowering farmers with real-time market information and direct buyer connections.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Dual-Role Authentication</h3>
                <p className="text-gray-600">
                  Separate interfaces for farmers and buyers with role-specific features and optimized workflows.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Real-time Listings</h3>
                <p className="text-gray-600">
                  Create and browse agricultural produce listings with photos, descriptions, and instant updates powered by Supabase real-time database.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Offer Negotiation System</h3>
                <p className="text-gray-600">
                  Built-in counter-offer system enabling fair price negotiation between farmers and buyers for transparent deal-making.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Deal Management & Tracking</h3>
                <p className="text-gray-600">
                  Comprehensive transaction tracking and management with complete history, analytics, and deal status monitoring.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Multi-language Support</h3>
                <p className="text-gray-600">
                  Available in 8 Indian languages: English, Hindi, Tamil, Bengali, Gujarati, Kannada, Malayalam, and Odia to serve farmers across India.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Dark & Light Theme</h3>
                <p className="text-gray-600">
                  Full theme support with automatic system preference detection for comfortable viewing in any lighting condition.
                </p>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure & Private</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with Supabase PostgreSQL, Row Level Security (RLS) policies, and MMKV encrypted local storage.
                </p>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Cross-Platform Mobile App</h3>
                <p className="text-gray-600">
                  Built with React Native and Expo SDK for seamless experience on both iOS and Android devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

</div>
  );
}
