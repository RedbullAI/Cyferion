# ScamGuard v1 – Data Model

## Tables
- guardians
- protected_users
- messages
- scam_analysis
- alerts

## Key Relationships
- Guardian → Protected Users (1:N)
- Protected User → Messages (1:N)
- Message → Scam Analysis (1:1)
- Guardian → Alerts (1:N)

## Notes
- Guardians are authenticated users.
- Protected users do not log in.
- All sensitive access enforced via RLS.