-- ═════════════════════════════════════════════════════════════
-- SPONZORI — TEHNIČKI SPONZOR I WEB PARTNER (jednokratni upis)
-- ═════════════════════════════════════════════════════════════
--
-- Pokreće se jednom, u Supabase → SQL Editor. Sigurno je pokrenuti i
-- dvaput: sponzor koji već postoji (po imenu) se preskače.
--
-- Na stranici se razine same slažu: glavni → gold → tehnički sponzor →
-- podupiratelji → web partner. Logotipi su već na stranici
-- (`/uploads/salasport-logo.png`, `/uploads/flomis-logo.png`).

insert into sponzori (sort_order, tier, tag, size, name, logo, href, note, rotate)
select 50, 'tehnicki', 'Tehnički sponzor', 'md', 'Sala Sport',
       '/uploads/salasport-logo.png', 'https://salasport.hr/', '', false
where not exists (select 1 from sponzori where lower(name) = 'sala sport');

insert into sponzori (sort_order, tier, tag, size, name, logo, href, note, rotate)
select 90, 'web', 'Web partner', 'sm', 'Flomis',
       '/uploads/flomis-logo.png', 'https://www.flomis.hr/', '', false
where not exists (select 1 from sponzori where lower(name) = 'flomis');
