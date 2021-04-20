const puppeteer = require('puppeteer');
const fs = require('fs');
const { DEPARTMENTS } = require('../constants/url');
const {
  CAREER_SELECTOR,
  CAREER_DROPDOWN_SELECTOR,
  PLAN_SELECTOR,
  PLAN_DROPDOWN_SELECTOR,
  SEARCH_BUTTON,
  SUBJECT,
  SUBJECT_NAME_SELECTOR,
} = require('../constants/selectors');

function createDirIfNotExists(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

createDirIfNotExists('./screenshots');
createDirIfNotExists('./scraping-result');

function getObjetoDeInformacionDeLaMesa(cabecera, td) {
  let informacionDeLaMesa = {}
  for (let i = 0; i < cabecera.length; i++) {
    const key = cabecera[i];
    const value = td[i];
    if (key.toLowerCase() !== 'ver') {
      informacionDeLaMesa = {
        ...informacionDeLaMesa,
        [key]: value,
      }
    }
  };

  return informacionDeLaMesa;
}

function getInfoCompleta(infoPrincipal, infoVerMas) {
  const infoCompleta = {...infoVerMas, ...infoPrincipal};
  return infoCompleta;
}

async function getGuaraniesData() {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.exposeFunction('getObjetoDeInformacionDeLaMesa', getObjetoDeInformacionDeLaMesa);
  await page.exposeFunction('getInfoCompleta', getInfoCompleta);

  let informationToWrite = []
  
  for (const departament of DEPARTMENTS) {
    const { url } = departament;
    await page.goto(url, {waitUntil: 'networkidle0'});
    
    
    const careers = await page.evaluate(() => {
      const options = [...document.querySelectorAll(CAREER_DROPDOWN_SELECTOR)].map(option => {
        return {
            name: option.innerText,
            value: option.value
          }
      });

      let filteredOptions = [];

      options.forEach(option => {
        if (!!option.value) {
          filteredOptions.push(option);
        }
      })
      return filteredOptions;
    });

    for (const career of careers) {
      await page.goto(url, {waitUntil: 'networkidle0'});
      await page.waitForSelector(CAREER_SELECTOR);
  
      await page.select(CAREER_SELECTOR, career.value);
      await page.waitForTimeout(1000);
      
      const planes = await page.evaluate(() => {
        const options = [...document.querySelectorAll(PLAN_DROPDOWN_SELECTOR)].map(option => {
          return {
              name: option.innerText,
              value: option.value
            }
        });
        let filteredOptions = [];
        options.forEach(option => {
          if (!!option.value) {
            filteredOptions.push(option);
          }
        })
        return filteredOptions;
      });
  
      for (const plan of planes) {
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.select(CAREER_SELECTOR, career.value);
        await page.waitForTimeout(1000)
        await page.select(PLAN_SELECTOR, plan.value);
    
        await page.evaluate(() => {
          const button = document.querySelector(SEARCH_BUTTON);
          button.click();
        });
        
        await page.waitForTimeout(1500);
        const thereIsACorteElement = await page.evaluate(() => {
          const corte = document.querySelector(SUBJECT);
          return !!corte;
        });
  
        if (thereIsACorteElement) {
          const data = await page.evaluate(async () => {

            function getFormattedInnerHTML (innerHTML) {
              const formattedInnerHTML = innerHTML
                .split('\t').join('')
                .split('\n').join('')
                .split(" ").filter(word => word !== "").join(" ");
              return formattedInnerHTML.replace(/<br>/g, " - ");
            }

            function getHeaders (subject, nodeSelectors, headerSelectors) {
              const nodeList = subject.querySelector(nodeSelectors);
              return [...nodeList.querySelectorAll(headerSelectors)].map(header => header.innerText);
            }
            
            let clusterOfSubjects = [...document.querySelectorAll(SUBJECT)].map( async (subject) => {
              const subjectName = subject.querySelector(SUBJECT_NAME_SELECTOR).innerText;
              const principalHeaders = getHeaders(subject, 'table thead tr', 'th');
              const verMasHeaders = getHeaders(subject, 'table tbody .mas_info', 'table thead tr th');
              const body = [...subject.querySelector('table tbody').childNodes];
      
              let mesas = []
              for (let i = 0; i < body.length; i = i + 2) {
                const principalData = [...body[i].querySelectorAll('td')].map(elem => {
                  return getFormattedInnerHTML(elem.innerHTML);
                });
                
                const verMasData = [...body[i + 1].querySelector('td table tbody tr').childNodes].map(elem => {
                  return getFormattedInnerHTML(elem.innerHTML);
                });
                
                const [principalInfo, viewMoreInfo] = await Promise.all([
                  window.getObjetoDeInformacionDeLaMesa(principalHeaders, principalData),
                  window.getObjetoDeInformacionDeLaMesa(verMasHeaders, verMasData)
                ]);
      
                const unifiedInfo = await window.getInfoCompleta(principalInfo, viewMoreInfo);
                mesas.push(unifiedInfo);
              }
              return {materia: subjectName, mesas: mesas};
            });
      
            return await Promise.all(clusterOfSubjects);
          });
          informationToWrite.push({departament: departament.name, career: career.name, plan: plan.name, data:data});
        } else {
          informationToWrite.push({departament: departament.name, career: career.name, plan: plan.name, data: null});
        }
      }
    }
  }
  
  informationToWrite.forEach(data => {
    const path = `${resultDir}/${data.departament}-${data.career}-${data.plan}.json`;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  });
  
  await browser.close();

  return informationToWrite;
};


module.exports = {
  getGuaraniesData,
}
