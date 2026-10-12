# ADR-001: Keep business behavior in one Spring Boot API

**Status:** Accepted for assessment scope

## Context

The user story has one primary actor, a modest data set of 10,000 records, and a small number of read/write workflows. We need a single place for validation, concurrency, authorization, and audit behavior.

## Decision

Use Angular for UI, one Spring Boot REST API for business rules, and PostgreSQL as the source of truth. Deploy UI and API independently.

## Alternatives considered

- Put business logic in the browser: rejected because client validation is bypassable and data access would be harder to centralize.
- Multiple backend services: rejected because it adds deployment/consistency complexity without a current scale or domain boundary need.
- Spreadsheet-only automation: does not meet the interactive web software requirement.

## Consequences

- A salary edit and audit entry can share a DB transaction.
- Static UI deployment scales separately from the Java service.
- API/database connectivity is a critical dependency and must be observable.
- API integration tests and a deployed smoke test are mandatory; a running process alone is not proof of working behavior.
