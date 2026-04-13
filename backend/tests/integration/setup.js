const { Pool } = require('pg');

// Utilise les memes variables d'env que l'app (chargees via .env)
// mais on peut surcharger DB_DATABASE pour utiliser une DB de test
const TEST_DB = process.env.DB_TEST_DATABASE || 'pipou_db_test';

// Pool pour creer / supprimer la base de test (connecte a 'postgres')
const adminPool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'pipou',
    password: process.env.DB_PASSWORD || 'pipou_secret',
});

// Schema SQL pour les tables (identique a database/schema.sql, sans les donnees par defaut)
const fs = require('fs');
const path = require('path');

const SCHEMA_SQL = `
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

    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS relation_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
        media_url TEXT,
        thumbnail_url TEXT,
        views INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS user_files (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        s3_key TEXT NOT NULL,
        original_name VARCHAR(255),
        mime_type VARCHAR(100),
        size_bytes BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function createTestDatabase() {
    // Verifier si la base existe, sinon la creer
    const result = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`, [TEST_DB]
    );
    if (result.rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${TEST_DB}`);
    }

    // Se connecter a la base de test pour creer les tables
    const testPool = new Pool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        database: TEST_DB,
        user: process.env.DB_USER || 'pipou',
        password: process.env.DB_PASSWORD || 'pipou_secret',
    });

    await testPool.query(SCHEMA_SQL);
    await testPool.end();
}

async function cleanTables(pool) {
    await pool.query(`
        TRUNCATE comments, user_resources, user_files, resources, categories, relation_types, resource_types, users
        RESTART IDENTITY CASCADE
    `);
}

async function dropTestDatabase() {
    await adminPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${TEST_DB}'
        AND pid <> pg_backend_pid()
    `);
    await adminPool.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
    await adminPool.end();
}

module.exports = { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB };
