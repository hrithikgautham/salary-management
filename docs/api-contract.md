# API contract and domain rules

All business routes are under `/api`. All routes except `/api/health` require a signed Supabase access token in `Authorization: Bearer <token>`. Spring verifies the signature against the configured JWKS URI, the issuer, expiry/not-before claims, the `authenticated` audience, and the email allowlist. Invalid/missing credentials return 401; signed-in users not in `SUPABASE_ALLOWED_HR_EMAILS` receive 403.

## Employee directory

`GET /api/employees?q=&country=&department=&status=&page=0&size=25&sort=last_name&direction=asc`

- `q` searches employee number, first name, last name, email, and job title.
- `country` accepts two-letter country codes; `department` is an exact department name.
- `status` is `ACTIVE`, `ON_LEAVE`, or `TERMINATED`.
- `page` is zero-based; `size` must be from 1 to 100.
- `sort` is allowlisted: `employee_number`, `first_name`, `last_name`, `department`, `country_code`, `salary_amount`, `hire_date`, or `updated_at`. `direction` is `asc` or `desc`.
- Response shape: `{ "items": [], "page": 0, "size": 25, "totalItems": 0, "totalPages": 0 }`.

`GET /api/employees/filters` returns distinct country codes and departments.

`GET /api/employees/{id}` returns one record.

`POST /api/employees` creates a record after DTO validation. It requires employee number, name, valid email, country, department, title, employment status, hire date, salary amount, and currency.

## Compensation updates and audit

`PUT /api/employees/{id}/salary`

```json
{
  "salaryAmount": 125000.25,
  "salaryCurrency": "USD",
  "expectedVersion": 0,
  "reason": "Annual performance review"
}
```

Salary must be non-negative, have at most two fractional digits and fit `numeric(14,2)`. A currency is represented by a three-letter uppercase code; currency conversion is not performed. The expected version must match the current employee version. A stale version returns 409 Conflict. The update and history insert share a database transaction. A no-op update leaves the version unchanged and does not create a fake audit event.

`GET /api/employees/{id}/salary-audit` returns up to 100 newest changes, with old/new amount and currency, time, actor subject, and reason.

## Dashboard

`GET /api/dashboard/summary` returns employee counts, compensation totals grouped by currency, summaries by country and currency, and summaries by department and currency. Terminated employees are excluded from compensation averages/totals but remain in headcount counts. The response intentionally has no cross-currency total.

## Error responses

Errors use Spring's Problem Details response format. Expected status codes include 400 for invalid input, 401 for missing/invalid credentials, 403 for a non-allowlisted account, 404 for a missing employee, and 409 for duplicate identity fields or stale updates. Unexpected server errors return a generic detail without database exception contents.
