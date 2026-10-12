# ACME Salary Management — One-Page Requirements

**Persona:** HR Manager responsible for compensation records for 10,000 employees across multiple countries.

**Problem and goal:** Compensation is maintained in spreadsheets, making records difficult to find, changes hard to trace, and organization-wide questions time-consuming. Build a secure web workspace to find employees, maintain current employee/salary details, and answer common compensation-distribution questions without downloading all records to the browser.

## In scope

1. **HR access:** Email/password sign-in through Supabase Auth. Spring Boot independently validates access tokens and restricts data APIs to configured HR email addresses.
2. **Directory:** Search by employee number, name, email, and job title; filter by country, department, and status; sort and paginate in the database.
3. **Employee management:** Create employee records and inspect/edit employee details. Salary updates include amount, currency, a reason, and expected record version so stale edits do not silently overwrite newer changes.
4. **Auditability:** For a real salary/currency change, persist old/new values, currency, actor, timestamp, and reason in a transaction with the employee update.
5. **Insights:** Show headcount and compensation averages/min/max/totals grouped by currency, country, and department. Never combine incompatible currencies without an explicit FX source, effective date, and reporting currency.
6. **Data and delivery:** Version schema migrations and provide a repeatable SQL seed for 10,000 synthetic employees with unique employee IDs/emails. Include fast tests, deployment instructions, and a short demo.

## Deliberately out of scope

- Payroll execution, tax/deduction calculation, payslips, bank transfers, or payroll-provider integrations: these require jurisdiction-specific rules and operational controls.
- Currency conversion or a single global salary total: no FX source, rate date, or reporting currency was specified.
- Employee self-service, approval workflows, SSO/MFA enforcement, delegated roles, and multi-tenant support: the first increment targets one HR persona; a real deployment needs formal role and organization membership controls.
- Bulk CSV import/export, attachments, salary letters, notifications, and point-in-time compensation snapshots: useful later, but not needed to prove the primary workflow.

## Acceptance criteria

- Missing/invalid tokens and non-allowlisted users cannot access protected salary APIs.
- HR can find, filter, sort, and page through 10,000 rows with bounded server responses.
- Invalid employee data, negative/over-precision salary amounts, duplicate identifiers, and stale versions return meaningful HTTP errors.
- A valid salary edit persists with exactly one audit entry; failed/stale updates do not silently partially apply.
- Insights group values by currency and exclude terminated staff from compensation aggregates as documented.
- A clean database can be seeded reproducibly; tests cover core validation and API behavior; deployed UI and API pass a recorded smoke test.

## Assumptions

- One ACME tenant; all demo employees and salaries are synthetic, and email addresses use `.test`.
- Salary amounts represent annual compensation and always pair with a three-letter currency code.
- The seed creates employee rows, not 10,000 Supabase Auth login accounts.
