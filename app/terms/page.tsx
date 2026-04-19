export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Last updated: April 2026 · Eventogether
          </p>

          <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Eventogether ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App. These terms apply to all users, including those who browse without an account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">2. Description of Service</h2>
              <p>
                Eventogether is a community platform for discovering, creating, and sharing local events in Monterey County. The App also provides a carpool coordination feature that allows users to offer and request rides to events. Eventogether is a platform only — we do not organize, endorse, or take responsibility for any events or carpools listed.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">3. User Accounts</h2>
              <p>
                You must sign in with a valid Google account to create events, offer carpools, or leave ratings. You are responsible for all activity that occurs under your account. You agree to provide accurate information and to keep your account secure. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">4. User Conduct</h2>
              <p className="mb-2">When using Eventogether, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post false, misleading, or fraudulent event listings</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Misuse the carpool feature to collect personal information from others</li>
                <li>Attempt to disrupt or damage the App or its servers</li>
                <li>Impersonate another person or organization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">5. Carpool Disclaimer</h2>
              <p>
                Eventogether provides a carpool coordination tool as a convenience feature only. We are not a transportation provider and do not verify the identity, driving record, or insurance of any driver. Users who offer or accept carpools do so entirely at their own risk. We strongly encourage users to exercise caution and good judgment when arranging rides with others.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">6. Ratings</h2>
              <p>
                Users may rate carpool drivers they have ridden with on a 1–10 scale. Ratings must be honest and based on genuine experience. Submitting false or retaliatory ratings is a violation of these terms and may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">7. Content Ownership</h2>
              <p>
                You retain ownership of any content you submit to Eventogether, including event listings, descriptions, and images. By submitting content, you grant Eventogether a non-exclusive license to display that content within the App. You are responsible for ensuring you have the right to share any content you post.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">8. Limitation of Liability</h2>
              <p>
                Eventogether is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the App, including but not limited to incidents arising from events or carpools coordinated through the platform. Our total liability to you for any claim shall not exceed the amount you paid to use the App, if any.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">9. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. When we do, we will update the date at the top of this page. Continued use of the App after changes are posted constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-gray-900 mb-2">10. Contact</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through the App or reach out to the Eventogether team directly.
              </p>
            </section>

          </div>

          {/* Accept button */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
            <a
              href="/auth"
              className="px-6 py-2.5 bg-[#6384ff] text-white text-sm font-medium rounded-xl hover:bg-[#4d6ef0] active:scale-[0.98] transition-all"
            >
              I understand — back to sign in
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
