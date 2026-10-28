-- Praz owner suite and client dashboard data.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to re-run.
--
-- Clients never write these tables directly: the site's server routes read and
-- write them with the secret key after checking who is signed in. Row level
-- security is on with no policies, so the public (publishable) key can't read them.

create table if not exists public.daily_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  sent integer not null default 0,
  replies integer not null default 0,
  positive integer not null default 0,
  calls integer not null default 0,
  answered integer not null default 0,
  meetings integer not null default 0,
  primary key (user_id, day)
);

create table if not exists public.positive_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  title text,
  company text,
  message text not null,
  received_at timestamptz not null default now()
);

create table if not exists public.tracked_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  from_number text not null,
  location text,
  called_at timestamptz not null default now(),
  duration_seconds integer,
  status text not null default 'Answered' check (status in ('Answered', 'Missed', 'Voicemail'))
);

create table if not exists public.client_meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company text,
  starts_at timestamptz not null
);

-- Per-client settings shown on their dashboard.
create table if not exists public.client_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  operator_name text,
  operator_note text,
  campaign_live boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Two-way messages between a client and their operator.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sender text not null check (sender in ('client', 'operator')),
  body text not null,
  created_at timestamptz not null default now(),
  read_by_owner boolean not null default false
);

-- Activity log: sign-ups, payments, plan changes, cancellations, setup edits, inbound email.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists positive_replies_user on public.positive_replies (user_id, received_at desc);
create index if not exists tracked_calls_user on public.tracked_calls (user_id, called_at desc);
create index if not exists client_meetings_user on public.client_meetings (user_id, starts_at);
create index if not exists messages_user on public.messages (user_id, created_at);
create index if not exists events_created on public.events (created_at desc);
create index if not exists events_email on public.events (email);

alter table public.daily_stats enable row level security;
alter table public.positive_replies enable row level security;
alter table public.tracked_calls enable row level security;
alter table public.client_meetings enable row level security;
alter table public.client_settings enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
