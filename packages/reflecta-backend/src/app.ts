import cors from 'cors';
import express, {
    Application
} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {
    AddressInfo
} from 'net';

import middleware from './middleware';

import logger from './logger';

import establishPool from './db';

// Initialize App
const app: Application = express();

const {
    env: {
        CORS_ORIGIN,
        SERVER_PORT
    }
} = process;

// App Configurations
app.disable('x-powered-by');
app.use(cors({
    credentials: true,
    methods: [
        'DELETE',
        'GET',
        'POST',
        'PUT'
    ],
    origin: CORS_ORIGIN
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
// app.use(express.urlencoded({
//     extended: false
// }));
app.use(middleware);

// Start Server
const server = app.listen(SERVER_PORT || 3100, async () => {
    const {
        env: {
            DATABASE_HOST = '',
            DATABASE_NAME = '',
            DATABASE_PORT = '',
            DATABASE_USER = ''
        }
    } = process;

    try {
        // eslint-disable-next-line no-console
        logger.info(`server started on port: ${(server.address() as AddressInfo).port}...`);

        const connection = await establishPool().getConnection();

        logger.info('database connection established...');

        connection.release();
    } catch (error) {
        console.log('error...', error);
        logger.error(`unable to connect to database ${DATABASE_NAME} located at ${DATABASE_HOST}:${DATABASE_PORT} with user ${DATABASE_USER}...`);
    }
});
