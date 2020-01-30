import express, {Application, Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import initRoutes from './routes'
import * as swaggerJSDocExpress from 'swagger-jsdoc-express';

require('express-async-errors');

import redis from "redis";

const app: Application = express();
const errorHandler = require('node-error-handler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT || 80;
const REDIS_URL = process.env.RURL!;

const client = redis.createClient(REDIS_URL);
client.on('connect', function () {
    console.log(`connected to redis at ${REDIS_URL}`);
});

swaggerJSDocExpress.setupSwaggerUIFromSourceFiles({
    root: '/docs',
    cwd: './src/',
    debug: true,
    title: `FCM Node Server ${process.env.npm_package_version}`
}, app);

initRoutes({app, redis: client});

app.use(errorHandler({ log: true, debug: true }));

app.listen(PORT, () => {
    console.log(`server is happily running on PORT ${PORT}`)
});

