# API Contract (source-derived)

All business controller routes are prefixed with `/api`. Except `/api/health` and permitted Actuator health/info endpoints, API routes require a valid JWT and a matching HR email allowlist entry.

## Endpoint inventory

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/health` | API health response | Public |
| GET | `/api/dashboard/summary` | Counts and compensation aggregates | Protected |
| GET | `/api/employees` | Search/filter/sort/page employee records | Protected; defaults page 0, size 25, sort last name ascending |
| GET | `/api/employees/filters` | Distinct country/department filter values | Protected |
| GET | `/api/employees/{id}` | Retrieve employee by UUID | Protected |
| POST | `/api/employees` | Create employee | Protected; request validation and DB uniqueness |
| PUT | `/api/employees/{id}/salary` | Change salary | Protected; requires version and reason; creates audit row for an actual change |
| GET | `/api/employees/{id}/salary-audit` | Latest 100 audit entries for employee | Protected |
| GET | `/actuator/health` | Hosting health check | Public, used by Render |

## Directory query

Example:

```http
GET /api/employees?q=Aarav&country=IN&department=Engineering&status=ACTIVE&page=0&size=25&sort=last_name&direction=asc
Authorization: Bearer <supabase-access-token>
```

- `q`: case-insensitive query across employee number, first name, last name, email, and job title (see `EmployeeRepository`).
- `country`: two-letter code; normalized to uppercase.
- `department`: exact department name.
- `status`: `ACTIVE`, `ON_LEAVE`, or `TERMINATED`.
- `page`: zero-based, non-negative.
- `size`: from 1 to 100.
- `sort`: allowlisted `employee_number`, `first_name`, `last_name`, `department`, `country_code`, `salary_amount`, `hire_date`, or `updated_at`.
- `direction`: `asc` or `desc`.

Response envelope:

```json
{
  "items": [],
  "page": 0,
  "size": 25,
  "totalItems": 10000,
  "totalPages": 400
}
```

The `totalItems` and `totalPages` values depend on applied filters, not fixed sample values.

## Create employee

`POST /api/employees` accepts required data from `EmployeeRequest`. Typical fields include employee number, first/last name, email, country code/name, department, job title, employment status, hire date, salary amount, and salary currency. Request DTO annotations enforce constraints; DB unique constraints are the final protection against duplicate employee number/email.

Example field outline (use exact casing from DTO in source):

```json
{
  "employeeNumber": "ACME-10001",
  "firstName": "Sample",
  "lastName": "Person",
  "email": "sample.person@example.test",
  "countryCode": "IN",
  "countryName": "India",
  "department": "Engineering",
  "jobTitle": "Software Engineer",
  "employmentStatus": "ACTIVE",
  "hireDate": "2024-04-01",
  "salaryAmount": 1250000.00,
  "salaryCurrency": "INR"
}
```

The sample is illustrative; verify the actual record DTO names and validation annotations when changing the contract.

## Salary update

```http
PUT /api/employees/{uuid}/salary
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

```json
{
  "salaryAmount": 125000.25,
  "salaryCurrency": "USD",
  "expectedVersion": 0,
  "reason": "Annual compensation review"
}
```

- Salary is non-negative and has at most two fractional decimal places.
- Currency is a three-letter code.
- Reason is required and length-validated.
- `expectedVersion` must match the current row version. Stale edits return `409 Conflict`.
- If amount and currency did not change, a fake audit event is not inserted.
- The salary update and audit insert are intended to occur in a single transaction.
- `changed_by` is sourced from the authenticated JWT `sub` and parsed as a UUID; malformed subjects are rejected.

## Dashboard semantics

`GET /api/dashboard/summary` returns:

- Headcount by status, including terminated employees.
- Compensation grouped by currency with employee count, average, minimum, maximum, and total.
- Country/currency segment summaries.
- Department/currency summaries.

The compensation aggregate excludes terminated employees. The API intentionally does not compute one cross-currency total. A downstream change that needs FX conversion must specify the currency rate provider and the rate date.

## Expected status/error classes

| Status | Meaning |
|---|---|
| 200 | Successful read/update |
| 200 | Current create controller returns the saved record without an explicit `@ResponseStatus`; consider changing to 201 Created if desired |
| 400 | Invalid DTO, invalid page/size/status/country/sort/direction |
| 401 | Missing, invalid, expired token, invalid subject as applicable |
| 403 | Authenticated email not in configured allowlist |
| 404 | Unknown employee ID |
| 409 | Duplicate employee identity or stale version conflict |
| 500 | Unexpected failure; response deliberately avoids revealing database exception details |

## Production integration gotcha

`ApiService` constructs URLs by appending `/dashboard/summary`, `/employees`, etc. to `environment.apiBaseUrl`. Therefore **production `API_BASE_URL` must end in `/api`**, e.g. `https://<your-render-service>.onrender.com/api`. If it is set only to the Render origin, the browser requests `/dashboard/summary`, but the controller is mapped to `/api/dashboard/summary`. Verify the exact URL in browser DevTools before debugging anything else.
