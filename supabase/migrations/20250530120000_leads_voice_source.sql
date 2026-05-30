-- Allow voice-agent (Neha) leads in source check
alter table public.leads drop constraint if exists leads_source_check;

alter table public.leads add constraint leads_source_check check (
  source in ('website', 'chat', 'whatsapp', 'voice')
);

comment on column public.leads.source is 'website | chat | whatsapp | voice';
