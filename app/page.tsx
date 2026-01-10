import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Icon */}
            <div className="flex-shrink-0">
              <Image
                src="/icon.png"
                alt="Agrideck"
                width={200}
                height={200}
                className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56"
                priority
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Agrideck - <span className="text-primary-600">For Next Generation Farmers</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6">
                Check daily mandi prices, list your produce, negotiate with buyers, and close deals—all in one platform.
                Empowering farmers with real-time market information and direct buyer connections.
              </p>
              <a
                href="mailto:support@agrideck.com?subject=Become%20a%20Tester%20-%20Agrideck&body=Hi%20Agrideck%20Team,%0D%0A%0D%0AI%20would%20like%20to%20become%20a%20tester%20for%20the%20Agrideck%20app.%0D%0A%0D%0AName:%20%0D%0ARole:%20(Farmer/Buyer)%0D%0ALocation:%20%0D%0APhone%20Number:%20%0D%0A%0D%0AThank%20you!"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                Become a Tester
              </a>
            </div>
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
