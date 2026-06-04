import React, { useState } from 'react';
import { Shield, BookOpen, AlertOctagon, HelpCircle, PhoneCall, Landmark, FileText, ChevronDown, ChevronUp, Phone, CreditCard, Package, Briefcase, Banknote } from 'lucide-react';

export default function Awareness() {
  const [expanded, setExpanded] = useState(null);

  const scamCategories = [
    {
      title: "Banking & KYC Scams",
      icon: Landmark,
      iconBg: "bg-red-500",
      desc: "Fake messages claiming your bank account will be blocked unless you verify KYC details.",
      details: [
        "Scammers impersonate banks like SBI, HDFC, ICICI via SMS with sender IDs like 'CP-SBIINF'.",
        "Messages contain urgency: 'Your account will be blocked TODAY' or 'Complete e-KYC immediately'.",
        "Links redirect to fake banking portals designed to steal your credentials and OTPs.",
        "Banks never send KYC reminders via SMS with clickable links. Visit the branch directly.",
      ],
    },
    {
      title: "OTP & Credit Card Fraud",
      icon: CreditCard,
      iconBg: "bg-blue-500",
      desc: "Messages tricking you into sharing OTPs or credit card details for fake transactions.",
      details: [
        "You receive: 'Your credit card has been charged ₹49,999. If not you, call 1800-XXX-XXXX immediately.'",
        "The helpline number connects to scammers who ask for your card number and CVV to 'reverse the charge'.",
        "Legitimate banks will never ask for your full card number, CVV, or OTP over phone or SMS.",
        "If you suspect fraud, call only the number printed on the back of your physical card.",
      ],
    },
    {
      title: "Delivery & Courier Scams",
      icon: Package,
      iconBg: "bg-orange-500",
      desc: "Fake delivery failure messages that trick you into clicking malicious links or sharing OTPs.",
      details: [
        "Messages claim: 'Your package couldn't be delivered due to incorrect address. Pay ₹25 to update.'",
        "Micro-payments are used to steal your complete payment card information.",
        "IndiaPost, FedEx, and DHL never request payments via SMS links.",
        "Always verify delivery status on the official app of the retailer where you placed the order.",
      ],
    },
    {
      title: "UPI & Payment Scams",
      icon: Banknote,
      iconBg: "bg-green-500",
      desc: "Scammers send fake payment requests or QR codes that actually withdraw money...",
      details: [
        "You receive: 'Congratulations! ₹1,999 cashback credited. Click to claim to your bank account.'",
        "The link opens a UPI app and prompts you to enter your UPI PIN to 'receive' the money.",
        "Golden rule: You NEVER need to enter your UPI PIN to RECEIVE money. PIN = money going OUT.",
        "Report fake UPI requests on your payment app and block the sender immediately.",
      ],
    },
    {
      title: "Job & Investment Scams",
      icon: Briefcase,
      iconBg: "bg-purple-500",
      desc: "Fake work-from-home jobs or investment schemes promising unrealistic returns.",
      details: [
        "Messages offer: 'Earn ₹5,000-50,000 daily by working from home. WhatsApp us to start.'",
        "Investment scams promise 200-500% returns in days through 'crypto trading' or 'stock tips'.",
        "Legitimate jobs never require upfront fees. Legitimate investments don't guarantee returns.",
        "Verify job listings on official company career pages. Check investment firms on SEBI's website.",
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Awareness Center</h1>
        <p className="text-sm text-slate-400 mt-0.5">Learn about common SMS scam patterns in India</p>
      </div>

      {/* Scam Types Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold font-display text-slate-800">Common Scam Types</h2>
        
        {scamCategories.map((cat, i) => {
          const Icon = cat.icon;
          const isExpanded = expanded === i;
          return (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">{cat.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                  <ul className="space-y-2 mt-4">
                    {cat.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Emergency CTA Section — matching reference "Been Scammed?" */}
      <div className="rounded-2xl bg-slate-800 p-6 text-white">
        <h3 className="text-lg font-bold font-display mb-5">Been Scammed? Here's What To Do</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-sm font-semibold">Call Cyber Crime</h4>
            <p className="text-xs text-slate-300">Helpline: 1930</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-sm font-semibold">Contact Your Bank</h4>
            <p className="text-xs text-slate-300">Block cards immediately</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-sm font-semibold">File FIR Online</h4>
            <p className="text-xs text-slate-300">cybercrime.gov.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
