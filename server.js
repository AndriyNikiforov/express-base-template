const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const { log } = require('console');
const winston = require('./config/winston.config');

dotenv.config();

const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(express.json());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use(morgan('combined', { stream: winston.stream }));
app.use(morgan('short', { stream: winston.stream }));

app.get('/', (res) => res.sendFile(
  join(__dirname, 'public', 'index.html'),
));

app.use((req, res, next) => {
  next(new Error('File not found'));
});

app.use((err, req, res) => {
  winston.error(winston.combinedFormat(err, req, res));
  res.statusCode(err.statusCode || 500)
    .send('Internal server error.');
});

app.listen(PORT, () => log(`http://localhost:${PORT}/`));
