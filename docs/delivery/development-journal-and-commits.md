# Development Journal and Commit History

## Development sequence

The checked-in local Git history from the provided project snapshot contains the following chronological progression. The later Vercel screenshot also shows a remote commit `734516d` titled `added vercel json`; verify the full current history in the repository before using it as a definitive list.

| Commit | Message | Engineering step / assessment signal |
|---|---|---|
| `abf172b` | Document salary management product scope and architecture | Requirements and architecture established before implementation |
| `da50329` | Add Supabase schema and repeatable employee seed data | Relational model, constraints, and dataset reproducibility |
| `ddbf4a9` | Implement Spring Boot salary API and Angular authentication foundation | API and identity integration established |
| `6e1616c` | Build HR salary dashboard and document deployment workflow | User-facing dashboard/workflow and deployment docs |
| `bf13778` | Harden employee create and timestamp mapping | Correctness refinements in data mapping and validation |
| `6a26477` | Remove unused timestamp import | Small maintenance cleanup isolated from feature work |
| `db9e540` | Enforce authenticated HR access and validate salary edits | Authorization boundary, input validation, versioned salary edits |
| `54d6bf4` | Configure reproducible Angular builds and add client tests | Build-time production config generation and test setup |
| `c66734b` | Document API behavior and deployment decisions in detail | API contract and decision records for reviewer comprehension |
| `734516d`* | added vercel json | Vercel configuration observed in a deployment screenshot; verify it is present in current repository |

`*` The last entry is derived from the user-provided Vercel deployment screenshot, not from the uploaded repository's local Git log. No dates beyond the recorded session dates are inferred.

## Why this sequence is useful

- Product scope is committed before feature work, making trade-offs inspectable.
- Schema and seed come before API logic, so the core data model is visible.
- API and identity are established before UI workflows depend on them.
- Security hardening and DTO behavior have their own commit rather than being buried in a large visual rewrite.
- Tests/build configuration and documentation are separate follow-up increments, improving reviewability.
- The small import cleanup demonstrates that not every commit is a broad feature change.

## Review of commit quality

The messages are descriptive and scoped. For a follow-up development cycle, preserve the same style: one coherent change per commit, add/update tests with behavior changes, and update docs/config in the same or a clearly associated commit. Avoid committing generated `target/`, `node_modules/`, built `dist/`, `.env`, or production environment output.

## Suggested next commits before final submission

1. `Fix production API base path and verify dashboard route` — ensure Vercel's `API_BASE_URL` ends in `/api`; add a test/guard for the expected base path; verify browser URL is `/api/dashboard/summary`.
2. `Improve API error logging without exposing secrets` — log unexpected exceptions server-side while preserving generic client details; redact credentials and tokens.
3. `Make seed fixture reproducibly generate unique demo names` — replace/adjust the checked-in seed generator to match documented demo data; run count/uniqueness checks on a clean DB.
4. `Add API authorization and salary audit integration tests` — exercise 401/403, successful audit, stale update, and rollback behavior.
5. `Document deployment smoke-test evidence` — add deployment dates, exact URLs (no secrets), status codes, and a green/failed result table after re-test.

Do not create these commits merely to have these names in history; commit them only after the actual changes and verification are completed.
