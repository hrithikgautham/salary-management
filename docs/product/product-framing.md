# Product Framing and User Workflows

## Persona and job to be done

**Primary persona:** HR Manager who owns the current compensation directory and needs to answer questions from leadership. The manager needs to retrieve a trustworthy record quickly, make a controlled update, and explain how summary numbers were produced.

**Job statement:** “When an employee record or compensation question comes to me, I want to find the current record, make a valid change with a clear reason, and see totals segmented by meaningful groups so that I stop reconciling spreadsheets manually.”

## Core workflows

### A. Sign in and reach a trusted workspace
1. HR enters email and password in the Angular UI.
2. Supabase Auth handles credential verification and returns a session.
3. Angular attaches the access token to requests to the Spring API.
4. Spring validates the token and applies an explicit email allowlist before serving employee and salary endpoints.
5. If the token is missing/invalid, the API rejects the request; if the user is authenticated but not allowlisted, the API should deny access.

### B. Find an employee
1. HR enters a name or employee number.
2. Optional country, department, and status filters can be combined.
3. Backend applies predicates, sorting, and pagination in PostgreSQL.
4. UI displays the returned page and total count; the browser does not download all 10,000 employees first.

### C. Add an employee
1. HR opens the add-employee form.
2. Required identity, work, location, status, hire date, salary amount, and currency fields are validated.
3. The API persists a row and database uniqueness constraints protect employee number/email from duplicates.
4. UI receives the saved record or a field/duplicate error.

### D. Update salary
1. HR opens an employee record and sees the current salary and record version.
2. HR enters salary amount, currency, and a meaningful reason.
3. The request carries `expectedVersion`; the backend compares it with the current version.
4. Within one transaction, the API updates the salary and writes an audit event. If the version is stale or audit insertion fails, the operation must not silently become a partial update.
5. The UI refreshes the employee state and audit history.

### E. Answer a compensation question
1. HR selects dashboard or Salary insights.
2. API returns aggregate data grouped by currency, country, and department.
3. UI shows headcount and average/min/max/total values for compatible currency groups.
4. Any question asking for converted worldwide cost remains out of scope until FX source, rate timestamp, and reporting currency are defined.

## Product principles

- **Correctness before breadth:** prioritise a trustworthy edit and trace over additional workflows.
- **Currency is context:** a number without currency is not a complete salary fact.
- **Server-side query:** the API/database own search and aggregation decisions for the 10k dataset.
- **Visible feedback:** loading, empty, validation, permission, conflict, and failure states should be distinguishable.
- **Audit as a domain feature:** salary edits explain “what changed, when, by whom, and why.”
- **Synthetic data only in the demo:** use generated names and `example.test` email addresses; never show real salary data.

## Product metrics / acceptance signals

| Signal | Initial target | Validation |
|---|---|---|
| Employee search behavior | Search/filter results match server data; page size default 25, maximum 100 | API tests and browser smoke test |
| Compensation data clarity | Every amount grouped/labelled by currency | UI inspection + aggregate query comparison |
| Salary traceability | Every actual salary/currency change creates one audit entry | Update flow + database query |
| Concurrency safety | Stale expected version returns conflict | Two-client/manual test and service/repository tests |
| Baseline dataset | Exactly 10,000 seeded employee IDs on a clean database | SQL count, uniqueness checks |
| Access boundary | Unauthorized/unauthenticated data requests denied | Security integration test and deployed smoke test |

## Explicit product assumptions and risks

- Distinct employee IDs/emails are domain requirements. Real people may share a full name, so full-name uniqueness must not become a production constraint. The synthetic dataset can deliberately use distinct full names to make a visual demo less repetitive.
- Status counts represent employee records; compensation totals exclude terminated employees, while headcount counters still show all statuses.
- The first version is not a payroll calculation or compliance system. The phrase “salary management” here means maintaining current annual compensation data and analyzing it.
