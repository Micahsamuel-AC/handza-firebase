import Navbar from "@/components/Navbar";

const sections=[
  ["1. Information We Collect","We collect your full name, email, phone number, location (GPS when you toggle availability), National Identity Card (NIC) image, skills, hourly rate, and any content you submit (messages, reviews, photos)."],
  ["2. Legal Basis","We process your personal data under the Personal Data Protection Act No. 9 of 2022 (PDPA) of Sri Lanka, on the basis of your consent and the necessity to perform our services to you."],
  ["3. How We Use Your Data","Your data is used to: verify your identity, match you with relevant jobs or workers, calculate payments, enable messaging between matched users, and improve platform safety and performance."],
  ["4. NIC Documents","NIC images are stored securely in encrypted cloud storage and are only accessible to HANDZA administrators for verification purposes. NIC images are never shared with other users."],
  ["5. GPS Location Data","Location data is only collected when you actively toggle 'Available Now'. Your exact GPS coordinates are never shown to employers — only your approximate distance. You can disable location sharing at any time."],
  ["6. Data Sharing","We do not sell your personal data. Limited profile information (name, skills, rating, reviews, portfolio) is visible to other users as part of the marketplace function. Phone and email remain hidden until a hiring relationship is established."],
  ["7. Data Retention","We retain your data for as long as your account is active. You may request deletion of your account and associated data by contacting privacy@handza.lk."],
  ["8. Your Rights","Under the PDPA, you have the right to access, correct, or delete your personal data, and to withdraw consent for location tracking at any time."],
  ["9. Security","We implement industry-standard security measures including encrypted storage and access controls, in compliance with the Computer Crimes Act No. 24 of 2007."],
  ["10. Contact","For privacy concerns, contact us at privacy@handza.lk."],
];

export default function PrivacyPage(){
  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: June 2026 · Compliant with PDPA No. 9 of 2022</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {sections.map(([title,text])=>(
          <div key={title}><h2 className="font-heading font-bold text-navy text-base mb-2">{title}</h2><p className="text-gray-600 text-sm leading-relaxed">{text}</p></div>
        ))}
      </div>
    </div></div>
  );
}
