const { Pool } = require('pg');
require('dotenv').config();

const db_company = new Pool({
    user: process.env.DB_USER1,
    host: process.env.DB_HOST1,
    database: process.env.DB_NAME1,
    password: process.env.DB_PASSWORD1,
    port: process.env.DB_PORT1
});

const db_transaction = new Pool({
    user: process.env.DB_USER2,
    host: process.env.DB_HOST2,
    database: process.env.DB_NAME2,
    password: process.env.DB_PASSWORD2,
    port: process.env.DB_PORT2
});

const db_log = new Pool({
    user: process.env.DB_USER3,
    host: process.env.DB_HOST3,
    database: process.env.DB_NAME3,
    password: process.env.DB_PASSWORD3,
    port: process.env.DB_PORT3
});

module.exports = { db_company, db_transaction, db_log };
