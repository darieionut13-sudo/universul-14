-- Rulează integral în Supabase > SQL Editor.
-- Schimbă codul din INSERT și folosește același eventId în config.js.
begin;
create table if not exists public.universe_events (
  slug text primary key,
  accepting boolean not null default true,
  max_stars integer not null default 200 check (max_stars between 1 and 500)
);
create table if not exists public.universe_stars (
  event_slug text not null references public.universe_events(slug),
  id uuid not null,
  name text not null check (char_length(name) between 1 and 40 and btrim(name) <> ''),
  color text not null check (color in ('#f7d58b','#82e1d1','#c2a8f5','#f4a9c0','#a1c8ff')),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  primary key (event_slug,id)
);
alter table public.universe_events enable row level security;
alter table public.universe_stars enable row level security;
revoke all on table public.universe_events, public.universe_stars from anon, authenticated;

create or replace function public.universe_list(p_event text)
returns table(id uuid, name text, color text, answers jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.universe_events where slug=p_event) then
    raise exception 'Eveniment inexistent';
  end if;
  return query select s.id,s.name,s.color,s.answers from public.universe_stars s
    where s.event_slug=p_event order by s.created_at,s.id;
end;
$$;

create or replace function public.universe_add(p_event text,p_id uuid,p_name text,p_color text,p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare ev public.universe_events%rowtype; a jsonb; has_answer boolean := false;
begin
  -- Lock-ul împiedică depășirea limitei la trimiteri simultane.
  select * into ev from public.universe_events where slug=p_event for update;
  if not found then raise exception 'Eveniment inexistent'; end if;
  -- Aceeași cerere poate fi retrimisă după pierderea conexiunii, fără dubluri.
  if exists(select 1 from public.universe_stars where event_slug=p_event and id=p_id) then
    return jsonb_build_object('ok',true);
  end if;
  if not ev.accepting then raise exception 'Primirea mesajelor este închisă'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 40 then raise exception 'Nume invalid'; end if;
  if p_color is null or p_color not in ('#f7d58b','#82e1d1','#c2a8f5','#f4a9c0','#a1c8ff') then raise exception 'Culoare invalidă'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then raise exception 'Răspunsuri invalide'; end if;
  if jsonb_array_length(p_answers) <> 5 then raise exception 'Sunt necesare cinci poziții'; end if;
  for a in select value from jsonb_array_elements(p_answers) loop
    if jsonb_typeof(a) <> 'string' or char_length(a #>> '{}') > 500 then raise exception 'Răspuns invalid'; end if;
    if btrim(a #>> '{}') <> '' then has_answer := true; end if;
  end loop;
  if not has_answer then raise exception 'Cel puțin un răspuns este necesar'; end if;
  if (select count(*) from public.universe_stars where event_slug=p_event) >= ev.max_stars then raise exception 'Limita de stele a fost atinsă'; end if;
  insert into public.universe_stars(event_slug,id,name,color,answers) values(p_event,p_id,btrim(p_name),p_color,p_answers);
  return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.universe_list(text) from public, anon, authenticated;
revoke all on function public.universe_add(text,uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.universe_list(text) to anon;
grant execute on function public.universe_add(text,uuid,text,text,jsonb) to anon;
insert into public.universe_events(slug) values ('universul-14-schimba-acest-cod') on conflict do nothing;
commit;

-- După petrecere: închide trimiterile, dar păstrează citirea mesajelor:
-- update public.universe_events set accepting=false where slug='CODUL-TAU';
-- Elimină o contribuție, exclusiv din SQL Editor:
-- delete from public.universe_stars where event_slug='CODUL-TAU' and id='UUID-UL-STELEI';
