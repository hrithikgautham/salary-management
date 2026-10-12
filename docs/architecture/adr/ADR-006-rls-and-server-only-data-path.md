# ADR-006: Keep salary table access behind Spring Boot

**Status:** Accepted

## Context

The browser uses a Supabase client for authentication, but employee salary records are sensitive and business rules belong in the API.

## Decision

Enable RLS for `employees` and `salary_audit`, install explicit deny policies for browser roles `anon` and `authenticated`, and connect Spring using a server-only PostgreSQL credential. The browser uses a publishable key only for Auth.

## Consequences

- There must be no frontend query directly selecting salary rows from Supabase Data API.
- Backend database credentials must only exist in backend hosting/local untracked configuration.
- Database role and RLS behavior must be checked in staging. Avoid using owner/superuser privileges casually; RLS behavior differs by role.
