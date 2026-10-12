# Performance and 10,000-Record Design

## Target profile

- 10,000 employee rows.
- One primary HR operator for assessment demonstration.
- Directory default page size 25; maximum 100.
- Reads consist of filtered lists and summary aggregates; writes are employee creation and salary changes.
- PostgreSQL is the source of truth; no caching or search service at this scale.

## Choices made

### Server-side filtering, sorting, pagination

The browser sends filters and paging parameters; `EmployeeService` rejects negative page numbers, page size outside 1–100, unsupported status/country/sort/direction. The repository performs the SQL work. This avoids repeated downloading and filtering the entire data set and avoids trusting client-created sort SQL.

### Index where access patterns justify it

Schema indexes cover country/department, status, employee number, last/first name ordering, hire date, and audit by employee/time. The unique employee-number constraint already creates a supporting unique index, so `idx_employees_employee_number` may be redundant; verify actual index behavior and remove redundancy if query plans justify it.

### Aggregate in PostgreSQL

Dashboard summaries group by currency, country, and department close to the data. Do not compute a synthetic global total across currencies. A materialized view/cache is intentionally deferred until repeated measured queries demonstrate need.

### Bound connection pool

The Hikari pool defaults to 8 and is configurable with `DB_POOL_SIZE`. For a free-tier Render instance, start conservatively (for example 4) and account for Supabase connection limits and other services. Pool sizing should be based on concurrent load, database limit, and request timing—not copied blindly between environments.

## Measurement plan

1. Seed a clean staging DB with the 10,000-record script.
2. Capture p50/p95 latency for common calls: first directory page, selective employee-number search, broad name query, combined filters, summary dashboard, salary audit query.
3. Capture DB query plans with `EXPLAIN (ANALYZE, BUFFERS)` for list count/page and aggregate SQL.
4. Verify response page never exceeds 100 records and payload sizes remain bounded.
5. Test with a small concurrent load representative of a few HR users; record errors and connection wait time.
6. If slow, optimize the query and indexes based on evidence. Consider trigram/FTS for large fuzzy search, keyset pagination for deep browsing, materialized aggregates for expensive frequently repeated reports.

## Risks and limits

- `ILIKE '%term%'` queries may not benefit from standard B-tree indexes; measure before adding `pg_trgm` or a search-specific strategy.
- Offset pagination becomes more expensive for large page offsets, but is acceptable at the assessment scale if tests show adequate latency.
- Aggregate counts and sums can become expensive as records/historical data grow; no dashboard cache invalidation design exists yet.
- Free hosting sleep/wake delay is a platform limitation, not an application benchmark. Measure only after the service has warmed up, and document cold-start behavior separately.

## Proposed acceptance budget (to measure, not a current claim)

| Operation | Proposed warm p95 objective | Notes |
|---|---:|---|
| Employee number lookup | < 300 ms | Network and host latency excluded or separately reported |
| Default directory page | < 500 ms | Count query included; filters optional |
| Summary dashboard | < 1 s | Warm service and seeded 10k dataset |
| Salary update + audit | < 500 ms | Includes transaction, excludes cold-start |

These are proposed validation targets, not measured results. Do not quote them as observed performance until a benchmark record has been added.
