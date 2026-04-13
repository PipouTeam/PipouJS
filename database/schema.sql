-- Schéma PostgreSQL : (RE)Sources Relationnelles

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'citizen'
        CHECK (role IN ('citizen', 'moderator', 'admin', 'super_admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Types de relations (Soi, Conjoints, Famille, Pro, Amis, Inconnus)
CREATE TABLE IF NOT EXISTS relation_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Types de ressources (Article, Vidéo, Jeu, Cours, Carte défi, etc.)
CREATE TABLE IF NOT EXISTS resource_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ressources
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    relation_type_id INT REFERENCES relation_types(id) ON DELETE SET NULL,
    resource_type_id INT REFERENCES resource_types(id) ON DELETE SET NULL,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'validated', 'suspended')),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('private', 'shared', 'public')),
    views INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progression utilisateurs : favoris, exploitées, mises de côté (TODO collègue P01-P05)
CREATE TABLE IF NOT EXISTS user_resources (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_exploited BOOLEAN NOT NULL DEFAULT FALSE,
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource_id)
);

-- Commentaires avec 1 niveau d'imbrication (TODO collègue E01-E04)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données par défaut
INSERT INTO categories (name) VALUES
    ('Communication'), ('Parentalité'), ('Santé'), ('Bien-être'), ('Éducation'), ('Professionnel');

INSERT INTO relation_types (name) VALUES
    ('Soi'), ('Conjoints'), ('Famille'), ('Professionnel'), ('Amis'), ('Inconnus');

INSERT INTO resource_types (name) VALUES
    ('Article'), ('Vidéo'), ('Jeu'), ('Cours'), ('Carte défi'), ('Podcast');

-- Utilisateurs de test
-- Admin: admin@mail.com / admin123
-- User: user@mail.com / user123
INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES
    ('admin@mail.com', '$2b$12$lNTZs3/R.DQN3uW6Kllc/ObneV3bZaMq09W6K9cJmP08D4dEaXG7G', 'Admin', 'User', 'admin', TRUE),
    ('user@mail.com', '$2b$12$b/hBw.EFxh2Yrq6aViuGP.x2e4ZgLLhzSLsYdWG1Zih6pTNq8Zmze', 'Test', 'User', 'citizen', TRUE);

