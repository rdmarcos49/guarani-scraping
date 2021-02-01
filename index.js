const puppeteer = require('puppeteer');
const fs = require('fs');

const dir = './screenshots';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

function getObjetoDeInformacionDeLaMesa(cabecera, tr1) {
  let informacionDeLaMesa = {}
  for (let i = 0; i < cabecera.length; i++) {
    informacionDeLaMesa = {
      ...informacionDeLaMesa,
      [cabecera[i]]: tr1[i],
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
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const actualOptionText = option.innerText;
    if (window.theInnerTextIncludesSomeOfThisWords(actualOptionText, ...CAREER_WORDS)) {
      target = option.value;
    }
  }
  return target;
}

function getPlan2011(options) {
  const PLAN = ['2011'];
  let target = null;
  for (const option of options) {
    const actualOptionWords = option.innerText;
    if (theInnerTextIncludesSomeOfThisWords(actualOptionWords, ...PLAN)) {
      target = option.value;
    }
  }
  return target;
}

const URL = 'https://g3w.exa.unicen.edu.ar/guarani3w/fecha_examen';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await page.goto(URL, {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'screenshots/initOfPage.png'})
  await page.exposeFunction("getIngSistValue", getIngSistValue);
  await page.exposeFunction("theInnerTextIncludesSomeOfThisWords", theInnerTextIncludesSomeOfThisWords);
  const career = await page.evaluate(() => {
    const options = document.querySelectorAll('#formulario_filtro-carrera option');
    const ingSistValue = window.getIngSistValue(options);
    return ingSistValue;
  })
  console.log(career);
  await page.select('#formulario_filtro-carrera', career);
  await page.screenshot({path: 'screenshots/selectedCareer.png'})

  /*
  const plan = await page.evaluate(() => {
    const options = document.querySelectorAll('#formulario_filtro-plan option');
    const plan2011Value = getPlan2011(options);
    return plan2011Value;
  });
  await page.select('#formulario_filtro-plan', plan);
  await page.screenshot({path: 'screenshots/selecterPlan.png'})

  await pageEvaluate(() => {
    const button = document.getElementById('boton_buscar');
    button.click();
  })
  await page.screenshot({path: 'screenshots/searchResult.png'})

  */
  
})();
