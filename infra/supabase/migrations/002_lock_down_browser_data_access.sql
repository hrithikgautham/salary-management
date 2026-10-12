-- Make browser denial explicit and harden the timestamp trigger function's search path.
-- Safe to re-run; this complements the baseline schema migration.
alter table public.employees enable row level security;
alter table public.salary_audit enable row level security;
drop policy if exists deny_browser_access_employees on public.employees;
create policy deny_browser_access_employees on public.employees
  for all to anon, authenticated using (false) with check (false);
drop policy if exists deny_browser_access_salary_audit on public.salary_audit;
create policy deny_browser_access_salary_audit on public.salary_audit
  for all to anon, authenticated using (false) with check (false);
create or replace function public.touch_employee_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
