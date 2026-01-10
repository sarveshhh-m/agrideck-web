import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Agrideck",
  description: "Privacy Policy for Agrideck - Agricultural Marketplace",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-primary-100 text-lg">Last updated: January 10, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to Agrideck ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our mobile application and services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using Agrideck, you agree to the collection and use of information in accordance with this policy.
              If you do not agree with the terms of this Privacy Policy, please do not access the application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">We collect the following personal information when you register and use our services:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Name and contact information (email address, phone number)</li>
              <li>User role (farmer or buyer)</li>
              <li>Profile information and photos</li>
              <li>Location data (with your permission)</li>
              <li>Business information (for farmers: farm details, produce types)</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">2.2 Listing and Transaction Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Product listings (descriptions, photos, prices)</li>
              <li>Offers and counter-offers</li>
              <li>Transaction history and deal information</li>
              <li>Messages and communications between users</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Device information (type, operating system, unique device identifiers)</li>
              <li>Usage data (app features used, time spent, interactions)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Push notification tokens (if you enable notifications)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>Provide and maintain our service:</strong> To operate and deliver the core marketplace functionality</li>
              <li><strong>User authentication:</strong> To verify your identity and manage your account</li>
              <li><strong>Facilitate transactions:</strong> To enable listing creation, offers, and deal management</li>
              <li><strong>Communication:</strong> To send notifications about offers, messages, and important updates</li>
              <li><strong>Improve our service:</strong> To analyze usage patterns and enhance user experience</li>
              <li><strong>Customer support:</strong> To respond to your requests and provide assistance</li>
              <li><strong>Security:</strong> To detect, prevent, and address fraud and security issues</li>
              <li><strong>Legal compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">4. Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use Supabase (PostgreSQL) for secure data storage with industry-standard encryption. Your data is
              protected with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Row Level Security (RLS) policies to restrict unauthorized access</li>
              <li>Encrypted data transmission using HTTPS/TLS</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Local data is stored securely on your device using MMKV encrypted storage for improved performance
              and offline access.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>With other users:</strong> Your profile information and listings are visible to other users within the marketplace</li>
              <li><strong>Service providers:</strong> With trusted third-party service providers who assist in operating our services (e.g., Supabase for backend services, Expo for push notifications)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights and users' safety</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">6. Your Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Data portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Location services:</strong> Disable location tracking in your device settings</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              To exercise these rights, please contact us at iglost999@gmail.com or through the app settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in
              this Privacy Policy, unless a longer retention period is required by law. When you delete your account,
              we will delete your personal information within 30 days, except for data we are required to retain for
              legal or regulatory purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">8. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Agrideck is not intended for use by children under the age of 13. We do not knowingly collect personal
              information from children under 13. If we become aware that we have collected personal information from
              a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">9. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and maintained on servers located outside of your country where
              data protection laws may differ. By using Agrideck, you consent to the transfer of your information to
              these locations. We take appropriate measures to ensure your data is treated securely.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">10. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Our app uses the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>Supabase:</strong> Backend and database services</li>
              <li><strong>Expo:</strong> Push notifications and development platform</li>
              <li><strong>Google Fonts:</strong> Typography services</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              These services have their own privacy policies. We encourage you to review their policies to understand
              how they handle your information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
              Policy periodically for any changes. Changes are effective when posted on this page.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>Email:</strong>{" "}
                <a href="mailto:iglost999@gmail.com" className="text-primary-600 hover:underline">
                  iglost999@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">13. Open Source Disclosure</h2>
            <p className="text-gray-600 leading-relaxed">
              Agrideck is an open-source project. While the source code is publicly available on GitHub, this does not
              affect the privacy of your personal data, which is stored securely and separately from the public codebase.
              The open-source nature applies to the application code only, not to user data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
