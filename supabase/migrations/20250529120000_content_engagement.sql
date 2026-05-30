-- Blog & portfolio likes + comments (Sanity content_id = Sanity document _id)

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

-- Public read for counts / comment lists
drop policy if exists "content_likes_public_select" on public.content_likes;
create policy "content_likes_public_select"
  on public.content_likes for select to anon, authenticated using (true);

drop policy if exists "content_comments_public_select" on public.content_comments;
create policy "content_comments_public_select"
  on public.content_comments for select to anon, authenticated using (true);

-- Public insert (API also uses service role)
drop policy if exists "content_likes_public_insert" on public.content_likes;
create policy "content_likes_public_insert"
  on public.content_likes for insert to anon, authenticated with check (true);

drop policy if exists "content_comments_public_insert" on public.content_comments;
create policy "content_comments_public_insert"
  on public.content_comments for insert to anon, authenticated with check (true);

-- Allow users to remove their own like (toggle off)
drop policy if exists "content_likes_public_delete_own" on public.content_likes;
create policy "content_likes_public_delete_own"
  on public.content_likes for delete to anon, authenticated
  using (true);

grant select, insert, delete on public.content_likes to anon, authenticated;
grant select, insert on public.content_comments to anon, authenticated;
grant all on public.content_likes to service_role;
grant all on public.content_comments to service_role;
