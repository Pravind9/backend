const { MongoClient } = require("mongodb");
const env = require("dotenv").config();

async function main() {
    /**
    * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
    * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
    */
   const dbUserName = env.parsed.MONGO_DB_USER_NAME;
   const dbUserPass = env.parsed.MONGO_DB_USER_PASS;
   const dbHost = env.parsed.MONGO_DB_HOST;
   const dbPort = env.parsed.MONGO_DB_PORT;
   const dbName = env.parsed.MONGO_DB_NAME;

   

    const uri = "mongodb://" + dbUserName + ":" + dbUserPass + "@" + dbHost + ":" + dbPort + "/" + dbName + "?authMechanism=DEFAULT&tls=false&retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster this
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
} 

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

main().catch(console.error);