# Test Matrix and Exit Criteria

| Area | Scenario | Expected result | Existing automation | Required evidence |
|---|---|---|---|---|
| Employee search | Query by name/number/email/title | Only matching rows and correct total | Partial service/API tests | Repository integration test |
| Pagination | page 0 size 25 on 10k rows | max 25 returned; total count remains correct | Service bounds covered | DB integration/performance test |
| Pagination validation | negative page, size 0, size 101 | HTTP 400 | Service unit coverage exists | Controller-level HTTP test |
| Filtering | country+department+status combined | Combined result set | Partial country normalization test | Integration fixture across combinations |
| Sorting | allowlisted sort and ascending/descending | Stable order | Invalid sort/direction unit coverage | Test each exposed sortable field |
| Employee create | valid input | Saved row returned | Not observed in listed unit tests | Controller/repository integration test |
| Unique identity | duplicate employee number or email | HTTP 409 | Exception handler branch exists | DB integration test |
| Salary validation | negative salary/overprecision/bad reason | HTTP 400 with field errors | DTO tests exist | Preserve messages and client display |
| Salary change | amount/currency changes with reason | Employee update + exactly one audit row | Not fully represented in existing tests | Transactional integration test |
| No-op salary save | same amount/currency | No audit row / no version churn per service rule | Not observed in existing tests | Integration test |
| Stale edit | expectedVersion no longer current | HTTP 409, current row unchanged by stale request | Service/repository behavior described | Concurrent/stale test |
| Audit failure | audit insert fails | salary update rolls back | Not observed in existing tests | Transaction test with constraint/failure injection |
| Auth missing | no Bearer token on protected route | 401 | Not observed in listed tests | Spring Security test |
| Auth invalid | bad/expired/wrong issuer/audience JWT | 401 | Not observed in listed tests | Decoder/MockMvc test; real staging token smoke test |
| Auth allowlist | valid JWT, email outside allowlist | 403 | Config code exists | MockMvc/authorization test |
| RLS boundary | anon/auth roles attempt direct table access | denied | SQL policies exist | Supabase policy check using browser credentials |
| Dashboard | groups by currency/country/department | totals match independent SQL | Not observed in listed tests | SQL fixture + controller test |
| Currency clarity | INR and USD appear in same view | separate totals, no FX conversion | UI evidenced | UI test or visual smoke check |
| SPA routing | refresh `/employees` or `/insights` | Angular page still loads | Rewrite configured/changed during deployment | Test live Vercel deep links |
| Production base URL | dashboard call | `/api/dashboard/summary` | `API_BASE_URL` build script exists | DevTools screenshot / 200 response |
| Database connectivity | Render API calls summary | successful JDBC query | Deployment exists | Render log and endpoint smoke test |
| Build | Angular production build | success with envs present | workflow exists | Green CI job |
| Backend quality | `mvn test` | all tests green | workflow exists | Green CI job |

## Release exit criteria

Do not mark the assessment fully complete until all of the following are demonstrated:

- [ ] Latest backend and frontend commits pass CI.
- [ ] Production homepage and Angular deep links load.
- [ ] Login succeeds with dedicated demo HR account.
- [ ] `/api/dashboard/summary` returns 200 from browser with a current token.
- [ ] Employee list/search/filter/pagination returns correct data.
- [ ] Employee creation persists.
- [ ] Salary edit persists and exactly one audit row is visible.
- [ ] Invalid data and stale version produce the documented client-visible errors.
- [ ] Unauthenticated and non-allowlisted API access are denied.
- [ ] Secret scan and Git history review show no credentials.
- [ ] Demo video avoids displaying credentials or raw tokens.
