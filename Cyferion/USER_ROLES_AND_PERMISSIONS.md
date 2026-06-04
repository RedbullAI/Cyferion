# User Roles & Permissions – Cyferion

## Overview
Cyferion follows a family-based protection model where a primary user (Guardian) manages scam protection for vulnerable users.

## Roles

### Guardian (Primary User)
Educated parent or administrator responsible for configuring scam protection.

Responsibilities:
- Register and authenticate
- Add and manage protected users
- View scam alerts and message details
- Take action on detected scams

### Protected User (Passive User)
Elderly person or child whose messages are monitored.

Responsibilities:
- Receive normal SMS
- Receive simple scam alerts
- Optionally contact guardian

### Cyferion System
Automated system responsible for detection and alerting.

Responsibilities:
- Analyze incoming messages
- Assign risk scores
- Trigger alerts
- Log events

## Permissions Matrix


| Action             | Guardian               | Protected User   | System  |
| ------------------ | ---------------------  | --------------   | ------  |
| Register / Login   | ✅                     | ❌              | ❌      |
| Add protected user | ✅                     | ❌              | ❌      |
| View SMS content   | ✅ (linked users only) | ⚠️ limited      | ❌      |
| Receive alerts     | ✅ detailed            | ✅ simple       | ❌      |
| Decide action      | ✅                     | ❌              | ❌      |
| Trigger detection  | ❌                     | ❌              | ✅      |
| Write scam logs    | ❌                     | ❌              | ✅      |

## Design Notes
- Protected users do not manage settings.
- Guardians only access data of linked users.
- All permissions are enforced server-side.



