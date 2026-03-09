# ScamGuard v1 – API Specification

## Guardian APIs
- GET /guardian/protected-users
- GET /guardian/alerts
- GET /guardian/messages/{id}
- POST /guardian/messages/{id}/decision

## System APIs
- POST /system/ingest-sms
- POST /system/analyze-message

## Notes
- Frontend is read-only for sensitive data
- All detection logic lives in Python backend
- Supabase enforces auth & ownership
