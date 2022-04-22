import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/new';

import { errorHandler, NotFoundError, currentUser } from '@yctickets123/common';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(
    cookieSession({
        signed: false, //disable encryption
        secure: process.env.NODE_ENV !== 'test', //http connection if in test, https connection in prod
    })
);

app.use(currentUser);
app.use(createChargeRouter);

app.all('*', async (req, res, next) => {
    throw new NotFoundError();
})

// function asd(req: Request, res: Response, next: NextFunction): Express.Request {
//     return req;
// }

app.use(errorHandler);

export { app };