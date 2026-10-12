# Incubyte assessment submission checklist

- [ ] Requirements document reviewed before building: `docs/requirements.md`.
- [ ] Architecture and trade-offs reviewed: `docs/architecture.md`, `docs/decisions.md`.
- [ ] Run backend tests: `cd backend && mvn test`.
- [ ] Install and test frontend: `cd frontend && npm ci && npm test -- --watch=false && npm run build`.
- [ ] Apply Supabase migration and seed exactly 10,000 synthetic records.
- [ ] Configure email/password auth, confirmation, redirect URLs, and asymmetric JWT signing.
- [ ] Deploy API and UI with secrets only in provider settings.
- [ ] Complete the smoke test in `docs/deployment.md`.
- [ ] Record a short walkthrough following `docs/demo-checklist.md`.
- [ ] Review commit history, repository visibility, README, and the final diff.
- [ ] Reply to Incubyte's email with the GitHub repository URL and demo link.
