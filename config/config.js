const dotenv = require('dotenv');

dotenv.config();

const host = process.env.DB_CONN_HOST;
const port = 3306;
const username = process.env.DB_CONN_USER;
const password = process.env.DB_CONN_PW;
const database = process.env.DB_CONN_DBNAME;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
  },
  production: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
  },
};
