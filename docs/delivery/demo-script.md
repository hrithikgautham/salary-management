# Assessor Demo Script (4–6 Minutes)

**Goal:** Tell one coherent story: the HR Manager can find a person, make a controlled compensation change, and answer a question about compensation distribution. Do not spend time describing every component before demonstrating the workflow.

## Before recording (not part of recording)

- Use a dedicated synthetic-data account, not a personal account with privileged access you do not need.
- Verify that the site is live, login works, dashboard is 200, and an edit/audit flow has been tested.
- Clear browser tabs and DevTools. Do not show environment variables, request `Authorization` headers, tokens, password fields after entry, or Render secret settings.
- Prefer a 1920×1080 or 1600×900 browser viewport with readable zoom. Ensure names/currency labels can be read.
- Keep synthetic data only; don't use real employee information.

## Script and timing

### 0:00–0:25 — Problem and scope

“ACME manages 10,000 employees across countries. The first version replaces spreadsheet lookups with a secure directory, validated salary changes with history, and currency-aware compensation summaries. Payroll execution and FX conversion are deliberately out of scope.”

### 0:25–0:55 — Login and security boundary

Show the login page and sign into the demo HR account. Explain that Supabase Auth owns password handling and Spring validates access tokens and a configured HR allowlist. Never expose the token itself.

### 0:55–1:35 — Dashboard

Point to total, active, on-leave and terminated counts. Point to country/currency and department summaries. Explicitly call out that totals are grouped by currency and are not combined into a misleading world-wide number.

### 1:35–2:25 — Find an employee

Search by employee number or name, apply a country and department filter, sort a visible column, move between pages. Explain that the API queries PostgreSQL and returns a bounded page rather than shipping all 10,000 rows to the browser.

### 2:25–3:25 — Controlled salary change

Open an employee. Change the salary or currency in the synthetic dataset, provide a realistic reason, save, and refresh. Verify the new value persisted. Open audit history and show the previous/new amount and currency, timestamp, actor, and reason.

### 3:25–4:05 — Validation/concurrency (optional but strong)

Show a rejected negative/overprecision value or stale version conflict if the staging app is set up for it. Explain why stale edits return conflict rather than silently overwriting another update. Avoid deliberately breaking production data; use a test record.

### 4:05–4:45 — Insights

Show salary-by-country and salary-by-department grouping. Mention that FX conversion was omitted intentionally because no reporting currency/provider/effective date was specified.

### 4:45–5:15 — Engineering artifacts

Show the requirements document, architecture diagram, decision records, test matrix, and commit history. Highlight trade-offs, not raw implementation volume.

### 5:15–5:30 — Close

Summarize what works and, if relevant, honestly state limitations or follow-up opportunities. Don't claim any workflow you have not demonstrated/tested.

## Suggested Q&A preparation

- Why one Spring API instead of microservices? Small domain and dataset; centralizes consistency and auth.
- Why keep currency in every aggregate? Prevents invalid cross-currency addition.
- How does the salary history remain consistent? One DB transaction and optimistic version check; tests should prove rollback/stale behavior.
- Why does UI sign-in not grant access automatically? API validates token and checks HR allowlist; route guard is not a security boundary.
- What would you do next? Integration/security tests, role/tenant model, measured query optimization, audit retention and stronger operations.
