const express = require('express');
const data = require('./data');
const {main,findListing} = require('./connect.js');


const port = process.env.PORT || 5000;

async function initialise()
{
    console.log("Hello");
    const client = await main();
    const results = await findListing(client);
    console.log(results);
    return results;
}

const app = express();

app.get('/', (req,res) => {
    res.send('Server is ready');
});

app.get('/servicecentres', (req,res) => {
    initialise().then(result => res.send(result)).catch(err => {console.log(err);res.sendStatus(501);});
})

app.listen(port, () => {
    console.log(`Serve at http://localhost:${5000}`);
});