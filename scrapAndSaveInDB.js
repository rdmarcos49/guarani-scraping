
const db = require('./src/connection')
const fs = require('fs');
const scraping = require('./src/Scraping/index')

const resultDir = './scraping-result';



   async function A()
   {
        const fullData = await scraping.getGuaraniesData()
        const dbConnection = await db.connect()

        fullData.forEach(async (data) => {
          const dbColl =  dbConnection.collection(data.departament)
          await dbColl.insertOne(data)
        })
   }
   A()