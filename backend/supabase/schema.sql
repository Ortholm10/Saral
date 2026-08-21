-- Saral database schema.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.

-- ---------------------------------------------------------------------------
-- profiles: language and accessibility preferences, keyed by a device id the
-- frontend generates. Saral has no login - asking someone who cannot read to
-- type a password would defeat the point of the app.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
    user_id       text primary key,
    display_name  text,
    language      text        not null default 'Kannada',
    language_code text        not null default 'kn',
    accessibility jsonb       not null default '{
        "speech_rate": 1.0,
        "voice_guidance": true,
        "high_contrast": false,
        "large_text": false
    }'::jsonb,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- document_history: one row per completed form, with the answers the user gave.
-- Answers are stored in English so a later form can be pre-filled from them.
-- ---------------------------------------------------------------------------
create table if not exists public.document_history (
    id              uuid        primary key default gen_random_uuid(),
    user_id         text        not null,
    title           text,
    original_text   text        not null,
    simplified_text text,
    language        text,
    answers         jsonb       not null default '{}'::jsonb,
    created_at      timestamptz not null default now()
);

create index if not exists document_history_user_created_idx
    on public.document_history (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security.
--
-- These tables are reached only through this backend, which authenticates with
-- the service role key and therefore bypasses RLS. RLS is still enabled so that
-- if the anon key is ever used from the browser by mistake, the tables are not
-- world-readable: with RLS on and no permissive policy, anon gets nothing.
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.document_history enable row level security;
