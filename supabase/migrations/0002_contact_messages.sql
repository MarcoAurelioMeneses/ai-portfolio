-- Messages sent from the public contact form.
-- The API inserts with the service role. A separate worker reads status = 'new',
-- emails Marco, then sets status = 'forwarded' and forwarded_at.
-- No IP address is stored. RLS is on and there are no policies for anon or authenticated.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'forwarded', 'spam')),
  forwarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;

-- The forwarder lists status = 'new' ordered by created_at.
create index if not exists contact_messages_status_created_at_idx
  on public.contact_messages (status, created_at);
