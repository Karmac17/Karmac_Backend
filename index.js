import express from 'express';
import data from './data.js';

const port = process.env.PORT || 5000;

const app = express();

app.get('/', (req,res) => {
    res.send('Server is ready');
});

app.get('/servicecentres', (req,res) => {
    res.send(data);
})

app.listen(port, () => {
    console.log(`Serve at http://localhost:${5000}`);
});