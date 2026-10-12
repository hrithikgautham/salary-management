# Requirements-to-Implementation Traceability

This matrix helps a reviewer connect the product requirement to the relevant source, automated coverage, and current evidence. “Implemented in source” does not mean the deployed journey has passed; see the readiness record.

| Requirement / capability | Main implementation locations | Existing test evidence | Status to claim carefully |
|---|---|---|---|
| Supabase email/password sign-in | `frontend/src/app/pages/login/login.component.ts`, `frontend/src/app/core/supabase.service.ts` | `login.component.spec.ts` checks form/screen creation | UI/source present; deployed sign-in must be smoke-tested |
| Protect routes / attach API access token | `frontend/src/app/core/auth.guard.ts`, `frontend/src/app/core/auth.interceptor.ts` | No dedicated guard/interceptor tests observed in snapshot | Source present; security integration tests still needed |
| Verify JWT and HR allowlist in API | `backend/src/main/java/co/incubyte/salary/config/SecurityConfig.java`, `backend/src/main/resources/application.yml` | No JWT security integration test observed | Source present; verify issuer/JWKS/audience/signing algorithm and 401/403 on staging |
| Browse employees with search/filters/pagination | `frontend/src/app/pages/employees/employees.component.ts`, `backend/src/main/java/co/incubyte/salary/employee/EmployeeController.java`, `EmployeeService.java`, `EmployeeRepository.java` | `EmployeeServiceTest`, `api.service.spec.ts` | Core path implemented; SQL integration and deployed tests needed |
| Create employee | `EmployeeController.java`, `EmployeeRequest.java`, `EmployeeRepository.java`, employee UI/detail component | Duplicate-key mapping exists in exception handler; create integration test not observed | Source present; must prove persistence and duplicate handling |
| View/edit employee salary | `frontend/src/app/pages/employee-detail/employee-detail.component.ts`, `EmployeeController.java`, `SalaryUpdateRequest.java`, `EmployeeRepository.java` | DTO validation tests cover negative salary, precision and reason length | Salary request validation is tested; deployed edit path not yet evidenced as passing |
| Prevent stale salary overwrite | `EmployeeRepository.updateSalary` reads/compares the version and returns conflict for stale updates | Stale/concurrent integration test not observed | Logic present; needs integration test |
| Record salary audit | `SalaryAuditEntry.java`, `EmployeeRepository.updateSalary`, `EmployeeRepository.audit`; `salary_audit` schema | Audit transaction integration test not observed | Logic/schema present; verify one row per real change and rollback behavior |
| Dashboard KPIs and compensation summaries | `backend/src/main/java/co/incubyte/salary/dashboard/DashboardController.java`, dashboard page | No dashboard aggregation test observed | SQL aggregation present; currently captured deployed request returns 500 |
| Insights by currency/country/department | `frontend/src/app/pages/insights/insights.component.ts`, dashboard query/summary records | No full aggregation test observed | UI/source present; compare results to independent SQL query |
| 10,000 synthetic employee seed | `infra/scripts/seed-employees.sql`, migrations under `infra/supabase/migrations/` | SQL count/uniqueness verification run in connected project; unique-name replacement included in this pack | Live database had 10,000 seed IDs plus one extra manual row; clean seed should be verified after adopting replacement |
| Error responses | `backend/src/main/java/co/incubyte/salary/common/ApiExceptionHandler.java` | One status error handler unit test | Generic API errors designed; unexpected error logging and production diagnostics should be reviewed |
| Deployment | `backend/Dockerfile`, `render.yaml`, `frontend/scripts/write-production-environment.mjs`, frontend Vercel configuration | CI workflow exists | Vercel and Render deployment observed; full end-to-end path remains open |

## Reviewer navigation

1. Start at `README.md` for run commands and repository layout.
2. Read [`requirements/one-page-requirements.md`](../requirements/one-page-requirements.md), then [`architecture/architecture.md`](../architecture/architecture.md).
3. Use this matrix to inspect code in small slices.
4. Read the test strategy and readiness record before deciding what is fully verified.
5. Review the actual Git log and latest CI run; the documents do not substitute for source control or test evidence.
