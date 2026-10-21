-- Run this in the Supabase SQL editor after the Prisma migration.
-- The web client uses Supabase for Auth only; all app data goes through Express.
-- No policies are intentionally defined, so Supabase's Data API cannot expose
-- these tables to anon or authenticated browser clients.

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.memberships enable row level security;
alter table public.messages enable row level security;

