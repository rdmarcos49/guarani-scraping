const db = require('./src/connection')
const scraping = require('./src/Scraping/index')

async function updateDB()
{
  const fullData = await scraping.getGuaraniesData()
  const dbConnection = await db.connect()

  fullData.forEach(async (data) => {
    const dbColl =  dbConnection.collection(data.departament)
    await dbColl.insertOne(data)
  })
}

updateDB()
