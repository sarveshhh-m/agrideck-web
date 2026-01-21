import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Button from "./components/Button";
import FeatureCard from "./components/FeatureCard";

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
              <Button
                href="mailto:iglost999@gmail.com?subject=Become%20a%20Tester%20-%20Agrideck&body=Hi%20Agrideck%20Team,%0D%0A%0D%0AI%20would%20like%20to%20become%20a%20tester%20for%20the%20Agrideck%20app.%0D%0A%0D%0AName:%20%0D%0ARole:%20(Farmer/Buyer)%0D%0ALocation:%20%0D%0APhone%20Number:%20%0D%0A%0D%0AThank%20you!"
              >
                Become a Tester
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Dual-Role Authentication"
              description="Separate interfaces for farmers and buyers with role-specific features and optimized workflows."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Real-time Listings"
              description="Create and browse agricultural produce listings with photos, descriptions, and instant updates powered by Supabase real-time database."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Offer Negotiation System"
              description="Built-in counter-offer system enabling fair price negotiation between farmers and buyers for transparent deal-making."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Deal Management & Tracking"
              description="Comprehensive transaction tracking and management with complete history, analytics, and deal status monitoring."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Multi-language Support"
              description="Available in 8 Indian languages: English, Hindi, Tamil, Bengali, Gujarati, Kannada, Malayalam, and Odia to serve farmers across India."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Dark & Light Theme"
              description="Full theme support with automatic system preference detection for comfortable viewing in any lighting condition."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Secure & Private"
              description="Enterprise-grade security with Supabase PostgreSQL, Row Level Security (RLS) policies, and MMKV encrypted local storage."
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary-600 mt-1" />}
              title="Cross-Platform Mobile App"
              description="Built with React Native and Expo SDK for seamless experience on both iOS and Android devices."
            />
          </div>
        </div>
      </section>

</div>
  );
}
