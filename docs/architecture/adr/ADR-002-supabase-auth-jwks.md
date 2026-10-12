# ADR-002: Supabase Auth for identity; Spring validates JWTs

**Status:** Accepted, subject to deployed-claim verification

## Context

The assessment needs email/password HR access without implementing password storage or recovery flows in the application.

## Decision

Use Supabase Auth in Angular. Send the Supabase access token as a Bearer token. Spring Security verifies its cryptographic signature with the published JWKS, expected issuer, time claims, `authenticated` audience, and an environment-configured HR email allowlist.

## Alternatives considered

- Store passwords in the application database: rejected; recreates security-sensitive identity features.
- Trust Angular's route guard only: rejected because browser checks are not an authorization boundary.
- Put a service-role key in the browser: rejected because it would expose privileged access.

## Consequences / operational notes

- Configure asymmetric JWT signing compatible with ES256 or RS256; a legacy HS256-only signing configuration will not validate with this decoder.
- `SUPABASE_ISSUER_URI`, `SUPABASE_JWK_SET_URI`, and `SUPABASE_ALLOWED_HR_EMAILS` must be set for the actual project.
- Confirm the token issuer/audience from a test account without sharing the raw token.
- Email allowlist is simple but does not replace an organization/role permission model for a production HR platform.
