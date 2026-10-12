# Product requirements: ACME Salary Management

**Persona:** HR Manager responsible for salary records for approximately 10,000 employees across multiple countries.

**Goal:** Replace spreadsheet-based salary administration with a secure, auditable web application that lets HR find an employee quickly, maintain current compensation, and answer basic questions about how compensation is distributed.

## In scope

- Authenticate HR users with email and password using Supabase Auth.
- Display employee count and aggregated salary insights.
- Search employees by name, employee number, email, country, department, and job title.
- Filter and paginate the employee directory on the server, not by downloading all 10,000 rows into the browser.
- Create employee records and edit employee and compensation details with validation.
- Record every salary change with prior salary, new salary, currency, actor, timestamp, and optional reason.
- Summarize compensation by country, department, and currency. Do not total different currencies together without an explicit exchange-rate source and effective date.
- Provide repeatable schema migration and deterministic synthetic seed data for 10,000 employees.

## Deliberately out of scope

- Payroll calculation, tax withholding, payslips, bank transfer, and integrations with payroll providers. These require jurisdiction-specific rules and validation beyond this assessment.
- Currency conversion. Summing USD, EUR, INR, and other currencies would be misleading without maintained rates and a defined reporting currency.
- Role administration, SSO, MFA enforcement, approvals, and employee self-service. The first iteration targets one HR manager persona; production access control needs a formal HR role model and operational policies.
- Bulk CSV import/export, compensation letters, attachments, and notification workflows. They add surface area before the core record workflow is proven.
- Historical headcount or salary snapshots. The audit trail records changes, but point-in-time reporting is not implemented.
- Multi-tenant organization boundaries. The demo models one ACME organization; tenant isolation is a production requirement if reused by multiple organizations.

## Acceptance criteria

1. An unauthenticated request cannot read or change employee records through the API.
2. A logged-in user can search, filter, and paginate employees without loading the whole dataset.
3. Invalid email, negative salary, missing required fields, unsupported sort fields, and stale updates are rejected with actionable HTTP responses.
4. Salary edits preserve the previous value in an append-only audit record.
5. Insights group totals by currency and never sum incompatible currencies.
6. A repeatable script creates exactly 10,000 synthetic employee records on a clean database.
7. Automated tests cover core salary validation, pagination/search behavior, and authentication boundary assumptions.
