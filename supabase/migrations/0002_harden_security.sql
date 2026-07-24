-- Security hardening, surfaced by Supabase's security advisor after 0001.
--
-- Both helper functions were in the exposed `public` schema, which meant
-- PostgREST exposed them as callable REST RPC endpoints to the anon and
-- authenticated roles. Neither is meant to be called directly:
--   * current_company_id() is only ever used inside RLS policy expressions
--   * handle_new_user() only runs from the auth.users insert trigger
--
-- Fix, in two parts:
--   1. Move current_company_id() into a `private` schema that PostgREST does
--      NOT expose. RLS still needs the querying role to hold EXECUTE on it
--      (verified: revoking it outright breaks RLS), so we keep the grant but
--      move it off the public API surface. All policies are re-pointed.
--   2. Revoke EXECUTE on the handle_new_user() trigger function from the API
--      roles. Trigger functions fire regardless of the invoking role's
--      privileges, so this is safe and removes the stray RPC endpoint.

-- Part 1: move current_company_id() to a non-exposed schema ------------------

create schema if not exists private;

create or replace function private.current_company_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- The API roles evaluate RLS and must be able to call it, but `private` is not
-- in PostgREST's exposed schema list, so it never becomes an RPC endpoint.
grant usage on schema private to anon, authenticated;
grant execute on function private.current_company_id() to anon, authenticated;

drop policy "read own company" on public.companies;
create policy "read own company" on public.companies
  for select using (id = private.current_company_id());

drop policy "read own profile row and colleagues" on public.profiles;
create policy "read own profile row and colleagues" on public.profiles
  for select using (company_id = private.current_company_id());

drop policy "quotes scoped to company" on public.quotes;
create policy "quotes scoped to company" on public.quotes
  for all using (company_id = private.current_company_id())
  with check (company_id = private.current_company_id());

drop policy "exceptions scoped to company" on public.exceptions;
create policy "exceptions scoped to company" on public.exceptions
  for all using (company_id = private.current_company_id())
  with check (company_id = private.current_company_id());

drop policy "resolutions scoped to company via exception" on public.resolutions;
create policy "resolutions scoped to company via exception" on public.resolutions
  for all using (
    exists (
      select 1 from public.exceptions e
      where e.id = resolutions.exception_id
      and e.company_id = private.current_company_id()
    )
  )
  with check (
    exists (
      select 1 from public.exceptions e
      where e.id = resolutions.exception_id
      and e.company_id = private.current_company_id()
    )
  );

drop function public.current_company_id();

-- Part 2: lock down the trigger function ------------------------------------

revoke execute on function public.handle_new_user() from public, anon, authenticated;
