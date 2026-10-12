# ADR-003: Store salary as decimal plus currency, never as float alone

**Status:** Accepted

## Context

Employees are in countries whose salary amounts use different currencies. Monetary precision and units must survive writes and aggregations.

## Decision

Store salary amount in PostgreSQL `numeric(14,2)` and Java `BigDecimal`, paired with a three-letter currency code. Group totals/averages by currency, country, and department. Do not add incompatible currencies into one total.

## Alternatives considered

- Floating point/double: rejected for monetary arithmetic due binary rounding behavior.
- One global total: rejected without an exchange-rate source, effective date, and reporting-currency decision.

## Consequences

- Every UI label needs the matching currency.
- Cross-currency reporting is intentionally limited until FX conversion is specified.
- Precision and rounding behavior should be covered by validation tests.
