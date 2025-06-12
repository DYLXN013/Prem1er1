import React from 'react';
import { FileText, Shield, Eye, AlertTriangle } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: January 1, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using StreamFootball, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Use License
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              <p>
                Permission is granted to temporarily download one copy of the materials on StreamFootball for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Subscription Terms
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              <p>
                StreamFootball offers various subscription plans with different features and pricing. By subscribing to our service, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pay all applicable fees and charges</li>
                <li>Provide accurate billing information</li>
                <li>Notify us of any changes to your payment information</li>
                <li>Use the service only for personal, non-commercial purposes</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. User Accounts
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Content and Conduct
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              <p>
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting content to the service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-yellow-600" />
              6. Prohibited Uses
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              <p>You may not use our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms whether express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Limitations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              In no event shall StreamFootball or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on StreamFootball's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              StreamFootball may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Contact Information
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p><strong>Email:</strong> legal@streamfootball.com</p>
                <p><strong>Address:</strong> 123 Sports Avenue, Football City, FC 12345</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </div>
          </section>
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};