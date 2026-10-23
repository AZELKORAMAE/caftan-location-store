-- =====================================================================
--  DAR LALLA — Catalogue de démonstration (collections + tenues fictives)
--  À exécuter APRÈS schema.sql. Fichier généré par scripts/generate-seed.mjs
-- =====================================================================

insert into public.collections (name, slug, description, image_url, is_featured, sort_order, requires_size) values
  ('Caftans', 'caftans', 'Le caftan d''une seule pièce, en velours, brocart ou mousseline, brodé au fil d''or : l''élégance pour toutes les fêtes.', '/images/tenues/green-1.jpg', true, 1, true),
  ('Takchitas', 'takchitas', 'Deux pièces superposées et une ceinture ciselée : la takchita sublime les grandes soirées, du henné au mariage.', '/images/tenues/gold-1.jpg', true, 2, true),
  ('Tenues de mariée', 'mariee', 'Lebsa fassia, takchitas royales et caftans de négafa : des tenues d''exception pour chacun de vos passages.', '/images/tenues/emerald-1.jpg', true, 3, true),
  ('Djellabas de fête', 'djellabas', 'Djellabas brodées et légères pour l''Aïd, l''aqiqa et les soirées en famille.', '/images/tenues/sky-1.jpg', true, 4, true)
on conflict (slug) do nothing;

insert into public.products (name, slug, description, details, price, compare_at_price, deposit, category, material, collection_id, images, stock, is_featured, is_new, free_shipping, created_at) values
  ('Caftan Yasmine', 'caftan-yasmine-brocart-vert', 'Un caftan en brocart vert tissé de fleurs dorées, ouvert sur une sfifa or qui descend jusqu''à l''ourlet. Majestueux et lumineux.', 'Brocart vert et fil doré
Sfifa et aâkad dorés faits main
Manches longues en organza
Tailles disponibles : S à XL
Diadème assorti en option', 900, null, 1500, 'caftan', 'Brocart vert émeraude, sfifa dorée', (select id from public.collections where slug = 'caftans'), array['/images/tenues/green-1.jpg', '/images/tenues/green-2.jpg', '/images/tenues/green-3.jpg']::text[], 2, true, false, true, now() - interval '35 days'),
  ('Caftan Lina', 'caftan-lina-velours-grenat', 'Velours grenat profond et broderie au fil d''or sur l''encolure, les poignets et la traîne : un caftan à capuche aussi doux que spectaculaire.', 'Velours de soie grenat
Broderie au fil d''or (tarz)
Capuche brodée
Longueur : 150 cm, retouches incluses', 750, null, 1200, 'caftan', 'Velours grenat, broderie au fil d''or', (select id from public.collections where slug = 'caftans'), array['/images/tenues/red-1.jpg', '/images/tenues/red-2.jpg']::text[], 2, true, true, true, now() - interval '1 days'),
  ('Caftan Kenza', 'caftan-kenza-velours-bleu-nuit', 'Un velours bleu nuit rehaussé d''or sur la capuche et les manches : un caftan profond et chaleureux pour les soirées d''hiver.', 'Velours bleu nuit
Broderie au fil d''or
Capuche brodée
Tailles disponibles : S à XXL', 800, null, 1300, 'caftan', 'Velours bleu nuit, broderie or', (select id from public.collections where slug = 'caftans'), array['/images/tenues/navy-1.jpg', '/images/tenues/navy-2.jpg']::text[], 1, true, false, true, now() - interval '33 days'),
  ('Caftan Layla', 'caftan-layla-noir-et-or', 'Le noir et l''or, l''accord le plus chic : un velours noir brodé d''arabesques dorées, pour une soirée tout en élégance.', 'Velours noir
Broderie arabesque au fil doré
Capuche amovible
Tailles disponibles : S à XL', 850, 1050, 1400, 'caftan', 'Velours noir, broderie or', (select id from public.collections where slug = 'caftans'), array['/images/tenues/black-1.jpg', '/images/tenues/black-2.jpg']::text[], 1, false, false, true, now() - interval '32 days'),
  ('Caftan Nour', 'caftan-nour-mousseline-menthe', 'Une mousseline menthe brodée de fleurs ton sur ton, posée sur un fourreau de satin. Léger et frais, idéal pour les fêtes d''été.', 'Mousseline brodée et doublure satin
Coloris menthe glacée
Ceinture fine en option
Tailles disponibles : XS à L', 650, null, 1000, 'caftan', 'Mousseline menthe et satin', (select id from public.collections where slug = 'caftans'), array['/images/tenues/mint-1.jpg', '/images/tenues/mint-2.jpg']::text[], 2, false, true, true, now() - interval '4 days'),
  ('Takchita Rania', 'takchita-rania-or', 'Une dfina brodée de fleurs dorées posée sur une tahtia de satin champagne, ceinturée d''une mdamma ciselée : la takchita des grandes soirées.', 'Deux pièces : tahtia satin et dfina brodée
Ceinture (mdamma) dorée incluse
Sfifa faite main
Tailles disponibles : S à XL', 1400, null, 2500, 'takchita', 'Dfina brodée or, tahtia en satin', (select id from public.collections where slug = 'takchitas'), array['/images/tenues/gold-1.jpg', '/images/tenues/gold-2.jpg']::text[], 2, true, false, true, now() - interval '30 days'),
  ('Takchita Imane', 'takchita-imane-bleu-roi', 'Un brocart bleu roi tissé d''or et une sfifa dorée du col à l''ourlet : une takchita lumineuse pour le henné et les fiançailles.', 'Dfina en brocart bleu roi et or
Tahtia en satin assorti
Ceinture dorée incluse
Tailles disponibles : M à XXL', 1250, null, 2200, 'takchita', 'Brocart bleu roi, sfifa dorée', (select id from public.collections where slug = 'takchitas'), array['/images/tenues/royal-1.jpg', '/images/tenues/royal-2.jpg', '/images/tenues/royal-3.jpg']::text[], 1, false, true, true, now() - interval '6 days'),
  ('Takchita Zineb', 'takchita-zineb-rose-poudre', 'La douceur du rose poudré, des manches vaporeuses et un satin délicat : une takchita romantique pour les fiançailles.', 'Mousseline brodée et satin rose poudré
Manches évasées
Ceinture fine incluse
Tailles disponibles : XS à L', 1100, 1300, 2000, 'takchita', 'Mousseline rose poudré, satin', (select id from public.collections where slug = 'takchitas'), array['/images/tenues/pink-1.jpg', '/images/tenues/pink-2.jpg']::text[], 2, false, true, true, now() - interval '0 days'),
  ('Takchita Hiba', 'takchita-hiba-brocart-prune', 'Un brocart prune tissé de fleurs et rehaussé d''une sfifa dorée : une takchita intense, signature de la maison.', 'Brocart prune et or
Sfifa et boutons dorés faits main
Ceinture tressée dorée incluse
Tailles disponibles : S à L', 1300, null, 2300, 'takchita', 'Brocart prune, broderie dorée', (select id from public.collections where slug = 'takchitas'), array['/images/tenues/plum-1.jpg', '/images/tenues/plum-2.jpg', '/images/tenues/plum-3.jpg']::text[], 1, false, false, true, now() - interval '27 days'),
  ('Lebsa Fassia Émeraude', 'lebsa-fassia-emeraude', 'La tenue de mariée de Fès dans toute sa splendeur : velours émeraude brodé d''or, capuche et traîne, pour l''entrée de la mariée.', 'Velours émeraude brodé au fil d''or
Capuche et traîne brodées
Parure de tête et bijoux inclus
Habillage par notre négafa en option', 4500, null, 8000, 'mariee', 'Velours émeraude brodé or', (select id from public.collections where slug = 'mariee'), array['/images/tenues/emerald-1.jpg', '/images/tenues/emerald-2.jpg']::text[], 1, true, false, true, now() - interval '26 days'),
  ('Takchita de mariée Ivoire', 'takchita-mariee-ivoire', 'Une takchita ivoire en mousseline brodée sur satin duchesse, ceinture bijou : la tenue lumineuse du premier passage.', 'Mousseline ivoire brodée
Satin duchesse
Ceinture bijou incluse
Retouches sur mesure incluses', 3200, null, 6000, 'mariee', 'Mousseline ivoire, satin duchesse', (select id from public.collections where slug = 'mariee'), array['/images/tenues/ivory-1.jpg', '/images/tenues/ivory-2.jpg']::text[], 1, false, true, true, now() - interval '3 days'),
  ('Caftan de mariée Turquoise Royal', 'caftan-mariee-turquoise-royal', 'Un brocart turquoise tissé d''or et couronné d''un diadème : le passage de la mariée le plus attendu.', 'Brocart turquoise tissé or
Diadème assorti inclus
Sfifa et boutons dorés faits main
Tailles disponibles : S à XL', 2800, null, 5000, 'mariee', 'Brocart turquoise et or, diadème', (select id from public.collections where slug = 'mariee'), array['/images/tenues/teal-1.jpg', '/images/tenues/teal-2.jpg', '/images/tenues/teal-3.jpg']::text[], 1, false, false, true, now() - interval '24 days'),
  ('Djellaba Farah', 'djellaba-farah-bleu-ciel', 'Une djellaba bleu ciel en crêpe léger, brodée ton sur ton : élégante et confortable pour l''Aïd.', 'Crêpe fluide bleu ciel
Broderie ton sur ton
Capuche traditionnelle
Tailles disponibles : S à XXL', 350, null, 500, 'djellaba', 'Crêpe bleu ciel, broderie ton sur ton', (select id from public.collections where slug = 'djellabas'), array['/images/tenues/sky-1.jpg', '/images/tenues/sky-2.jpg']::text[], 4, true, false, false, now() - interval '23 days'),
  ('Djellaba Amal', 'djellaba-amal-sable', 'Une djellaba couleur sable, souple et respirante, ourlée d''une sfifa ton sur ton : l''allure naturelle des fêtes d''été.', 'Crêpe couleur sable
Sfifa ton sur ton
Poches latérales
Tailles disponibles : XS à XL', 300, null, 400, 'djellaba', 'Crêpe sable, finitions sfifa', (select id from public.collections where slug = 'djellabas'), array['/images/tenues/sand-1.jpg', '/images/tenues/sand-2.jpg']::text[], 3, false, true, false, now() - interval '6 days'),
  ('Djellaba Soirée Violette', 'djellaba-soiree-violette', 'Un violet profond et une broderie délicate : une djellaba de soirée raffinée pour les aqiqa et les fêtes en famille.', 'Crêpe satiné violet
Broderie sur le plastron
Capuche brodée
Tailles disponibles : S à XL', 450, null, 700, 'djellaba', 'Crêpe satiné violet, broderie', (select id from public.collections where slug = 'djellabas'), array['/images/tenues/violet-1.jpg', '/images/tenues/violet-2.jpg']::text[], 2, false, false, false, now() - interval '21 days')
on conflict (slug) do nothing;
