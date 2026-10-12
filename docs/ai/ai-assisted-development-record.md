# AI-Assisted Development Record

## Intent and boundaries

The assessment explicitly expects AI tools to accelerate work. The useful signal is not the number of generated lines; it is how AI was directed, constrained, checked, and incorporated into an understandable engineering process.

AI was used as a collaborator for requirements drafting, implementation planning, code-review prompts, validation/test ideas, documentation, deployment troubleshooting, and translating runtime evidence into a focused next action. Human review remains responsible for accepting changes, checking the actual repository, executing tests, verifying hosted behavior, handling secrets, and making final trade-offs.

## Workflow used

1. **Frame first:** translate a short problem statement into persona, goal, success signals, assumptions, non-goals, and explicit currency semantics before feature expansion.
2. **Small changes:** separate database schema/seed, backend API/auth, UI flows, tests, and deployment/docs into cohesive commits.
3. **Specify behavior:** ask for endpoint contracts, validation rules, error semantics, concurrency behavior, and acceptance tests rather than only asking for “build an app.”
4. **Review assumptions:** inspect SQL schema, controller mappings, DTO constraints, security config, tests, environment generation, Dockerfile, deployment YAML, and logs.
5. **Run/observe:** execute tests and build commands when possible; use database count queries and browser/host logs for real evidence. Where a command was not run, explicitly label the gap.
6. **Protect sensitive data:** use synthetic demo data and placeholders; never send raw passwords or access tokens to an AI tool. If a secret is exposed, rotate it rather than relying on secrecy of the transcript.
7. **Document decisions:** record why a simple approach was chosen and what condition would justify revisiting it.

## Representative prompts / task instructions

The following are representative task prompts, phrased as reusable examples rather than a claim that every prompt was issued verbatim:

- “Draft a one-page requirements document for an HR manager maintaining compensation for 10,000 employees across countries. Include scope, non-goals, assumptions, and measurable acceptance criteria.”
- “Propose a small relational schema for employee records and salary audit history. Use a decimal money type plus ISO currency, unique business identifiers, and migration SQL.”
- “Implement server-side search/filter/pagination with a maximum page size and an allowlist for sort fields. Reject unsupported user inputs with predictable errors.”
- “Design a salary update request that includes expected version and a reason. Make the database update and audit insert atomic, and define the stale-write response.”
- “Configure Supabase email/password Auth in Angular and verify the token in Spring with issuer, audience, timestamp, and JWKS signature validation. Do not put private keys in browser code.”
- “Review the currency aggregation design for misleading cross-currency totals and state the non-goal explicitly.”
- “Create deterministic tests around pagination bounds, validation, and API request parameter construction. Identify the most valuable integration tests still missing.”
- “Investigate this specific build/runtime error using the relevant source configuration and logs; propose the smallest reversible fix, not a broad rewrite.”
- “Create a deployment runbook that separates browser-public settings from server secrets and specifies the exact health check and smoke test.”

## How AI output was evaluated

- **Correctness:** compare proposed behavior with actual Java/Angular/SQL source and framework APIs.
- **Security:** reject any approach that moves database/service-role credentials into the client, disables authorization as a shortcut, or relies on a frontend route guard alone.
- **Reproducibility:** prefer SQL migrations, idempotent seed scripts, version-controlled config templates, and deterministic tests.
- **Simplicity:** reject extra infrastructure without a demonstrated requirement.
- **Evidence:** logs, SQL query results, and CI results outrank a confident generated explanation.
- **Honesty:** distinguish implemented code, test coverage, executed tests, and hosted verification; do not claim success based only on a proposed command.

## Human verification gates

- Inspect AI-proposed diffs before commit.
- Run `mvn test`, Angular tests, and production build in a clean environment.
- Verify JWT behavior with a real non-secret staging session.
- Independently query employee row counts and salary aggregates.
- Confirm `/api` route paths and production base URL with browser Network tools.
- Review Git status/history for secrets and accidental generated files.
- Record unresolved gaps rather than hiding them in demo narration.

## Reflection

AI is especially effective for decomposing a broad assessment into artifacts, drafting test cases, and narrowing errors from logs. It is less reliable when it guesses deployment settings without the live configuration, assumes a `.env` loader exists without reading `application.yml`, or declares test status without command output. In this project, the practical lesson is to ground every troubleshooting step in the current files and exact runtime evidence, then verify the fix at the boundary where the failure occurred.
