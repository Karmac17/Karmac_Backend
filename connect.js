const {MongoClient} = require('mongodb');

var main = async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const url = "mongodb+srv://karmac:1234@cluster0.zmoo0.mongodb.net/Karmac?retryWrites=true&w=majority";
    const client = new MongoClient(url);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        await  listDatabases(client);
        // await createListing(client,{
        //     "id":3,
        //     "address":"Ghatkopar,Mumbai,Maharashtra",
        //     "description": "Audi Service Centre",
        //     "title": "Audi Centre",
        //     "image": "https://drivetribe.imgix.net/BkxEWgQ2SvSWzVmBHCgacg?w=600&h=400&fm=jpe&auto=compress&fit=crop&crop=faces",
        //      "timing": "10:00am - 06:00pm",
        //     "contact": "+91 8888888888"
        // })
        await findListing(client);
        return client;
    } catch (e) {
        console.error(e);
    } finally {

    }

}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function createListing(client, newListing){
    const result = await client.db("Karmac").collection("ServiceCentres").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

var findListing = async function findListing(client) {
    const cursor = client.db("Karmac").collection("ServiceCentres")
        .find()
        .sort({id:1});
    const results = await cursor.toArray();
    // console.log(results);
    return results;
    if (results.length > 0) {
        // console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            // date = new Date(result.last_review).toDateString();
            // console.log();
            console.log(`${i + 1}. id: ${result.id}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.description}`);
            console.log(`   bathrooms: ${result.title}`);
            // console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log("Nothing Found");
        // console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

exports.main = main;
exports.findListing = findListing;
