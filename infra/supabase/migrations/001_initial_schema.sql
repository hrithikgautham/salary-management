-- ACME Salary Management schema. Review before applying to a shared database.
create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_number varchar(32) not null unique,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  email varchar(254) not null unique,
  country_code char(2) not null,
  country_name varchar(100) not null,
  department varchar(100) not null,
  job_title varchar(120) not null,
  employment_status varchar(20) not null default 'ACTIVE'
    check (employment_status in ('ACTIVE', 'ON_LEAVE', 'TERMINATED')),
  hire_date date not null,
  salary_amount numeric(14,2) not null check (salary_amount >= 0),
  salary_currency char(3) not null,
  version bigint not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_employees_country_department
  on public.employees (country_code, department);
create index if not exists idx_employees_status on public.employees (employment_status);
create index if not exists idx_employees_employee_number on public.employees (employee_number);
create index if not exists idx_employees_last_first on public.employees (last_name, first_name);
create index if not exists idx_employees_hire_date on public.employees (hire_date);

create table if not exists public.salary_audit (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  changed_by uuid not null,
  changed_at timestamptz not null default now(),
  old_salary_amount numeric(14,2) not null check (old_salary_amount >= 0),
  new_salary_amount numeric(14,2) not null check (new_salary_amount >= 0),
  old_salary_currency char(3) not null,
  new_salary_currency char(3) not null,
  reason varchar(500) not null,
  constraint salary_audit_real_change check (
    old_salary_amount <> new_salary_amount or old_salary_currency <> new_salary_currency
  )
);
create index if not exists idx_salary_audit_employee_changed
  on public.salary_audit (employee_id, changed_at desc);

create or replace function public.touch_employee_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at
before update on public.employees
for each row execute function public.touch_employee_updated_at();

-- The app accesses tables with a backend-only database connection, not the browser.
-- Enable RLS and intentionally define no anon/authenticated policies. This prevents
-- accidental direct Data API access; the Spring service connects as its configured DB role.
alter table public.employees enable row level security;
alter table public.salary_audit enable row level security;


-- Explicit deny policies make the intended boundary visible in Supabase's advisors:
-- browser clients may authenticate, but only the Spring service may read salary data.
drop policy if exists deny_browser_access_employees on public.employees;
create policy deny_browser_access_employees on public.employees
  for all to anon, authenticated using (false) with check (false);
drop policy if exists deny_browser_access_salary_audit on public.salary_audit;
create policy deny_browser_access_salary_audit on public.salary_audit
  for all to anon, authenticated using (false) with check (false);
