

// Patches
const {inject, errorHandler} = require('express-custom-error');
inject(); // Patch express in order to use async / await syntax

// Require Dependencies

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');


const logger = require('./util/logger');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Load .env Enviroment Variables to process.env

// Variables toujours obligatoires
require('mandatoryenv').load([
    'PORT',
    'SECRET',
    'S3_ENDPOINT',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_BUCKET',
]);

// En local : variables DB individuelles. Sur Clever Cloud : POSTGRESQL_ADDON_URI fournie par l'add-on
if (!process.env.POSTGRESQL_ADDON_URI) {
    require('mandatoryenv').load([
        'DB_HOST',
        'DB_PORT',
        'DB_DATABASE',
        'DB_USER',
        'DB_PASSWORD',
    ]);
}


// Instantiate an Express Application
const app = express();


// Configure Express App Instance
app.use(express.json( { limit: '50mb' } ));
app.use(express.urlencoded( { extended: true, limit: '10mb' } ));

// Configure custom logger middleware
app.use(logger.dev, logger.combined);

app.use(cookieParser());

// CORS — supporte plusieurs origines (FRONTEND_URL, BACKOFFICE_URL, CORS_EXTRA_ORIGINS)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.BACKOFFICE_URL,
    ...(process.env.CORS_EXTRA_ORIGINS ? process.env.CORS_EXTRA_ORIGINS.split(',') : []),
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Autorise les requêtes sans origin (curl, mobile, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Swagger — helmet désactivé sur cette route pour autoriser les assets UI
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerSpec));

app.use(helmet());

// This middleware adds the json header to every response
app.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// Assign Routes

app.use('/', require('./routes/router.js'));


// Handle errors
app.use(errorHandler());

// Handle not valid route
app.use('*', (req, res) => {
    res
    .status(404)
    .json( {status: false, message: 'Endpoint Not Found'} );
})

module.exports = app;
