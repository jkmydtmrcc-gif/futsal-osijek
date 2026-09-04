-- MNK Osijek Kandit — shema baze
-- Pokreni jednom u Supabase → SQL Editor → New query → Run.

-- ─────────────────────────────────────────────────────────────
-- 1. Tablice
-- ─────────────────────────────────────────────────────────────

create table if not exists igraci (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null default 0,
  name        text not null,
  number      int  not null,
  pos         text not null default 'Igrač u polju',
  note        text not null default '',
  photo       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists novosti (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null default 0,
  date        text not null,
  cat         text not null default '',
  title       text not null,
  lead        text not null default '',
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists utakmice (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null default 0,
  "when"      text not null,
  comp        text not null default '',
  title       text not null,
  venue       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists tablica (
  id          uuid primary key default gen_random_uuid(),
  pos         int  not null,
  club        text not null,
  played      int  not null default 0,
  points      int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists shop (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null default 0,
  name        text not null,
  price       text not null default '',
  image       text not null default '',
  href        text not null default '',
  badge       text not null default '',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. Pristup
-- Stranicu čita svatko; mijenjati smije samo prijavljeni korisnik.
-- ─────────────────────────────────────────────────────────────

alter table igraci   enable row level security;
alter table novosti  enable row level security;
alter table utakmice enable row level security;
alter table tablica  enable row level security;
alter table shop     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['igraci','novosti','utakmice','tablica','shop'] loop
    execute format('drop policy if exists "javno citanje" on %I', t);
    execute format('drop policy if exists "uredjivanje za prijavljene" on %I', t);

    execute format(
      'create policy "javno citanje" on %I for select using (true)', t);

    execute format(
      'create policy "uredjivanje za prijavljene" on %I for all
         to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2b. Spremište za slike artikala
-- Slike su javne (moraju se vidjeti na stranici), ubacivati ih smije
-- samo prijavljeni korisnik.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('shop', 'shop', true)
on conflict (id) do nothing;

drop policy if exists "shop slike javno citanje"   on storage.objects;
drop policy if exists "shop slike upload"          on storage.objects;
drop policy if exists "shop slike izmjena"         on storage.objects;
drop policy if exists "shop slike brisanje"        on storage.objects;

create policy "shop slike javno citanje" on storage.objects
  for select using (bucket_id = 'shop');

create policy "shop slike upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'shop');

create policy "shop slike izmjena" on storage.objects
  for update to authenticated using (bucket_id = 'shop');

create policy "shop slike brisanje" on storage.objects
  for delete to authenticated using (bucket_id = 'shop');

-- ─────────────────────────────────────────────────────────────
-- 3. Početni sadržaj — isto što je sada na stranici
--
-- Upisuje se samo u praznu tablicu, pa se cijela datoteka može
-- pokrenuti ponovno bez straha da će sadržaj biti udvostručen.
-- ─────────────────────────────────────────────────────────────

insert into igraci (sort_order, name, number, pos, note, photo)
select * from (values
  (1, 'Franko Jamičić',    1,  'Vratar',        'Hrvatska',  '/uploads/igraci/franko-jamicic.webp'),
  (2, 'Andrej Pandurević', 8,  'Kapetan',       'Hrvatska',  '/uploads/igraci/andrej-pandurevic.webp'),
  (3, 'Filip Petrušić',    19, 'Igrač u polju', 'Hrvatska',  '/uploads/igraci/filip-petrusic.webp'),
  (4, 'Josip Šalaj',       7,  'Igrač u polju', 'Hrvatska',  '/uploads/igraci/josip-salaj.webp'),
  (5, 'Nejc Hozjan',       77, 'Igrač u polju', 'Slovenija', '/uploads/igraci/nejc-hozjan.webp'),
  (6, 'Matias Mijić',      4,  'Igrač u polju', 'Hrvatska',  '/uploads/igraci/matias-mijic.webp'),
  (7, 'Antonio Sekulić',   23, 'Igrač u polju', 'Hrvatska',  '/uploads/igraci/antonio-sekulic.webp')
) as v(sort_order, name, number, pos, note, photo)
where not exists (select 1 from igraci);

insert into novosti (sort_order, date, cat, title, lead, featured)
select * from (values
  (0, 'Sezona 2024/25', 'Doigravanje', 'Finale doigravanja nakon pobjede protiv Futsal Dinama',
      'U sezoni 2024/25 klub je do prvog finala došao preko Torcide Biberon u četvrtfinalu i Futsal Dinama u polufinalu.', true),
  (1, 'Sezona 2025/26', 'Liga', 'Drugo mjesto regularnog dijela HMNL-a',
      'Momčad je ligaški dio završila druga, a doigravanje napustila u četvrtfinalu.', false),
  (2, 'Sezona 2024/25', 'Doigravanje', 'Finale nakon pobjeda protiv Torcide i Dinama',
      'U finalnoj seriji naslov je osvojilo Novo vrijeme Makarska.', false)
) as v(sort_order, date, cat, title, lead, featured)
where not exists (select 1 from novosti);

insert into utakmice (sort_order, "when", comp, title, venue)
select * from (values
  (1, 'Sub 17.10.', 'HMNL · 7. kolo', 'Osijek Kandit — Futsal Dinamo', 'Športska dvorana Zrinjevac'),
  (2, 'Sub 24.10.', 'HMNL · 8. kolo', 'Olmissum — Osijek Kandit',      'Dvorana Ribnjak, Omiš'),
  (3, 'Sri 28.10.', 'Hrvatski kup',   'Osijek Kandit — Crnica',        'Športska dvorana Zrinjevac')
) as v(sort_order, "when", comp, title, venue)
where not exists (select 1 from utakmice);

insert into tablica (pos, club, played, points)
select * from (values
  (1, 'Olmissum', 6, 16), (2, 'Osijek Kandit', 6, 13), (3, 'Futsal Dinamo', 6, 12),
  (4, 'Rijeka', 6, 11),   (5, 'Novo vrijeme', 6, 9),   (6, 'Torcida Biberon', 6, 7),
  (7, 'Square', 6, 6),    (8, 'Crnica', 6, 4),         (9, 'Vrgorac', 6, 2)
) as v(pos, club, played, points)
where not exists (select 1 from tablica);

insert into shop (sort_order, name, price, image, href, badge)
select * from (values
  (1, 'Futsal lopta', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/lopte/futsal-lopte/', ''),
  (2, 'Dresovi i tekstil', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/tekstil/', ''),
  (3, 'Golmanska oprema', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/oprema/golmanska-oprema/', '')
) as v(sort_order, name, price, image, href, badge)
where not exists (select 1 from shop);
