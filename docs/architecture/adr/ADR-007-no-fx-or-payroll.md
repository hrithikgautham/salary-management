# ADR-007: Defer FX conversion and payroll execution

**Status:** Accepted

## Context

The prompt asks HR to manage salary data and answer questions about how the organization pays people, not to calculate statutory pay or transfer money.

## Decision

Provide current annual compensation maintenance and segmented analysis. Do not implement FX conversion, tax/deduction logic, payslips, or payments.

## Rationale

FX conversion needs an authoritative provider, rate date, currency direction, missing-rate policy, and audit history. Payroll needs jurisdiction-specific rules and operational controls. Guessing these rules would give leadership numbers that look precise but are not reliable.

## Consequences

Insights explicitly group by currency and explain that no cross-currency total is computed. Future FX work should be a separate scoped feature with dated rates and reproducible calculations.
