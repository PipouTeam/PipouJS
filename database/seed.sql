-- Seed données prototype : ressources de démonstration
-- À exécuter APRÈS schema.sql

-- Nouvelles catégories nécessaires
INSERT INTO categories (name) VALUES
    ('Intelligence émotionnelle'),
    ('Monde professionnel'),
    ('Qualité de vie'),
    ('Développement personnel')
ON CONFLICT DO NOTHING;

-- URL de base pour les thumbnails MinIO (local)
-- En prod, remplacer par l'URL Cellar

-- 1. Article — « Gérer son stress au quotidien »
INSERT INTO resources (title, content, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'Gérer son stress au quotidien',
    '<h2>Introduction</h2><p>Le stress fait partie de notre quotidien, mais il existe des techniques simples pour mieux le gérer.</p><h2>Techniques de respiration</h2><p>La respiration abdominale est l''une des méthodes les plus efficaces. Inspirez profondément par le nez pendant 4 secondes, retenez 4 secondes, puis expirez lentement par la bouche pendant 6 secondes.</p><h2>Organisation du temps</h2><p>Planifier ses tâches et prioriser ses objectifs permet de réduire considérablement le sentiment d''urgence qui génère du stress.</p>',
    'http://localhost:9000/pipou-resources/thumbnails/stress.jpg',
    (SELECT id FROM categories WHERE name = 'Bien-être'),
    (SELECT id FROM relation_types WHERE name = 'Soi'),
    (SELECT id FROM resource_types WHERE name = 'Article'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'validated',
    'public'
);

-- 2. Article — « Communication non-violente »
INSERT INTO resources (title, content, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'La communication non-violente en pratique',
    '<h2>Les 4 étapes de la CNV</h2><p>La Communication Non-Violente (CNV), développée par Marshall Rosenberg, repose sur quatre étapes :</p><ol><li><strong>Observation</strong> : décrire les faits sans jugement</li><li><strong>Sentiment</strong> : exprimer ce que l''on ressent</li><li><strong>Besoin</strong> : identifier le besoin sous-jacent</li><li><strong>Demande</strong> : formuler une demande concrète et réalisable</li></ol><p>En appliquant ces étapes, on favorise une communication respectueuse et constructive.</p>',
    'http://localhost:9000/pipou-resources/thumbnails/communication.jpg',
    (SELECT id FROM categories WHERE name = 'Communication'),
    (SELECT id FROM relation_types WHERE name = 'Famille'),
    (SELECT id FROM resource_types WHERE name = 'Article'),
    (SELECT id FROM users WHERE email = 'moderator@test.com'),
    'validated',
    'public'
);

-- 3. Cours au format PDF — « Les droits de l'enfant dans le monde numérique »
INSERT INTO resources (title, content, media_url, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'Les droits de l''enfant dans le monde numérique',
    'Ce cours présente les droits fondamentaux de l''enfant à l''ère du numérique : vie privée, consentement et protection des données personnelles.',
    'http://localhost:9000/pipou-resources/seed-cours-droits-numeriques.pdf',
    'http://localhost:9000/pipou-resources/thumbnails/cours-pdf.jpg',
    (SELECT id FROM categories WHERE name = 'Éducation'),
    (SELECT id FROM relation_types WHERE name = 'Famille'),
    (SELECT id FROM resource_types WHERE name = 'Cours au format PDF'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'validated',
    'public'
);

-- 4. Vidéo — « Émission ARTE : Travail, Salaire, Profit »
INSERT INTO resources (title, content, media_url, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'Émission ARTE : Travail, Salaire, Profit',
    'Un documentaire ARTE sur le thème du travail, du salaire et du profit dans notre société moderne.',
    'https://www.youtube.com/watch?v=bcDKMlJOOsA',
    'http://localhost:9000/pipou-resources/thumbnails/video.jpg',
    (SELECT id FROM categories WHERE name = 'Monde professionnel'),
    (SELECT id FROM relation_types WHERE name = 'Professionnel'),
    (SELECT id FROM resource_types WHERE name = 'Vidéo'),
    (SELECT id FROM users WHERE email = 'admin@test.com'),
    'validated',
    'public'
);

-- 5. Jeu en ligne — « Quiz : Quel est votre style relationnel ? »
INSERT INTO resources (title, content, media_url, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'Quiz : Quel est votre style relationnel ?',
    'Un quiz interactif pour découvrir votre style relationnel dominant et mieux comprendre vos interactions avec les autres.',
    'https://www.16personalities.com/fr/test-de-personnalite',
    'http://localhost:9000/pipou-resources/thumbnails/jeu-en-ligne.jpg',
    (SELECT id FROM categories WHERE name = 'Développement personnel'),
    (SELECT id FROM relation_types WHERE name = 'Soi'),
    (SELECT id FROM resource_types WHERE name = 'Jeu en ligne'),
    (SELECT id FROM users WHERE email = 'citizen@test.com'),
    'validated',
    'public'
);

-- 6. Fiche de lecture — « Les 5 langages de l'amour »
INSERT INTO resources (title, content, thumbnail_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
VALUES (
    'Fiche de lecture : Les 5 langages de l''amour',
    '<h2>Résumé</h2><p>Gary Chapman identifie cinq façons principales d''exprimer et de recevoir l''amour :</p><ul><li><strong>Les paroles valorisantes</strong> : compliments, encouragements</li><li><strong>Les moments de qualité</strong> : temps exclusif ensemble</li><li><strong>Les cadeaux</strong> : gestes symboliques d''attention</li><li><strong>Les services rendus</strong> : actes concrets d''aide</li><li><strong>Le toucher physique</strong> : contact affectueux</li></ul><h2>Avis</h2><p>Un livre accessible qui aide à mieux comprendre les attentes relationnelles de son entourage. Utile aussi bien en couple qu''en famille ou entre amis.</p>',
    'http://localhost:9000/pipou-resources/thumbnails/fiche-lecture.jpg',
    (SELECT id FROM categories WHERE name = 'Communication'),
    (SELECT id FROM relation_types WHERE name = 'Conjoints'),
    (SELECT id FROM resource_types WHERE name = 'Fiche de lecture'),
    (SELECT id FROM users WHERE email = 'moderator@test.com'),
    'validated',
    'public'
);
