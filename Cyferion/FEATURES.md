# Cyferion – Feature Planning & Specifications

Cyferion (formerly ScamGuard) is a family-based SMS scam protection system engineered to passively safeguard vulnerable users—such as elderly family members and children—by empowering a primary Guardian with unified decision-making and real-time monitoring controls.

---

## 💡 Initial Ideas (Brainstorming Phase)
* **Core System:** Scam Detection Engine, Active Protection Logic, Role-Based Protection.
* **Family System:** Family Dashboard (Family Mode + Trusted Contacts whitelisting), Quarantine System.
* **Social Layer:** Regional Language Support, Scam Awareness Portal.

---

## 📋 Finalized v1 MVP Core Features

### 1. Core Security & Analysis
* **Node.js-Based Detection Heuristics:** A high-speed scanning engine analyzing incoming text messages for standard Indian scam vectors (KYC blocks, fake helpline claims, urgencies).
* **Logical Quarantine System:** Automatically isolates high-risk texts from the Protected User's device and stores them in the database until review.
* **Role-Based Server Protection:** Secure permissions enforced by Supabase Row-Level Security (RLS) separating the active Guardian admin from the passively protected family members.

### 2. Guardian Control Portal (React + Tailwind CSS + Shadcn UI)
* **Onboarding Landing Page:** Premium dark-mode introduction screen featuring a simulated multi-tab Auth Modal (Google OAuth, Email/Password, Mobile OTP).
* **Active Guardian Dashboard:** Displays real-time status rings for family members, high-level threat metrics, and a scrollable recent protection activity feed.
* **Family Network Directory:** Layout listing all active relatives, slider dials to set protection strictness, and a whitelist management interface for **Trusted Contacts** (e.g. bank shortcodes).
* **Threat Monitor Audit Log:** A complete filterable central inbox displaying sender numbers, text body, risk ratings, and target recipients.
* **Quarantine Review Center:** Interface letting the Guardian view the detailed detection markers of quarantined messages and process actions (**Mark as Safe** or **Delete**).
* **Static Awareness Hub:** A clean card layout detailing common Indian SMS scam scenarios to educate the family.

---

## 🚀 High-Value Enhancements (Included in v1 Build)

### 3. Advanced Simulator Interface
* **SMS Ingestion & AI Scoring Simulator (`/Simulator` page):**
  * An interactive sandbox tool letting the Guardian or developer input any custom text, select a relative, and trigger a live heuristic scan.
  * Outputs a step-by-step scoring trace assessing:
    * **Urgency Keywords** (e.g., *immediately, suspended, block*).
    * **Suspicious Link Flags** (detecting shortened or non-HTTPS URLs).
    * **Impersonation Risk** (checking spoofed names against the whitelist).
  * Verdict badge: 🟢 **Safe** / 🟡 **Quarantine** / 🔴 **Blocked**.


### 4. Live Communications & Ingestion Integrations
* **Real-Time WebSocket Alerts:** Uses Supabase Realtime to broadcast quarantine alerts directly to the active Guardian dashboard, popping up toast notifications within 2 seconds.
* **Automated Twilio SMS Gateway:** Built-in hooks ready to dispatch out-of-app backup text alerts to the Guardian's actual phone number.
* **Android Background Ingestion Gateway:** Integration specs utilizing a mobile background listener or a webhook forwarding service to route incoming SMS payloads from the SIM card straight to our Express API.

---

## 🛑 Out of Scope for v1 (Planned for v2+)
* **Multilingual support:** Core NLP analysis in regional Indian languages.
* **Bank/UPI app blocking:** Deep local integration to block payment transactions during active calls or alerts.
* **Call & WhatsApp scam detection:** Expanding listeners to cover incoming voice calls and chat platforms.