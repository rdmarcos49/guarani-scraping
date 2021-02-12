const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://rdmarcos49:rdmarcos49@cluster0.kbx6p.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log(collection)
  // perform actions on the collection object
  client.close();
});