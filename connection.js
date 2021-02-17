const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://rdmarcos49:rdmarcos49@cluster0.kbx6p.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority";


 async function connect(){
  
  const client = await MongoClient(uri).connect();

  const db = client.db('guaraniScraping');

  return db;

}

module.exports = {
  
  connect:connect

}


