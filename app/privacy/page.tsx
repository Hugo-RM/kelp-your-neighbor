export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f4f0] px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <a
          href="/auth"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to sign in
        </a>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Legal</p>
          <h1 className="text-3xl font-serif font-normal text-gray-900 tracking-tight mb-1">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Last updated: April 2026 · Eventogether
          </p>

          <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">1. Who We Are</h2>
              <p>
                Eventogether is a community event discovery platform serving Monterey County. This Privacy Policy explains how we collect, use, and protect your personal information when you use our App.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">2. Information We Collect</h2>
              <p className="mb-2">We collect the following information when you use Eventogether:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-gray-700">From Google Sign-In:</strong> Your name, email address, and profile photo as provided by your Google account</li>
                <li><strong className="text-gray-700">Profile information:</strong> Any bio or additional details you choose to add to your profile</li>
                <li><strong className="text-gray-700">Event data:</strong> Events you create, register for, or interact with</li>
                <li><strong className="text-gray-700">Carpool data:</strong> Carpool offers you create or rides you request, including pickup location and departure time</li>
                <li><strong className="text-gray-700">Ratings:</strong> Scores you submit for carpool drivers</li>
                <li><strong className="text-gray-700">Usage data:</strong> Basic information about how you use the App, such as pages visited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">3. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and manage your account</li>
                <li>Display your profile to other users of the App</li>
                <li>Show event listings and carpool offers relevant to you</li>
                <li>Calculate and display driver ratings</li>
                <li>Send important account-related notifications</li>
                <li>Improve the App and fix issues</li>
              </ul>
              <p className="mt-2">
                We do not sell your personal information to third parties. We do not use your data for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">4. Information Visible to Other Users</h2>
              <p className="mb-2">Some of your information is visible to other users of Eventogether:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your name and profile photo (from Google)</li>
                <li>Your bio, if you choose to add one</li>
                <li>Events you have created</li>
                <li>Your driver rating and rating count, if you offer carpools</li>
                <li>Your carpooler status</li>
              </ul>
              <p className="mt-2">
                Your email address is never shown to other users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">5. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Supabase, a trusted database provider with industry-standard encryption and security practices. We use Google OAuth for authentication, meaning we never store your password. While we take reasonable steps to protect your data, no system is completely secure and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">6. Third-Party Services</h2>
              <p className="mb-2">Eventogether uses the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-gray-700">Google OAuth:</strong> For authentication. Google's privacy policy applies to information shared through sign-in.</li>
                <li><strong className="text-gray-700">Supabase:</strong> For database and storage. Your data is stored on Supabase servers.</li>
                <li><strong className="text-gray-700">Mapbox or Leaflet:</strong> For map display. Map interactions may be subject to their respective privacy policies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">7. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Update or correct your profile information at any time</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent at any time by discontinuing use of the App</li>
              </ul>
              <p className="mt-2">
                To request account deletion or access to your data, please contact us through the App.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">8. Children's Privacy</h2>
              <p>
                Eventogether is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has created an account, please contact us and we will remove the account promptly.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. We encourage you to review this policy periodically. Continued use of the App after changes are posted means you accept the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">10. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact the Eventogether team through the App.
              </p>
            </section>

          </div>

          {/* Accept button */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
            <a
              href="/auth"
              className="px-6 py-2.5 bg-[#6384ff] text-white text-sm font-medium rounded-xl hover:bg-[#4d6ef0] active:scale-[0.98] transition-all"
            >
              Got it — back to sign in
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
