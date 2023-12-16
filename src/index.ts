import express from 'express';
import 'dotenv/config';
import './db';
import authRouter from './routers/auth';

const app = express();

//Register Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);

const PORT = 8000;

app.listen(PORT, () => {
  console.log('Post is Listening on port ' + PORT);
});
