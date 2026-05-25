import Link from "next/link";
import Navbar from "@/components/Navbar";

const sections = [
  {
    title: "1. Platform Overview",
    content: `HANDZA is a technology platform that facilitates connections between independent service providers ("Workers") and individuals or businesses seeking services ("Employers"). By creating an account and using HANDZA, you agree to these Terms and Conditions in full.

HANDZA is not a party to any agreement entered into between Workers and Employers, and HANDZA does not employ, supervise, direct, or control any Worker in the performance of their services.`,
  },
  {
    title: "2. Limitation of Liability",
    content: `HANDZA shall not be held liable for any injury, loss, damage, abuse, theft, misconduct, or harm of any nature — whether physical, financial, or otherwise — arising from interactions between Workers and Employers facilitated through the platform.

Users engage with each other entirely at their own risk. HANDZA provides no guarantee of the conduct, behaviour, safety, or actions of any Worker or Employer. Each user is solely responsible for their own safety and security during any service engagement.

To the maximum extent permitted by applicable Sri Lankan law, HANDZA's total liability to any user for any claim arising from use of the platform shall not exceed the amount of commission fees paid by that user in the three (3) months preceding the claim.`,
  },
  {
    title: "3. Independent Contractor Status",
    content: `All Workers using the HANDZA platform are independent contractors and not employees, agents, partners, or representatives of HANDZA. Workers are solely responsible for determining the manner and means by which they provide services to Employers.

HANDZA does not withhold taxes, provide employment benefits, mandate work hours, or control the work performance of any Worker. Nothing in these Terms shall be construed to create an employment, partnership, agency, or joint venture relationship between HANDZA and any Worker or Employer.`,
  },
  {
    title: "4. User Responsibilities",
    content: `Workers agree to:
• Provide accurate identity information including a valid National Identity Card (NIC) or passport
• Only offer services within their genuine skill level and qualifications
• Behave professionally and respectfully at all times
• Comply with all applicable Sri Lankan laws while performing services

Employers agree to:
• Provide a safe working environment at the service location
• Pay Workers the agreed rate promptly upon completion of work
• Treat Workers with dignity and respect
• Not request services that are illegal or harmful`,
  },
  {
    title: "5. Dispute Resolution",
    content: `Any dispute, claim, or controversy arising from a service engagement is strictly between the Worker and the Employer involved. HANDZA may, at its sole discretion, provide a reporting mechanism to assist users but is under no obligation to mediate, arbitrate, or resolve any dispute between users.

Users agree to hold HANDZA, its directors, employees, and agents harmless from any claims arising from their interactions with other users on the platform.

For disputes that cannot be resolved between parties, Sri Lankan law and the jurisdiction of Sri Lankan courts shall apply.`,
  },
  {
    title: "6. Platform Rules & Suspension",
    content: `HANDZA reserves the right to suspend or permanently remove any user account if:
• False identity or qualification information is provided
• Abuse, harassment, or harm is reported and substantiated
• Platform rules are repeatedly violated
• Any fraudulent activity is detected

Users may report incidents using the in-app reporting feature. All reports are logged and reviewed by HANDZA administrators.`,
  },
  {
    title: "7. Commission & Payments",
    content: `HANDZA charges a service commission of 8–12% per completed transaction. This commission is deducted automatically from the payment. Workers receive the agreed rate minus the applicable commission.

Employer subscription plans and premium Worker listing fees are charged separately as described at the time of purchase. All fees are non-refundable unless required by Sri Lankan consumer protection law.`,
  },
  {
    title: "8. Data & Privacy",
    content: `HANDZA collects and processes personal data including identity documents in accordance with Sri Lanka's Personal Data Protection Act No. 9 of 2022. By accepting these Terms, you consent to HANDZA collecting, storing, and processing your data for the purpose of operating the platform.

You have the right to access, correct, or request deletion of your personal data. See our Privacy Policy for full details.`,
  },
  {
    title: "9. Changes to Terms",
    content: `HANDZA reserves the right to update these Terms at any time. Users will be notified of material changes via email or in-app notification. Continued use of the platform after notification constitutes acceptance of the updated Terms.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms and Conditions are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any legal action arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.`,
  },
];

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: May 2026 &nbsp;·&nbsp; Effective immediately upon account creation
          </p>
        </div>

        {/* Intro banner */}
        <div className="bg-handza/10 border border-handza/20 rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-navy">Important:</strong> HANDZA is a neutral technology platform that connects Workers and Employers. HANDZA is not an employer and is not responsible for the actions, conduct, or safety of any user. By creating an account you confirm you have read and agree to these terms.
          </p>
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
            Questions about these terms?{" "}
            <a href="mailto:legal@handza.lk" className="text-handza hover:underline">
              legal@handza.lk
            </a>
          </p>
          <Link
            href="/legal/privacy"
            className="text-navy text-sm font-semibold hover:underline"
          >
            Read our Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
