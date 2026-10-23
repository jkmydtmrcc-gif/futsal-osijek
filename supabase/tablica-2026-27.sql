-- ═════════════════════════════════════════════════════════════
-- TABLICA LIGE — JEDNOKRATNI UPIS (stanje nakon 3. kola)
-- ═════════════════════════════════════════════════════════════
--
-- Ovo NIJE dio `schema.sql`. Pokreće se jednom, u Supabase → SQL Editor, kad
-- želiš da se u bazi tablica zamijeni ovom s deset klubova.
--
-- Prije ovoga pokreni `schema.sql` (treba stupac `form`).
--
-- Zašto zasebno: `schema.sql` se lijepi cijel i više puta, a ovo BRIŠE sve
-- retke tablice i upisuje ih ispočetka. Pokreni samo ako želiš baš to.
-- Grbovi upisani u administraciji brišu se zajedno s retcima: grb Osijeka se
-- vraća na kraju, a ostalim klubovima ga ponovno upiši.
--
-- `form` je zadnjih pet ishoda, najstariji prvi: P pobjeda · N neriješeno ·
-- I izgubljeno. Gol-razlika se ne sprema — računa se iz golova.

begin;

alter table tablica add column if not exists form text not null default '';

delete from tablica;

insert into tablica (pos, club, played, wins, draws, losses, goals_for, goals_against, points, form)
values
  ( 1, 'Olmissum',      3, 2, 1, 0, 14,  6, 7, 'PPN'),
  ( 2, 'Square',        3, 2, 1, 0, 16, 10, 7, 'PPN'),
  ( 3, 'Osijek Kandit', 3, 2, 0, 1, 16, 10, 6, 'PPI'),
  ( 4, 'Rijeka',        3, 2, 0, 1, 15, 11, 6, 'PIP'),
  ( 5, 'Futsal Pula',   3, 2, 0, 1,  7, 10, 6, 'PPI'),
  ( 6, 'Dinamo',        3, 1, 1, 1,  7,  5, 4, 'IPN'),
  ( 7, 'Crnica',        3, 1, 0, 2,  9,  8, 3, 'IIP'),
  ( 8, 'Novo Vrijeme',  3, 1, 0, 2, 12, 17, 3, 'IIP'),
  ( 9, 'Hajduk',        3, 0, 1, 2,  8, 12, 1, 'IIN'),
  (10, 'Torcida',       3, 0, 0, 3,  2, 17, 0, 'III');

update tablica set logo = '/uploads/images.jpeg' where club = 'Osijek Kandit';

commit;
