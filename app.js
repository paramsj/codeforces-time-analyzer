import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
    origin : '*',
}));

app.use(express.json());


import homeRouter from './routes/home.routes.js';
app.use('/api/v1/home',homeRouter);

export {app};