import express from 'express';
import routes from './routes';
import { connectDB } from './utils';

const app = express();
const port = 1337;

app.use(express.json());
app.use('/', routes)

connectDB();

app.listen(port, () => {
    console.log(`[🤖] Server started on port ${port}`);
});