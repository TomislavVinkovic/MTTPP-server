const mongodb = require("mongodb");

const connect_to_db = async () => {
    const url = "mongodb://127.0.0.1:27017";
    const client = new mongodb.MongoClient(url);
    const db_name = "todo";

    try {
        await client.connect();
        console.log("Successfully connected to DB");
    } catch(e) {
        console.log("Unable to connect to DB");
    }
    
    let db = client.db(db_name);
    return db;
}

module.exports = { connect_to_db, ObjectId: mongodb.ObjectId };