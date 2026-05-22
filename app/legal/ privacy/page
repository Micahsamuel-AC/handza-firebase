import Link from "next/link";
import Navbar from "@/components/Navbar";

const sections = [
  {
    title: "1. Who We Are",
    content: `HANDZA (Private) Limited operates the HANDZA platform at handza-firebase.vercel.app — Sri Lanka's on-demand labour marketplace. We are the data controller for all personal information collected through the platform.

Contact: legal@handza.lk`,
  },
  {
    title: "2. What Data We Collect",
    content: `We collect the following personal information:

Identity data: Full name, email address, phone number, date of birth
Identity verification: National Identity Card (NIC) number and document image, or passport
Profile data: Skills, work history, hourly rate, profile photo, location (district/city)
Usage data: Job applications, messages sent, ratings given, login activity
Payment data: Bank account details for Worker payouts (stored securely, not visible to Employers)
Device data: IP address, browser type, device identifiers (for security purposes)`,
  },
  {
    title: "3. Why We Collect Your Data",
    content: `We process your data for the following purposes:

• To verify your identity and create your account
• To match Workers with suitable job opportunities
• To facilitate communication between Workers and Employers
• To process payments and commission fees
• To display verified Worker profiles to Employers
• To investigate abuse reports and maintain platform safety
• To send notifications about jobs, applications, and platform updates
• To comply with Sri Lankan legal obligations`,
  },
  {
    title: "4. Legal Basis (PDPA No. 9 of 2022)",
    content: `Under Sri Lanka's Personal Data Protection Act No. 9 of 2022, we process your data under the following lawful bases:

Consent: You give explicit consent at signup for identity verification and data storage
Contractual necessity: Processing needed to provide the HANDZA service you signed up for
Legal obligation: We may be required to share data with law enforcement when legally compelled
Legitimate interests: Fraud prevention, platform safety, and improving our service`,
  },
  {
    title: "5. Identity Document Storage",
    content: `Your NIC or passport image is:
• Stored in a secure, access-restricted area of our database
• Accessible only to HANDZA administrators for verification purposes
• Never shared with Employers or other Workers
• Used only for identity verification — not for any other purpose

You consent to this storage by ticking the verification checkbox during signup. You may request deletion of your identity documents at any time by contacting us, subject to legal retention requirements.`,
  },
  {
    title: "6. Who We Share Data With",
    content: `We do not sell your personal data. We share data only in these limited circumstances:

Workers ↔ Employers: Your name, skills, rating, and profile photo are visible to platform users. Your NIC, phone number, and bank details are never shown to other users.

Service providers: We use Google Firebase (database/auth), Vercel (hosting), and Google Maps. These providers process data on our behalf under data processing agreements.

Law enforcement: We will disclose information when required by a valid Sri Lankan court order or legal authority.`,
  },
  {
    title: "7. Your Rights Under PDPA",
    content: `As a Sri Lankan data subject, you have the right to:

• Access: Request a copy of the personal data we hold about you
• Correction: Ask us to correct inaccurate information
• Deletion: Request deletion of your account and associated data
• Restriction: Ask us to limit how we process your data
• Objection: Object to processing for legitimate interests purposes
• Data portability: Request your data in a machine-readable format

To exercise any right, email legal@handza.lk. We will respond within 30 days.`,
  },
  {
    title: "8. Data Retention",
    content: `We retain your data for as long as your account is active. If you delete your account:
• Profile data is deleted within 30 days
• Messages are deleted within 30 days
• Transaction records are retained for 7 years (tax/legal requirement)
• Abuse reports and incident logs are retained for 3 years

Identity documents (NIC/passport) are deleted within 14 days of account deletion unless retention is required by law.`,
  },
  {
    title: "9. Data Security",
    content: `We protect your data using industry-standard security measures including:
• HTTPS encryption for all data in transit
• Firebase Security Rules restricting database access
• Admin-only access to identity documents
• Regular review of access permissions

In the event of a data breach affecting your personal information, we will notify you promptly as required by the PDPA.`,
  },
  {
    title: "10. Cookies",
    content: `HANDZA uses essential cookies to keep you logged in and maintain your session. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect platform functionality.`,
  },
  {
    title: "11. Changes to This Policy",
    content: `We may update this Privacy Policy to reflect changes in our practices or Sri Lankan law. We will notify you of significant changes via email or in-app notification at least 14 days before they take effect.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-lgray">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Legal Document
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: May 2026 &nbsp;·&nbsp; Compliant with Sri Lanka PDPA No. 9 of 2022
          </p>
        </div>

        {/* PDPA badge */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
          <span className="text-green-600 text-xl mt-0.5">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              PDPA Compliant — Sri Lanka Personal Data Protection Act No. 9 of 2022
            </p>
            <p className="text-sm text-green-700 leading-relaxed">
              HANDZA respects your right to privacy. We collect only what is necessary, store it securely, and never sell your personal data to third parties.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading font-bold text-navy text-lg mb-3">{s.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Privacy questions?{" "}
            <a href="mailto:legal@handza.lk" className="text-handza hover:underline">
              legal@handza.lk
            </a>
          </p>
          <Link
            href="/legal/terms"
            className="text-navy text-sm font-semibold hover:underline"
          >
            Read our Terms & Conditions →
          </Link>
        </div>
      </div>
    </main>
  );
}
