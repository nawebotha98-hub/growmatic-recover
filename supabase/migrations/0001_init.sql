-- GrowMatic Recover — core schema
-- One company per customer (tenant). A profile links a Supabase auth user to a company.

create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  full_name text,
  role text not null default 'owner' check (role in ('owner', 'staff', 'viewer')),
  created_at timestamptz not null default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  customer_name text not null,
  quote_number text,
  value_cents bigint not null check (value_cents >= 0),
  sent_at date not null,
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  outcome_recorded_at date,
  source_row jsonb,
  created_at timestamptz not null default now()
);

create index quotes_company_id_idx on quotes (company_id);
create index quotes_status_idx on quotes (status);

create table exceptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  quote_id uuid not null references quotes (id) on delete cascade,
  rule_triggered text not null check (
    rule_triggered in ('stale_no_followup', 'no_recorded_outcome')
  ),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  days_since_sent integer not null,
  flagged_at timestamptz not null default now(),
  assigned_to uuid references profiles (id),
  resolved_at timestamptz
);

create index exceptions_company_id_idx on exceptions (company_id);
create index exceptions_open_idx on exceptions (company_id) where resolved_at is null;

-- A plain UNIQUE constraint wouldn't work here: Postgres treats every NULL as
-- distinct, so it would happily allow duplicate open (resolved_at IS NULL) rows
-- per quote. A partial unique index is what actually enforces "at most one open
-- exception per quote at a time" — re-flagging should update the existing row.
create unique index exceptions_one_open_per_quote on exceptions (quote_id) where resolved_at is null;

create table resolutions (
  id uuid primary key default gen_random_uuid(),
  exception_id uuid not null references exceptions (id) on delete cascade,
  outcome text not null check (outcome in ('recovered', 'lost', 'no_action_needed')),
  recovered_value_cents bigint not null default 0,
  note text,
  resolved_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- When a new auth user signs up, create their company + owner profile automatically.
-- Expects the signup call to pass `company_name` in the user's metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_company_id uuid;
begin
  insert into public.companies (name)
  values (coalesce(new.raw_user_meta_data ->> 'company_name', 'My Company'))
  returning id into new_company_id;

  insert into public.profiles (id, company_id, full_name, role)
  values (new.id, new_company_id, new.raw_user_meta_data ->> 'full_name', 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row-level security: every table is scoped to the caller's company via their profile.
alter table companies enable row level security;
alter table profiles enable row level security;
alter table quotes enable row level security;
alter table exceptions enable row level security;
alter table resolutions enable row level security;

create or replace function public.current_company_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create policy "read own company" on companies
  for select using (id = public.current_company_id());

create policy "read own profile row and colleagues" on profiles
  for select using (company_id = public.current_company_id());

create policy "quotes scoped to company" on quotes
  for all using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

create policy "exceptions scoped to company" on exceptions
  for all using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

create policy "resolutions scoped to company via exception" on resolutions
  for all using (
    exists (
      select 1 from exceptions e
      where e.id = resolutions.exception_id
      and e.company_id = public.current_company_id()
    )
  )
  with check (
    exists (
      select 1 from exceptions e
      where e.id = resolutions.exception_id
      and e.company_id = public.current_company_id()
    )
  );
