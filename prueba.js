
const db = require('./connection')

const scraping = require('./index')



   // const data = await getData()

   async function A()
   {
        const data = await scraping.getGuaraniesData()
        console.log(data) 
   }
   A()