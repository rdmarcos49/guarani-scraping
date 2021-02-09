const puppeteer = require('puppeteer');
const fs = require('fs');

const dir = './screenshots';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const resultDir = './scraping-result';
if (!fs.existsSync(resultDir)){
    fs.mkdirSync(resultDir);
}

function getObjetoDeInformacionDeLaMesa(cabecera, td) {
  let informacionDeLaMesa = {}
  for (let i = 0; i < cabecera.length; i++) {
    const key = cabecera[i];
    const value = td[i]
    if (key.toLowerCase() !== 'ver') {
      informacionDeLaMesa = {
        ...informacionDeLaMesa,
        [key]: value,
      }
    }
  }

  return informacionDeLaMesa;
}

function getInfoCompleta(infoPrincipal, infoVerMas) {
    const infoCompleta = {...infoVerMas, ...infoPrincipal};
    return infoCompleta;
}

const URL = 'https://guarani.econ.unicen.edu.ar/guarani3w/fecha_examen';

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(URL, {waitUntil: 'networkidle0'});
  await page.exposeFunction('getObjetoDeInformacionDeLaMesa', getObjetoDeInformacionDeLaMesa);
  await page.exposeFunction('getInfoCompleta', getInfoCompleta);
  
  const careers = await page.evaluate(() => {
    const options = [...document.querySelectorAll('#formulario_filtro-carrera option')].map(option => {
      return {
          name: option.innerText,
          value: option.value
        }
    })
    let filteredOptions = [];
    options.forEach(option => {
      if (!!option.value) {
        filteredOptions.push(option);
      }
    })
    return filteredOptions;
  })
  


  let informationToWrite = []
  for (const career of careers) {

    await page.goto(URL, {waitUntil: 'networkidle0'});
    await page.waitForSelector('#formulario_filtro-carrera')

    await page.select('#formulario_filtro-carrera', career.value);
    await page.waitForTimeout(1000)
    
    const planes = await page.evaluate(() => {
      const options = [...document.querySelectorAll('#formulario_filtro-plan option')].map(option => {
        return {
            name: option.innerText,
            value: option.value
          }
      })
      let filteredOptions = [];
      options.forEach(option => {
        if (!!option.value) {
          filteredOptions.push(option);
        }
      })
      return filteredOptions;
    });

    for (const plan of planes) {
      await page.goto(URL, {waitUntil: 'networkidle0'});
      await page.select('#formulario_filtro-carrera', career.value);
      await page.waitForTimeout(1000)
      await page.select('#formulario_filtro-plan', plan.value);
  
      await page.evaluate(() => {
        const button = document.getElementById('boton_buscar');
        button.click();
      });
      
      await page.waitForTimeout(1500);
      const thereIsACorteElement = await page.evaluate(() => {
        const corte = document.querySelector('.corte');
        if (!!corte) {
          return true;
        }
        return false;
      });

      if (thereIsACorteElement) {
        const data = await page.evaluate(async () => {
          let clusterOfSubjects = [...document.querySelectorAll('.corte')].map( async (subject) => {
            const subjectName = subject.querySelectorAll('.span12')[0].innerText;
            const nodeListPrincipalHeaders = subject.querySelectorAll('table thead tr')[0];
            const principalHeaders = [...nodeListPrincipalHeaders.querySelectorAll('th')].map(header => header.innerText);
            const nodeListVerMasHeaders = subject.querySelectorAll('table tbody .mas_info')[0];
            const verMasHeaders = [...nodeListVerMasHeaders.querySelectorAll('table thead tr th')].map(header => header.innerText);
            const body = [...subject.querySelector('table tbody').childNodes];
    
            let mesas = []
            for (let i = 0; i < body.length; i = i + 2) {
              const principalData = [...body[i].querySelectorAll('td')].map(elem => {
                const innerHtml = elem.innerHTML
                  .split('\t').join('')
                  .split('\n').join('')
                  .split(" ").filter(word => word !== "").join(" ");
                return innerHtml.replace(/<br>/g, " - ");
              });
              
              const verMasData = [...body[i + 1].querySelector('td table tbody tr').childNodes].map(elem => {
                const innerHtml = elem.innerHTML
                  .split('\t').join('')
                  .split('\n').join('')
                  .split(" ").filter(word => word !== "").join(" ");
                return innerHtml.replace(/<br>/g, " - ");
              });
              
              const splittedInformation = await Promise.all([
                window.getObjetoDeInformacionDeLaMesa(principalHeaders, principalData),
                window.getObjetoDeInformacionDeLaMesa(verMasHeaders, verMasData)
              ]);
    
              const unifiedInfo = await window.getInfoCompleta(splittedInformation[0], splittedInformation[1])
    
              mesas.push(unifiedInfo)
            }
            return {materia: subjectName, mesas: mesas};
          });
    
          return await Promise.all(clusterOfSubjects);
        });
        informationToWrite.push({career: career.name, plan: plan.name, data:data});
      } else {
        informationToWrite.push({career: career.name, plan: plan.name, data: null})
      }
    }
  }
  
  informationToWrite.forEach(data => {
    fs.writeFileSync(`${resultDir}/${data.career}-${data.plan}.json`, JSON.stringify(data, null, 2));
  })

  await browser.close();
})();
