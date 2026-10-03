-- ═════════════════════════════════════════════════════════════
--  MNK Osijek Kandit — shema baze
--
--  ZALIJEPI CIJELU DATOTEKU, OD OVOG PRVOG RETKA.
--
--  Supabase → SQL Editor → New query → zalijepi sve → Run.
--  Na GitHubu klikni „Raw“, pa Ctrl+A i Ctrl+C — tako se ne može
--  slučajno uhvatiti samo dio.
--
--  Smije se pokrenuti više puta: dodaje što nedostaje, postojeće
--  podatke ne dira.
-- ═════════════════════════════════════════════════════════════

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

-- Provjera: postoje li tablice iz 1. dijela?
do $$
begin
  if to_regclass('public.igraci') is null then
    raise exception
      'Tablice ne postoje. Najčešći uzrok: zalijepljen je samo dio datoteke. Kopiraj schema.sql od prvog retka (na GitHubu: Raw → Ctrl+A → Ctrl+C) i pokreni ponovno.';
  end if;
end $$;

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

-- Provjera: postoje li tablice iz 1. dijela?
do $$
begin
  if to_regclass('public.igraci') is null then
    raise exception
      'Tablice ne postoje. Najčešći uzrok: zalijepljen je samo dio datoteke. Kopiraj schema.sql od prvog retka (na GitHubu: Raw → Ctrl+A → Ctrl+C) i pokreni ponovno.';
  end if;
end $$;

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

-- Ogledna tablica se puni na kraju datoteke (odsječak 6), jer traži stupce
-- koje tek tamo dobiva.

insert into shop (sort_order, name, price, image, href, badge)
select * from (values
  (1, 'Futsal lopta', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/lopte/futsal-lopte/', ''),
  (2, 'Dresovi i tekstil', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/tekstil/', ''),
  (3, 'Golmanska oprema', 'Cijena u trgovini', '', 'https://salasport.hr/kategorija-proizvoda/oprema/golmanska-oprema/', '')
) as v(sort_order, name, price, image, href, badge)
where not exists (select 1 from shop);

-- ═════════════════════════════════════════════════════════════
-- 4. Nadogradnja: profili igrača, statistika, grbovi, sponzori,
--    postavke stranice
--
-- Sve je pisano tako da se datoteka smije pokrenuti ponovno na bazi
-- koja već postoji — postojeći podaci se ne diraju.
-- ═════════════════════════════════════════════════════════════

-- Provjera: postoje li tablice iz 1. dijela?
do $$
begin
  if to_regclass('public.igraci') is null then
    raise exception
      'Tablice ne postoje. Najčešći uzrok: zalijepljen je samo dio datoteke. Kopiraj schema.sql od prvog retka (na GitHubu: Raw → Ctrl+A → Ctrl+C) i pokreni ponovno.';
  end if;
end $$;

-- 4.1 Profil igrača (prikazuje se u kartici koja se otvori klikom)
-- `from` je rezervirana riječ u SQL-u, pa stupac nosi ime `from_place`.
alter table igraci add column if not exists birth      text not null default '';
alter table igraci add column if not exists from_place text not null default '';
alter table igraci add column if not exists height     text not null default '';
alter table igraci add column if not exists foot       text not null default '';
alter table igraci add column if not exists joined     text not null default '';

-- 4.2 Statistika igrača po sezoni i natjecanju
create table if not exists igraci_statistika (
  id          uuid primary key default gen_random_uuid(),
  igrac_id    uuid not null references igraci(id) on delete cascade,
  sort_order  int  not null default 0,
  season      text not null default '',
  comp        text not null default 'SuperSport HMNL',
  games       int  not null default 0,
  goals       int  not null default 0,
  penalties   int  not null default 0,
  own_goals   int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists igraci_statistika_igrac on igraci_statistika(igrac_id);

-- 4.3 Grb kluba u tablici
alter table tablica add column if not exists logo text not null default '';

-- 4.4 Novosti: vlastita stranica i fotografija
-- `slug` je adresa objave (/novosti/oznaka); prazan znači da se koristi id.
alter table novosti add column if not exists slug  text not null default '';
alter table novosti add column if not exists image text not null default '';
alter table novosti add column if not exists body  text not null default '';

-- 4.5 Artikli Fan Shopa: kategorija, marka, opis, stara cijena, crtež
alter table shop add column if not exists cat       text not null default '';
alter table shop add column if not exists brand     text not null default '';
alter table shop add column if not exists note      text not null default '';
alter table shop add column if not exists old_price text not null default '';
alter table shop add column if not exists art       text not null default 'dres';

-- 4.6 Sponzori u razinama (glavni / gold / podupiratelji)
create table if not exists sponzori (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null default 0,
  tier        text not null default 'gold',
  tag         text not null default 'Gold sponzori',
  size        text not null default 'md',
  name        text not null default '',
  logo        text not null default '',
  href        text not null default '',
  note        text not null default '',
  rotate      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Razine dodane kasnije: stupac se dodaje i na postojeću bazu.
alter table sponzori add column if not exists rotate boolean not null default false;

-- 4.7 Postavke — ono čega ima po jedan komad
--
-- Kontakt, karta, tekstovi stranica, brojke i slično. Vrijednost je JSON i
-- spaja se preko ugrađenog sadržaja, pa nepopunjena rubrika zadrži tekst iz
-- koda umjesto da ostane prazna. Bez ovoga bi svaka nova rubrika tražila
-- novu tablicu i novu migraciju.
create table if not exists postavke (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4.8 Pristup za nove tablice: čita svatko, mijenja samo prijavljeni
alter table igraci_statistika enable row level security;
alter table sponzori          enable row level security;
alter table postavke          enable row level security;

do $$
declare t text;
begin
  foreach t in array array['igraci_statistika','sponzori','postavke'] loop
    execute format('drop policy if exists "javno citanje" on %I', t);
    execute format('drop policy if exists "uredjivanje za prijavljene" on %I', t);

    execute format('create policy "javno citanje" on %I for select using (true)', t);
    execute format(
      'create policy "uredjivanje za prijavljene" on %I for all
         to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- 4.9 Početni sponzori — samo stvarni, bez rezerviranih mjesta
insert into sponzori (sort_order, tier, tag, size, name, logo, href, note, rotate)
select * from (values
  (1, 'glavni', 'Glavni sponzori', 'lg', 'Kandit', '/uploads/kandit-logo.png',
      'https://www.kandit.hr/', 'Naziv sponzor kluba', false)
) as v(sort_order, tier, tag, size, name, logo, href, note, rotate)
where not exists (select 1 from sponzori);

-- 4.10 Grb Osijeka u tablici (ostali klubovi pokazuju inicijale dok se
--      grb ne upiše — tuđi grbovi nisu klupsko vlasništvo)
update tablica set logo = '/uploads/images.jpeg'
where club = 'Osijek Kandit' and coalesce(logo, '') = '';

-- ─────────────────────────────────────────────────────────────
-- 5. Utakmica kao pravi zapis
--
-- Do sada je utakmica bila natpis: `when` slobodan tekst („Sub 17.10.")
-- i `title` jedan niz („Osijek Kandit — Futsal Dinamo"). Iz natpisa se ne
-- da izvesti ni sljedeća utakmica, ni podjela na odigrano i nadolazeće,
-- ni forma, ni rezultat.
--
-- Stari stupci ostaju i dalje rade: dok je `kickoff` prazan, stranica
-- prikazuje redak točno kao prije.
-- ─────────────────────────────────────────────────────────────

do $$
begin
  if to_regclass('public.utakmice') is null then
    raise exception
      'Tablice ne postoje. Najčešći uzrok: zalijepljen je samo dio datoteke. Kopiraj schema.sql od prvog retka (na GitHubu: Raw → Ctrl+A → Ctrl+C) i pokreni ponovno.';
  end if;
end $$;

-- 5.1 Termin, momčadi i rezultat
-- `kickoff` namjerno nema zadanu vrijednost: prazno znači „stari tekstualni
-- redak", a to je točno signal koji stranici treba.
alter table utakmice add column if not exists kickoff    timestamptz;
alter table utakmice add column if not exists home       text not null default '';
alter table utakmice add column if not exists away       text not null default '';
-- Rezultat smije biti prazan. `null` nije `0` — 0:0 je rezultat.
alter table utakmice add column if not exists home_score int;
alter table utakmice add column if not exists away_score int;
alter table utakmice add column if not exists status     text not null default '';
alter table utakmice add column if not exists round      text not null default '';
alter table utakmice add column if not exists season     text not null default '';
alter table utakmice add column if not exists slug       text not null default '';

create index if not exists utakmice_kickoff on utakmice(kickoff);

-- 5.2 Strijelci
-- `igrac_id` veže gol uz našeg igrača; `ime` pokriva protivničke strijelce,
-- kojih nema u tablici `igraci`.
create table if not exists strijelci (
  id          uuid primary key default gen_random_uuid(),
  utakmica_id uuid not null references utakmice(id) on delete cascade,
  igrac_id    uuid references igraci(id) on delete set null,
  ime         text not null default '',
  minuta      int,
  vrsta       text not null default 'gol',   -- gol | penal | autogol
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists strijelci_utakmica on strijelci(utakmica_id);

-- 5.3 Pristup: čita svatko, mijenja samo prijavljeni
alter table strijelci enable row level security;

do $$
begin
  drop policy if exists "javno citanje" on strijelci;
  drop policy if exists "uredjivanje za prijavljene" on strijelci;

  create policy "javno citanje" on strijelci for select using (true);
  create policy "uredjivanje za prijavljene" on strijelci for all
    to authenticated using (true) with check (true);
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. TABLICA LIGE: PUNI REDAK                      (dodano 2026)
-- ─────────────────────────────────────────────────────────────
-- Redak je imao mjesto, klub, odigrano i bodove. Nijedna futsal tablica u
-- Hrvatskoj ne izgleda tako — standardni redak je Ut · P · N · I · G+ · G− ·
-- GR · Bod. Gol-razlika se namjerno **ne** sprema: računa se iz golova, pa ne
-- može proturječiti retku u kojem stoji.
--
-- Sve ima zadanu nulu, pa stari redci ostanu ispravni. Dok su nule, stranica
-- prikazuje točno današnju tablicu od četiri stupca.

alter table tablica add column if not exists wins          int not null default 0;
alter table tablica add column if not exists draws         int not null default 0;
alter table tablica add column if not exists losses        int not null default 0;
alter table tablica add column if not exists goals_for     int not null default 0;
alter table tablica add column if not exists goals_against int not null default 0;

-- Datum ažuriranja stoji ispod tablice, uz naveden izvor. Vodi se sam, jer
-- datum koji se upisuje ručno prije ili kasnije ostane lanjski — a tablica s
-- krivim datumom gora je od tablice bez datuma.
alter table tablica add column if not exists updated_at timestamptz not null default now();

create or replace function dodirni_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tablica_updated_at on tablica;
create trigger tablica_updated_at
  before update on tablica
  for each row execute function dodirni_updated_at();

-- 6.1 Ogledna tablica za praznu bazu
-- Brojke su izmišljene, ali su **složne**: P+N+I daje odigrano, 3·P+N daje
-- bodove, a zbroj danih golova jednak je zbroju primljenih. Neskladan primjer
-- bi odmah pao na provjeri u administraciji i izgledao kao greška umjesto kao
-- primjer.
--
-- Upis stoji ovdje, a ne uz ostale ogledne podatke gore, jer traži stupce koje
-- dobiva tek nekoliko redaka iznad. `where not exists` znači da postojeća baza
-- ostaje netaknuta — ovo je samo za prvo pokretanje.
insert into tablica (pos, club, played, wins, draws, losses, goals_for, goals_against, points)
select * from (values
  (1, 'Olmissum',        6, 5, 1, 0, 34, 14, 16),
  (2, 'Osijek Kandit',   6, 4, 2, 0, 31, 17, 14),
  (3, 'Futsal Dinamo',   6, 4, 0, 2, 28, 20, 12),
  (4, 'Rijeka',          6, 3, 1, 2, 24, 21, 10),
  (5, 'Novo vrijeme',    6, 2, 2, 2, 22, 22,  8),
  (6, 'Torcida Biberon', 6, 2, 1, 3, 20, 24,  7),
  (7, 'Square',          6, 2, 0, 4, 19, 27,  6),
  (8, 'Crnica',          6, 1, 0, 5, 15, 32,  3),
  (9, 'Vrgorac',         6, 0, 1, 5, 12, 28,  1)
) as v(pos, club, played, wins, draws, losses, goals_for, goals_against, points)
where not exists (select 1 from tablica);

-- ─────────────────────────────────────────────────────────────
-- 7. PRIJENOS UŽIVO                                (dodano 2026)
-- ─────────────────────────────────────────────────────────────
-- Klub odigra utakmicu, a stranica za to vrijeme šuti — rezultat se pojavi
-- tek kad ga netko poslije upiše. Ove dvije tablice su sve što treba da
-- navijač prati utakmicu dok traje.
--
-- Rezultat se namjerno **ne** sprema ovdje: računa se iz golova u `dogadaji`,
-- pa semafor ne može proturječiti tijeku ispod sebe. U `utakmice` se upiše
-- tek na kraju, kad je konačan.

-- 7.1 Tijek utakmice
create table if not exists dogadaji (
  id          uuid primary key default gen_random_uuid(),
  utakmica_id uuid not null references utakmice(id) on delete cascade,
  minuta      int,
  poluvrijeme int  not null default 1,
  -- pocetak | gol | autogol | deseterac | zuti | crveni | timeout
  -- | kraj_pol | kraj | komentar
  vrsta       text not null default 'komentar',
  nasa        boolean not null default true,   -- naša momčad ili protivnik
  igrac_id    uuid references igraci(id) on delete set null,
  ime         text not null default '',        -- protivnički igrač
  tekst       text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists dogadaji_utakmica on dogadaji(utakmica_id);

-- 7.2 Postave
-- `pocetna` razdvaja početnu petorku od klupe. Naši igrači se vežu po
-- `igrac_id`, protivnici se upisuju imenom — njih u bazi nema i nema razloga
-- da ih bude.
create table if not exists postave (
  id          uuid primary key default gen_random_uuid(),
  utakmica_id uuid not null references utakmice(id) on delete cascade,
  nasa        boolean not null default true,
  igrac_id    uuid references igraci(id) on delete set null,
  ime         text not null default '',
  broj        int,
  pocetna     boolean not null default true,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists postave_utakmica on postave(utakmica_id);

-- 7.3 Pristup: čita svatko, mijenja samo prijavljeni
alter table dogadaji enable row level security;
alter table postave  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['dogadaji','postave'] loop
    execute format('drop policy if exists "javno citanje" on %I', t);
    execute format('drop policy if exists "uredjivanje za prijavljene" on %I', t);

    execute format(
      'create policy "javno citanje" on %I for select using (true)', t);

    execute format(
      'create policy "uredjivanje za prijavljene" on %I for all
         to authenticated using (true) with check (true)', t);
  end loop;
end $$;
