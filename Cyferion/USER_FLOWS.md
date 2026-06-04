# User Flows – Cyferion v1

## Guardian User Flow

### 1. Onboarding
- Guardian registers/logs in
- Guardian lands on empty dashboard

### 2. Add Protected User
- Guardian adds family member
- System links protected user to guardian

### 3. Monitoring State
- No alerts
- Dashboard shows protected users

### 4. Scam Alert
- System flags suspicious message
- Guardian receives detailed alert

### 5. Decision
- Confirm scam → warn protected user
- Mark safe → release message
- Ignore once → no action

### 6. Review & Awareness
- Guardian reviews history
- Guardian accesses awareness content

### Notes
- Guardian is the primary decision-maker
- All actions are logged


## Protected User Flow

### 1. Normal Usage
- Receives SMS normally

### 2. Scam Warning
- Sees simple warning message

### 3. Contact Guardian (Optional)
- Can call guardian
- No other actions

### 4. Resume Normal Usage
- Guardian handles decisions


## System Flow (Automated)

### 1. SMS Received
- SMS arrives on protected user device
- Content forwarded to backend

### 2. Preprocessing
- Text normalization
- Feature extraction

### 3. Scam Detection
- Rule-based checks
- Suspicion scoring

### 4. Risk Evaluation
- Threshold comparison
- Decision making

### 5. Quarantine & Alert
- Logical quarantine
- Alert guardian
- Warn protected user

### 6. Logging & Audit
- Store message
- Store system decision
- Store guardian action