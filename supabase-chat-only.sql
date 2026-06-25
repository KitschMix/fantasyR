create extension if not exists pgcrypto;

create table if not exists public.fantasy_lobby_chat (
  id uuid primary key default gen_random_uuid(),
  player_token text not null,
  nickname text not null check (char_length(nickname) between 2 and 12 and nickname <> '나'),
  message text not null check (char_length(trim(message)) between 1 and 80),
  created_at timestamptz not null default now()
);

create index if not exists fantasy_lobby_chat_created_at_idx
  on public.fantasy_lobby_chat(created_at desc);

alter table public.fantasy_lobby_chat enable row level security;

drop policy if exists "lobby chat public read" on public.fantasy_lobby_chat;
drop policy if exists "lobby chat public insert" on public.fantasy_lobby_chat;
drop policy if exists "lobby chat public delete expired" on public.fantasy_lobby_chat;

create policy "lobby chat public read"
  on public.fantasy_lobby_chat
  for select
  using (true);

create policy "lobby chat public insert"
  on public.fantasy_lobby_chat
  for insert
  with check (
    char_length(nickname) between 2 and 12
    and nickname <> '나'
    and char_length(trim(message)) between 1 and 80
  );

create policy "lobby chat public delete expired"
  on public.fantasy_lobby_chat
  for delete
  using (created_at < now() - interval '30 seconds');

grant usage on schema public to anon;
grant select, insert, delete on public.fantasy_lobby_chat to anon;

do $$
begin
  alter publication supabase_realtime add table public.fantasy_lobby_chat;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
