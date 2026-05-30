-- Allow voice/chat lead rows to be updated by the public API key (agent session sync).
-- Prefer SUPABASE_SERVICE_ROLE_KEY on the server when available.

drop policy if exists "leads_agent_update" on public.leads;
create policy "leads_agent_update"
  on public.leads
  for update
  to anon, authenticated
  using (source in ('voice', 'chat'))
  with check (source in ('voice', 'chat'));

grant update on public.leads to anon, authenticated;
