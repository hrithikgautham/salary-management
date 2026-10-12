-- Deterministic synthetic dataset of 10,000 employees. Safe to run more than once.
-- Does not generate passwords or create Supabase Auth users.
with source as (
  select n,
    (array['Aarav','Ananya','Ishaan','Diya','Rohan','Meera','Kabir','Aanya','Arjun','Sana','Vihaan','Mira','Dev','Ira','Reyansh','Nisha','Aditya','Tara','Kian','Zoya','Noah','Olivia','Liam','Emma','Ethan','Ava','Lucas','Mia','Leo','Amelia','Oliver','Sofia','Mateo','Isabella','Elias','Freya','Theo','Lina','Hugo','Nora'])[1 + ((n * 7) % 40)] as first_name,
    (array['Sharma','Patel','Iyer','Reddy','Nair','Das','Kapoor','Mehta','Rao','Singh','Brown','Wilson','Taylor','Martin','Clark','Lewis','Walker','Hall','Young','Allen','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Parker','Collins','Edwards','Stewart','Morris','Murphy'])[1 + ((n * 11) % 40)] as last_name,
    (array['IN','US','GB','DE','SG','AU','CA','NL','JP','BR'])[1 + ((n * 3) % 10)] as country_code,
    (array['Engineering','Product','Design','People','Finance','Sales','Marketing','Operations','Legal','Security'])[1 + ((n * 13) % 10)] as department,
    (array['Software Engineer','Senior Software Engineer','Engineering Manager','Product Manager','Product Designer','HR Partner','Financial Analyst','Account Executive','Marketing Manager','Operations Specialist','Data Analyst','QA Engineer','Security Engineer','Recruiter','Business Analyst'])[1 + ((n * 5) % 15)] as job_title,
    (array['ACTIVE','ACTIVE','ACTIVE','ACTIVE','ON_LEAVE','TERMINATED'])[1 + ((n * 17) % 6)] as employment_status,
    (array['INR','USD','GBP','EUR','SGD','AUD','CAD','EUR','JPY','BRL'])[1 + ((n * 3) % 10)] as salary_currency
  from generate_series(1, 10000) as gs(n)
), normalized as (
  select n, first_name, last_name, country_code, department, job_title, employment_status, salary_currency,
    case country_code when 'IN' then 'India' when 'US' then 'United States' when 'GB' then 'United Kingdom'
      when 'DE' then 'Germany' when 'SG' then 'Singapore' when 'AU' then 'Australia'
      when 'CA' then 'Canada' when 'NL' then 'Netherlands' when 'JP' then 'Japan' else 'Brazil' end as country_name
  from source
)
insert into public.employees (
  employee_number, first_name, last_name, email, country_code, country_name,
  department, job_title, employment_status, hire_date, salary_amount, salary_currency
)
select
  'ACME-' || lpad(n::text, 5, '0'),
  first_name,
  last_name,
  lower('employee' || lpad(n::text, 5, '0') || '@example.test'),
  country_code,
  country_name,
  department,
  job_title,
  employment_status,
  date '2017-01-01' + ((n * 19) % 3400),
  round((case salary_currency
    when 'INR' then 900000 + ((n * 1731) % 3000000)
    when 'USD' then 65000 + ((n * 137) % 140000)
    when 'GBP' then 42000 + ((n * 113) % 95000)
    when 'EUR' then 48000 + ((n * 127) % 110000)
    when 'SGD' then 70000 + ((n * 149) % 125000)
    when 'AUD' then 72000 + ((n * 151) % 130000)
    when 'CAD' then 68000 + ((n * 139) % 120000)
    when 'JPY' then 6500000 + ((n * 1901) % 9000000)
    else 50000 + ((n * 131) % 100000)
  end)::numeric, 2),
  salary_currency
from normalized
on conflict (employee_number) do nothing;

-- Validate after run: expected total 10000 on a fresh seed.
-- select count(*) from public.employees;
