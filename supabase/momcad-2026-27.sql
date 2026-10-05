-- ═════════════════════════════════════════════════════════════
-- MOMČAD 2026/27 — JEDNOKRATNI UPIS
-- ═════════════════════════════════════════════════════════════
--
-- Ovo NIJE dio `schema.sql`. Pokreće se jednom, u Supabase → SQL Editor, kad
-- želiš da se u bazu upiše kadar iz tablice s brojevima dresova.
--
-- Zašto zasebno: `schema.sql` se lijepi cijel i više puta, a upis igrača koji
-- se ponavlja bi vratio svakoga koga si u međuvremenu obrisao. Ovdje je to
-- namjerno jednokratno.
--
-- Sigurno je pokrenuti i dvaput: igrač koji već postoji (po imenu ili po broju
-- dresa) se preskače, ne dupla.
--
-- Što je upisano:
--   • imena i brojeve iz tablice kadra,
--   • poziciju „Vratar" samo za Víctora Lópeza (mapa „Španjolac GOLMAN"),
--     svi ostali su „Igrač u polju" — promijeni u administraciji gdje treba,
--   • trenera Marko Perić bez broja.
--
-- Što NIJE upisano, jer se ne zna: puna imena (većina je samo prezime),
-- datumi rođenja, države i fotografije. Sve to se uređuje u administraciji
-- (Igrači), a fotografija se samo odabere — sama se smanji i izreže joj se
-- pozadina.
--
-- Veličine dresova i gaćica iz tablice namjerno NISU ovdje: to je klupska
-- oprema, ne podatak za javnu stranicu.

-- Bez ovoga trener ne može u tablicu (isto je i u schema.sql, odsječak 8).
alter table igraci alter column number drop not null;

-- Ako je prije ove verzije već pokrenuta ona s prethodnim trenerom, samo se
-- promijeni ime — red ostaje isti, pa se trener ne udvostruči. Ako nije,
-- ovo ne pogađa nijedan red.
update igraci set name = 'Marko Perić' where name = 'Carmine Tarantino';

insert into igraci (sort_order, name, number, pos, note, photo)
select v.sort_order, v.name, v.number, v.pos, v.note, v.photo
from (values
  (8,  'Víctor López',      33,       'Vratar',        'Španjolska', ''),
  (9,  'Suton',             88,       'Igrač u polju', '',           ''),
  (10, 'Trdin',             11,       'Igrač u polju', '',           ''),
  (11, 'Ronaldinho',        17,       'Igrač u polju', '',           ''),
  (12, 'Vitor Lima',        10,       'Igrač u polju', 'Brazil',     ''),
  (13, 'Yuri',              20,       'Igrač u polju', '',           ''),
  (14, 'Jurišić',           18,       'Igrač u polju', '',           ''),
  (15, 'Jakopec',           27,       'Igrač u polju', '',           ''),
  (16, 'Mioč',              40,       'Igrač u polju', '',           ''),
  (17, 'Marko Perić', null::int, 'Trener',        '',           '')
) as v(sort_order, name, number, pos, note, photo)
where not exists (
  select 1 from igraci i
  where lower(i.name) = lower(v.name)
     or (v.number is not null and i.number = v.number)
);

-- Pregled: što je sada u tablici.
select sort_order, number, name, pos from igraci order by sort_order;
