# Wireframe-Ready Checklist – Cyferion v1

This document translates finalized user flows into concrete screens and system states
required for implementation.

---

## Guardian Screens

### G1. Guardian Login / Onboarding
**Purpose**
Authenticate guardian and establish primary user.

**Must Include**
- App name
- Login / Register
- Short description

**Actions**
- Login
- Retry on failure

**Backend**
- Supabase Auth

---

### G2. Empty Dashboard (First-Time User)
**Purpose**
Guide guardian to add protected users.

**Must Include**
- Empty state message
- CTA: Add Family Member

**Actions**
- Add Protected User

**Backend**
- Guardian profile exists
- No linked protected users

---

### G3. Add Protected User
**Purpose**
Link a vulnerable user to guardian.

**Must Include**
- Name
- Relation
- Phone number

**Actions**
- Save
- Cancel

**Rules**
- One protected user → one guardian (v1)

**Backend**
- Supabase DB insert

---

### G4. Guardian Dashboard (Monitoring)
**Purpose**
Show protection is active.

**Must Include**
- Protected users list
- Protection status

**Actions**
- View alerts
- Add protected user

**Backend**
- Fetch protected users
- Alert count

---

### G5. Scam Alert Detail
**Purpose**
Allow guardian to take action.

**Must Include**
- Message snippet
- Risk level
- Reason

**Actions**
- Confirm Scam
- Mark Safe
- Ignore Once

**Backend**
- Alert record
- Decision API

---

### G6. History & Awareness
**Purpose**
Build trust and user learning.

**Must Include**
- Past scam attempts
- Awareness content

**Actions**
- Read only

**Backend**
- Fetch logs
- Static content

---

## Protected User Screens

### P1. Normal Usage
- No Cyferion UI visible

---

### P2. Scam Warning Overlay
**Purpose**
Warn without panic.

**Must Include**
- Simple warning message
- Large readable text

**Actions**
- Call Guardian
- Dismiss

**Backend**
- Alert trigger
- Guardian contact info

---

## System States (Non-UI)

### S1. SMS Ingestion
- Receive SMS
- Store raw message

### S2. Detection Pipeline
- Preprocess text
- Run rule checks
- Generate score

### S3. Decision Engine
- Compare risk threshold
- Decide action

### S4. Notification Trigger
- Notify guardian
- Warn protected user

### S5. Logging & Audit
- Store message
- Store system decision
- Store guardian action