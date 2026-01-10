import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - Agrideck",
  description: "Terms and Conditions for Agrideck - Agricultural Marketplace",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-primary-100 text-lg">Last updated: January 10, 2026</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to Agrideck. These Terms and Conditions ("Terms") govern your access to and use of the Agrideck
              mobile application and services (collectively, the "Service"). By accessing or using our Service, you
              agree to be bound by these Terms.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify
              these Terms at any time, and such modifications will be effective upon posting.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>"Agrideck," "we," "us," or "our"</strong> refers to the Agrideck application and its operators</li>
              <li><strong>"User," "you," or "your"</strong> refers to any individual or entity using the Service</li>
              <li><strong>"Farmer"</strong> refers to users who list agricultural produce for sale</li>
              <li><strong>"Buyer"</strong> refers to users who browse and purchase agricultural produce</li>
              <li><strong>"Listing"</strong> refers to agricultural products posted for sale on the platform</li>
              <li><strong>"Deal"</strong> refers to a completed transaction between a farmer and buyer</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">3. Eligibility</h2>
            <p className="text-gray-600 leading-relaxed mb-4">To use Agrideck, you must:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Provide accurate and complete registration information</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Not have been previously banned from the platform</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">4. User Accounts</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">4.1 Account Registration</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You must create an account to use certain features of the Service. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">4.2 Account Types</h3>
            <p className="text-gray-600 leading-relaxed mb-4">You may register as either a Farmer or Buyer:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li><strong>Farmers:</strong> Can create listings, receive offers, and sell agricultural produce</li>
              <li><strong>Buyers:</strong> Can browse listings, make offers, and purchase agricultural produce</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">4.3 Account Termination</h3>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms,
              fraudulent activity, or any other reason we deem appropriate.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">5. Platform Usage</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">5.1 For Farmers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">As a farmer, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Provide accurate descriptions and photos of your produce</li>
              <li>Set fair and honest pricing</li>
              <li>Honor accepted offers and completed deals</li>
              <li>Deliver products as described in your listings</li>
              <li>Respond to buyer inquiries in a timely manner</li>
              <li>Comply with all applicable agricultural and food safety regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">5.2 For Buyers</h3>
            <p className="text-gray-600 leading-relaxed mb-4">As a buyer, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Make genuine offers and honor accepted deals</li>
              <li>Communicate professionally with farmers</li>
              <li>Complete payment as agreed upon</li>
              <li>Pick up or arrange delivery as coordinated with the farmer</li>
              <li>Provide feedback on completed transactions</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">6. Prohibited Activities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Engage in price manipulation or unfair trading practices</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the Service for any illegal purposes</li>
              <li>Attempt to circumvent security measures</li>
              <li>Scrape, copy, or download data without permission</li>
              <li>Impersonate other users or entities</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Spam or send unsolicited communications</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">7. Transactions and Payment</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">7.1 Platform Role</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Agrideck is a marketplace platform that facilitates connections between farmers and buyers. We are not
              a party to any transaction and do not handle payments directly. All transactions occur between users.
            </p>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">7.2 Payment Terms</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Payment terms, methods, and delivery arrangements are to be agreed upon between farmers and buyers.
              Agrideck is not responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Processing payments between users</li>
              <li>Disputes over payment or product quality</li>
              <li>Failed or incomplete transactions</li>
              <li>Delivery or shipping issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">7.3 Fees</h3>
            <p className="text-gray-600 leading-relaxed">
              Currently, Agrideck does not charge fees for using the platform. We reserve the right to introduce fees
              in the future with reasonable notice to users.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">8. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">8.1 Our Intellectual Property</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Service, including its design, features, and content (excluding user-generated content), is owned
              by Agrideck and protected by intellectual property laws. The open-source code is licensed under the
              MIT License.
            </p>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">8.2 User Content</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You retain ownership of content you post on Agrideck (listings, photos, descriptions). By posting content,
              you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content
              on the platform.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">9. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">9.1 Service Disclaimer</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">9.2 User Responsibility</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You acknowledge that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Agrideck does not verify the accuracy of user listings or information</li>
              <li>We are not responsible for the quality, safety, or legality of listed products</li>
              <li>Users are solely responsible for their transactions and interactions</li>
              <li>We do not guarantee the reliability or conduct of any user</li>
            </ul>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">9.3 Limitation of Liability</h3>
            <p className="text-gray-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGRIDECK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
              DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">10. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Agrideck, its officers, directors, employees, and
              agents from any claims, liabilities, damages, losses, and expenses arising out of or related to your
              use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">11. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">11.1 User Disputes</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Disputes between users should be resolved directly between the parties involved. While we may provide
              limited support in facilitating communication, we are not obligated to intervene in user disputes.
            </p>

            <h3 className="text-xl font-semibold text-primary-700 mb-3 mt-6">11.2 Governing Law</h3>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where
              Agrideck operates, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">12. Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to
              understand how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">13. Modifications to Service and Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Modify, suspend, or discontinue the Service at any time</li>
              <li>Update these Terms with reasonable notice</li>
              <li>Add or remove features from the Service</li>
              <li>Change eligibility requirements or user policies</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">14. Open Source</h2>
            <p className="text-gray-600 leading-relaxed">
              Agrideck is an open-source project licensed under the MIT License. The source code is available on GitHub.
              While you may use and modify the code according to the license terms, these Terms and Conditions apply to
              the use of the official Agrideck service and application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">15. Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <li>Using the account deletion feature in the app</li>
              <li>Contacting our support team</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. Provisions that by their nature
              should survive termination will remain in effect.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">16. Severability</h2>
            <p className="text-gray-600 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited
              or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force
              and effect.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">17. Entire Agreement</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Agrideck
              regarding the use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">18. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at:
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary-200">19. Acknowledgment</h2>
            <p className="text-gray-600 leading-relaxed">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND AGREE TO BE BOUND BY THEM.
              IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
