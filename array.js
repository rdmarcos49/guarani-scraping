const options = [
    '-- Todas --',
    '(290) Cursos Extracurriculares',
    '(214) Diplomatura Universitaria "Diseño de Experiencias Digitales"',
    '(215) Diplomatura Universitaria en Gestión y Administración de Redes',
    '(206) Ingeniería de Sistemas',
    '(211) Licenciatura En Educación Matemática',
    '(204) Licenciatura en Ciencias Físicas',
    '(205) Licenciatura en Ciencias Matemáticas',
    '(209) Licenciatura en Tecnología Ambiental',
    '(203) Profesorado de Física',
    '(201) Profesorado de Matemática',
    '(208) Profesorado en Informática',
    '(207) Profesorado en Informática para EGB 3 y Educación Polimodal',
    '(217) Tecnicatura Universitaria en Administración de Redes Informáticas',
    '(213) Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas',
    '(212) Tecnicatura Universitaria en Programación y Administración de Redes',
    '(210) Tecnicatura en Diagnóstico por Imágenes y Radioterapia'
  ];

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
      if (theInnerTextIncludesSomeOfThisWords(option, ...CAREER_WORDS)) {
        target = option;
      }
    }
    return target;
  }

  const algo = getIngSistValue(options)

  console.log("ERA ALGO?:", algo)