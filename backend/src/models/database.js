const { Pool } = require('pg');

// Supporte la connection string Clever Cloud (POSTGRESQL_ADDON_URI) ou les variables individuelles
const poolConfig = process.env.POSTGRESQL_ADDON_URI
    ? {
        connectionString: process.env.POSTGRESQL_ADDON_URI,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

module.exports = pool;
