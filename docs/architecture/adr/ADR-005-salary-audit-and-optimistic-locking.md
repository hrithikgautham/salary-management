# ADR-005: Salary changes require reason, version, and audit

**Status:** Accepted

## Context

Compensation changes affect sensitive data and should be explainable. Two HR browser tabs may edit the same record.

## Decision

Salary update request includes amount, currency, `expectedVersion`, and reason. Backend checks the version and applies salary update plus audit insertion in one transaction. A stale edit returns conflict; a no-op edit does not create a history row.

## Alternatives considered

- Last-write-wins: rejected because it silently discards concurrent work.
- Store only current salary: rejected because it cannot answer who changed it and why.
- Audit in a separate asynchronous system: unnecessary complexity for this dataset and would complicate atomicity.

## Consequences

- Audit correctness depends on transactional boundaries and DB permissions.
- Test both version conflict and rollback if audit insertion fails.
- Consider stronger append-only database permissions/trigger controls before real HR deployment.
