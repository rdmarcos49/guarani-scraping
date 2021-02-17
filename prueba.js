
const db = require('./connection')

const scraping = require('./index')



   // const data = await getData()

   async function A()
   {
        const data = await scraping.gettingData()
        console.log(data) 
   }
   A()