-- Run only if you already created an older version of `leads` without these columns/constraints

alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

-- business may have been nullable before
update public.leads set business = '' where business is null;
alter table public.leads
  alter column business set not null;

-- Re-apply policies (safe if schema.sql was partially run)
alter table public.leads enable row level security;

drop policy if exists "Public insert" on public.leads;
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads for insert to anon, authenticated with check (true);

drop policy if exists "Admin read" on public.leads;
drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select"
  on public.leads for select to authenticated
  using (auth.role() = 'authenticated');
