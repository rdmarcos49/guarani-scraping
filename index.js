const puppeteer = require('puppeteer');
const fs = require('fs');

const dir = './screenshots';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

function getObjetoDeInformacionDeLaMesa(cabecera, tri) {
  console.log(cabecera)
  console.log(tri)
  let informacionDeLaMesa = {}
  for (let i = 0; i < cabecera.length; i++) {
    informacionDeLaMesa = {
      ...informacionDeLaMesa,
      [cabecera[i]]: tri[i].innerText,
    }
  }
  return informacionDeLaMesa;
}

function getInfoCompleta(infoPrincipal, infoVerMas) {
    const infoCompleta = {...infoVerMas, ...infoPrincipal};
    return infoCompleta;
}

function theInnerTextIncludesSomeOfThisWords(innerTextOption, ...words) {
  const lowerCaseInnerTextOption = innerTextOption.toLowerCase();
  const lowerCaseWords = words.map(word => word.toLowerCase());
  for (const word of lowerCaseWords) {
    if (lowerCaseInnerTextOption.includes(word)) {
      return true;
    }
  }
  return false;
}

function getIngSistValue(options) {
  const CAREER_WORDS = ['ingenieria', 'ingeniería'];
  let target = null;
  options.forEach(option => {    
    if (theInnerTextIncludesSomeOfThisWords(option.innerText, ...CAREER_WORDS)) {
      target = option.value;
    }
  })
  return target;
}

function getPlan2011(options) {
  const PLAN = ['2011'];
  let target = null;
  options.forEach(option => {    
    if (theInnerTextIncludesSomeOfThisWords(option.innerText, ...PLAN)) {
      target = option.value;
    }
  })
  return target;
}

const URL = 'https://g3w.exa.unicen.edu.ar/guarani3w/fecha_examen';

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(URL, {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'screenshots/initOfPage.png'})
  await page.exposeFunction('getIngSistValue', getIngSistValue);
  
  const career = await page.evaluate(() => {
    const options = [...document.querySelectorAll('#formulario_filtro-carrera option')].map(option => {
      return {
          innerText: option.innerText,
          value: option.value
        }
    })
    const ingSistValue = window.getIngSistValue(options);
    return ingSistValue;
  })
  console.log(career);
  await page.select('#formulario_filtro-carrera', career);
  await page.screenshot({path: 'screenshots/selectedCareer.png'})
  await page.exposeFunction('getPlan2011', getPlan2011);
  
  const plan = await page.evaluate(() => {
    const options = [...document.querySelectorAll('#formulario_filtro-plan option')].map(option => {
      return {
          innerText: option.innerText,
          value: option.value
        }
    })
    const plan2011Value = window.getPlan2011(options);
    return plan2011Value;
  });
  console.log(plan);
  await page.select('#formulario_filtro-plan', plan);
  await page.screenshot({path: 'screenshots/selecterPlan.png'})

  await page.evaluate(() => {
    const button = document.getElementById('boton_buscar');
    button.click();
  });
  await page.waitForSelector('.corte')
  await page.screenshot({path: 'screenshots/searchResult.png'})

  await page.exposeFunction('getObjetoDeInformacionDeLaMesa', getObjetoDeInformacionDeLaMesa);
  await page.exposeFunction('getInfoCompleta', getInfoCompleta);


  const data = await page.evaluate(() => {
    let clusterOfSubjects = [...document.querySelectorAll('.corte')].map(subject => {
      const subjectName = subject.querySelectorAll('.span12')[0].innerText;
      const nodeListPrincipalHeaders = subject.querySelectorAll('table thead tr')[0];
      const principalHeaders = [...nodeListPrincipalHeaders.querySelectorAll('th')].map(header => header.innerText);
      const nodeListVerMasHeaders = subject.querySelectorAll('table tbody .mas_info')[0];
      const verMasHeaders = [...nodeListVerMasHeaders.querySelectorAll('table thead tr th')].map(header => header.innerText);
      const theSixTr = [...subject.querySelectorAll('table tbody tr')];
      let mesas = []
      mesas.push(principalHeaders);
      mesas.push(verMasHeaders);
      /*
      for (let i = 0; i < theSixTr.length; i += 2) {
        page.waitFor(100000000000)
      }
      */
      return mesas
    });
    return clusterOfSubjects;
  });
  console.log(data);
  await browser.close();

})();
