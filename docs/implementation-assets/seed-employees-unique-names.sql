-- Deterministic alternative seed for a clean database.
-- Generates 10,000 employees whose first_name/last_name pairs are unique:
-- 100 first names x 100 last names mapped one-to-one to ACME-00001..ACME-10000.
-- Uses synthetic data and reserved .test email domain. Does not create Auth users.
-- Idempotent on employee_number. On a populated database, existing rows are not renamed.

with source as (
  select n,
    (array['Aarav', 'Ananya', 'Ishaan', 'Diya', 'Rohan', 'Meera', 'Kabir', 'Aanya', 'Arjun', 'Sana', 'Vihaan', 'Mira', 'Dev', 'Ira', 'Reyansh', 'Nisha', 'Aditya', 'Tara', 'Kian', 'Zoya', 'Noah', 'Olivia', 'Liam', 'Emma', 'Ethan', 'Ava', 'Lucas', 'Mia', 'Leo', 'Amelia', 'Oliver', 'Sofia', 'Mateo', 'Isabella', 'Elias', 'Freya', 'Theo', 'Lina', 'Hugo', 'Nora', 'James', 'Charlotte', 'Benjamin', 'Evelyn', 'Henry', 'Harper', 'Alexander', 'Abigail', 'Daniel', 'Emily', 'Michael', 'Elizabeth', 'Sebastian', 'Grace', 'Jack', 'Lily', 'Owen', 'Chloe', 'Samuel', 'Ella', 'Joseph', 'Victoria', 'David', 'Scarlett', 'Gabriel', 'Aria', 'Dylan', 'Layla', 'Julian', 'Zoe', 'Matthew', 'Hannah', 'Anthony', 'Penelope', 'Isaac', 'Eleanor', 'Nathan', 'Stella', 'Andrew', 'Maya', 'Aaron', 'Naomi', 'Thomas', 'Priya', 'Vikram', 'Anika', 'Rahul', 'Kavya', 'Karthik', 'Aisha', 'Omar', 'Fatima', 'Yusuf', 'Leila', 'Chen', 'Mei', 'Wei', 'Yuki', 'Sakura', 'Miguel'])[1 + ((n - 1) % 100)] as first_name,
    (array['Sharma', 'Patel', 'Iyer', 'Reddy', 'Nair', 'Das', 'Kapoor', 'Mehta', 'Rao', 'Singh', 'Brown', 'Wilson', 'Taylor', 'Martin', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Morris', 'Murphy', 'Johnson', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Moore', 'Jackson', 'Thomas', 'White', 'Harris', 'Thompson', 'Robinson', 'King', 'Lee', 'Kim', 'Park', 'Wang', 'Liu', 'Zhang', 'Huang', 'Lin', 'Yang', 'Wu', 'Xu', 'Li', 'Zhao', 'Nakamura', 'Sato', 'Tanaka', 'Suzuki', 'Watanabe', 'Ito', 'Kobayashi', 'Yamamoto', 'Kato', 'Yamada', 'Santos', 'Silva', 'Costa', 'Pereira', 'Oliveira', 'Souza', 'Almeida', 'Ferreira', 'Carvalho', 'Gomez', 'Diaz', 'Torres', 'Flores', 'Ramirez', 'Cruz', 'Reyes', 'Castro', 'Morales', 'Ortiz'])[1 + ((n - 1) / 100)] as last_name,
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

-- Run after the insert on an otherwise clean database; expected results:
-- 10000 rows, 10000 employee numbers, 10000 emails, 10000 seeded full names.
-- select count(*) from public.employees where employee_number ~ '^ACME-[0-9]{5}$';
-- select count(distinct (first_name, last_name)) from public.employees where employee_number ~ '^ACME-[0-9]{5}$';
