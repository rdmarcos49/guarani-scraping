const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://rdmarcos49:rdmarcos49@cluster0.kbx6p.gcp.mongodb.net/Guarani?retryWrites=true&w=majority";


 async function connect(){
  
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  await client.connect()
  
  const db = client.db('Guarani');
  
  return db;

}

module.exports = {
  
  connect:connect

}


