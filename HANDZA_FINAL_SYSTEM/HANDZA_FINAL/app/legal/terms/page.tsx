import Navbar from "@/components/Navbar";

const clauses=[
  ["1. Platform Status","HANDZA is a neutral technology platform connecting independent workers (\"Workers\") with individuals or businesses seeking labour services (\"Employers\"). HANDZA is not an employer, staffing agency, or party to any agreement between Workers and Employers."],
  ["2. Independent Contractors","Workers using HANDZA are independent contractors. No employer-employee relationship exists between HANDZA and any Worker. HANDZA does not withhold taxes, EPF, or ETF contributions on behalf of Workers."],
  ["3. Identity Verification","All Workers and Employers must submit a valid National Identity Card (NIC) for verification, in accordance with the Personal Data Protection Act No. 9 of 2022. Verification may take up to 24 hours."],
  ["4. Commission & Fees","HANDZA charges a commission of 8-12% on each completed transaction processed through the platform. This fee is automatically deducted before payment is released to the Worker."],
  ["5. Worksite Safety","Employers are solely responsible for ensuring a safe working environment at the job site, in accordance with the Workmen's Compensation Ordinance and related Sri Lankan labour laws. HANDZA bears no responsibility for on-site incidents."],
  ["6. Dispute Resolution","Disputes arising from a job arranged through HANDZA are between the Worker and the Employer. HANDZA may, at its discretion, assist in mediating but is not obligated to resolve financial or contractual disputes."],
  ["7. Account Suspension","HANDZA reserves the right to suspend or terminate any account found to violate these Terms, engage in fraudulent activity, or receive credible abuse reports, without prior notice."],
  ["8. Prohibited Conduct","Users may not use HANDZA to solicit illegal services, discriminate based on protected characteristics, harass other users, or circumvent the platform's payment and commission system."],
  ["9. Limitation of Liability","To the maximum extent permitted by Sri Lankan law, HANDZA shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform, including but not limited to loss of income, property damage, or personal injury."],
  ["10. Governing Law","These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka, including the Electronic Transactions Act No. 19 of 2006 and the Online Safety Act No. 9 of 2024."],
];

export default function TermsPage(){
  return(
    <div className="min-h-screen bg-lgray"><Navbar/>
    <div className="section-container pt-28 pb-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">Terms & Conditions</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: June 2026 · HANDZA (Private) Limited</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {clauses.map(([title,text])=>(
          <div key={title}><h2 className="font-heading font-bold text-navy text-base mb-2">{title}</h2><p className="text-gray-600 text-sm leading-relaxed">{text}</p></div>
        ))}
      </div>
    </div></div>
  );
}
