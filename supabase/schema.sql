-- =============================================================================
-- BrandCure — Supabase schema
-- Project: nmakvepkslzrejsnpmsy
-- Run in: https://supabase.com/dashboard/project/nmakvepkslzrejsnpmsy/sql/new
-- =============================================================================

-- Extensions (usually enabled by default on Supabase)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- LEADS (contact / audit form)
-- Matches: lib/validations.ts + POST /api/leads
-- -----------------------------------------------------------------------------

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  name        text not null,
  email       text not null,
  phone       text,
  business    text not null,
  challenge   text,

  source      text not null default 'website',
  status      text not null default 'new',

  constraint leads_email_not_empty check (length(trim(email)) > 0),
  constraint leads_name_not_empty check (length(trim(name)) > 0),
  constraint leads_business_not_empty check (length(trim(business)) > 0),
  constraint leads_source_check check (
    source in ('website', 'chat', 'whatsapp', 'voice')
  ),
  constraint leads_status_check check (
    status in ('new', 'contacted', 'qualified', 'closed')
  )
);

comment on table public.leads is 'Inbound leads from website form, chat, or WhatsApp';
comment on column public.leads.source is 'website | chat | whatsapp | voice';
comment on column public.leads.status is 'new | contacted | qualified | closed';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_status_idx on public.leads (status);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- CHAT SESSIONS (AI advisor — future /api/chat persistence)
-- -----------------------------------------------------------------------------

create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  messages    jsonb not null default '[]'::jsonb,
  lead_id     uuid references public.leads (id) on delete set null,

  constraint chat_sessions_messages_is_array check (jsonb_typeof(messages) = 'array')
);

comment on table public.chat_sessions is 'AI chat transcripts; messages: [{ "role": "user"|"assistant", "content": "..." }]';
comment on column public.chat_sessions.lead_id is 'Set when visitor email is captured and linked to a lead';

create index if not exists chat_sessions_lead_id_idx on public.chat_sessions (lead_id);
create index if not exists chat_sessions_created_at_idx on public.chat_sessions (created_at desc);

drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
  before update on public.chat_sessions
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

alter table public.leads enable row level security;
alter table public.chat_sessions enable row level security;

-- Leads: allow inserts from publishable (anon) key — required for contact form
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Leads: only logged-in admins can read (Supabase Auth)
drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select"
  on public.leads
  for select
  to authenticated
  using (auth.role() = 'authenticated');

-- Leads: admins can update status / notes later
drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update"
  on public.leads
  for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Leads: voice/chat agent can enrich the same row during a session (PATCH /api/leads)
drop policy if exists "leads_agent_update" on public.leads;
create policy "leads_agent_update"
  on public.leads
  for update
  to anon, authenticated
  using (source in ('voice', 'chat'))
  with check (source in ('voice', 'chat'));

-- Chat: no public access until /api/chat persists sessions
drop policy if exists "chat_sessions_admin_all" on public.chat_sessions;
create policy "chat_sessions_admin_all"
  on public.chat_sessions
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- GRANTS (Supabase API roles)
-- -----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on public.leads to anon, authenticated;
grant select, insert, update on public.leads to service_role;

grant select, insert, update, delete on public.chat_sessions to service_role;
grant all on public.chat_sessions to authenticated;

-- -----------------------------------------------------------------------------
-- CONTENT ENGAGEMENT (blog & portfolio likes + comments)
-- Also in: supabase/migrations/20250529120000_content_engagement.sql
-- -----------------------------------------------------------------------------

create table if not exists public.content_likes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  content_type text not null,
  content_id   text not null,
  visitor_id   text not null,
  constraint content_likes_type_check check (
    content_type in ('blog', 'portfolio')
  ),
  constraint content_likes_unique_visitor unique (content_type, content_id, visitor_id)
);

create index if not exists content_likes_lookup_idx
  on public.content_likes (content_type, content_id);

create table if not exists public.content_comments (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  content_type text not null,
  content_id   text not null,
  author_name  text not null,
  body         text not null,
  constraint content_comments_type_check check (
    content_type in ('blog', 'portfolio')
  ),
  constraint content_comments_author_not_empty check (length(trim(author_name)) > 0),
  constraint content_comments_body_not_empty check (length(trim(body)) > 0)
);

create index if not exists content_comments_lookup_idx
  on public.content_comments (content_type, content_id, created_at desc);

alter table public.content_likes enable row level security;
alter table public.content_comments enable row level security;

drop policy if exists "content_likes_public_select" on public.content_likes;
create policy "content_likes_public_select"
  on public.content_likes for select to anon, authenticated using (true);

drop policy if exists "content_comments_public_select" on public.content_comments;
create policy "content_comments_public_select"
  on public.content_comments for select to anon, authenticated using (true);

drop policy if exists "content_likes_public_insert" on public.content_likes;
create policy "content_likes_public_insert"
  on public.content_likes for insert to anon, authenticated with check (true);

drop policy if exists "content_comments_public_insert" on public.content_comments;
create policy "content_comments_public_insert"
  on public.content_comments for insert to anon, authenticated with check (true);

drop policy if exists "content_likes_public_delete_own" on public.content_likes;
create policy "content_likes_public_delete_own"
  on public.content_likes for delete to anon, authenticated using (true);

grant select, insert, delete on public.content_likes to anon, authenticated;
grant select, insert on public.content_comments to anon, authenticated;
grant all on public.content_likes to service_role;
grant all on public.content_comments to service_role;

-- -----------------------------------------------------------------------------
-- OPTIONAL: view for dashboard (run as admin in SQL editor)
-- -----------------------------------------------------------------------------
-- select id, created_at, name, email, phone, business, challenge, source, status
-- from public.leads
-- order by created_at desc;
