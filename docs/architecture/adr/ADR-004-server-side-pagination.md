# ADR-004: Query and paginate in PostgreSQL

**Status:** Accepted

## Context

The target dataset is 10,000 employees. Search and filters should feel responsive and avoid sending all records to the browser.

## Decision

The API applies filters, sort allowlists, and page bounds in SQL. Default page size is 25; maximum is 100. Sorting uses an explicit list rather than interpolating arbitrary client strings.

## Alternatives considered

- Download all rows and filter in Angular: rejected for payload size, initial latency, and duplicated business rules.
- Add cache/search infrastructure immediately: deferred until measurement indicates a need.

## Consequences

- Count + page queries need indexes and query-plan review.
- Offset pagination is reasonable at 10k; if deep pages become slow, consider keyset pagination with a suitable stable order.
- Search query shape needs an integration/performance test against seeded data.
