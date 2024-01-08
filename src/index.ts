import express from 'express';
import 'dotenv/config';
import './db';
import authRouter from './routers/auth';
import audioRouter from './routers/audio';

const app = express();

//Register Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/audio', audioRouter);

const PORT = 8000;

app.listen(PORT, () => {
  console.log('Post is Listening on port ' + PORT);
});
