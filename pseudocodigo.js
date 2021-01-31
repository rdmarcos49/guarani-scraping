/** (EJEMPLO SOLO PARA LA CARRERA INGENIERIA EN SISTEMAS)
 * 
 * function getObjetoDeInformacionDeLaMesa(cabecera, tr1) {
 *      (cabecera y tr1 tienen la misma longitud en)
 *      let informacionDeLaMesa = {}
 *      desde i = 0 hasta la longitud de cabecera
 *          informacionDeLaMesa = {
 *              ...informacionDeLaMesa,
 *              [cabecera[i]]: tr1[i],
 *          }
 *      return informacionDeLaMesa;
 * }
 * 
 * function getInfoCompleta(infoPrincipal, infoVerMas) {
 *      const infoCompleta = {...infoVerMas, ...infoPrincipal};
 *      return infoCompleta;
 * }
 * 
 * ir a https://g3w.exa.unicen.edu.ar/guarani3w/fecha_examen
 * esperar que cargue el div con el id "filtros"
 * tomar una referencia del primer hijo (CARRERA)
 * tomar una referencia del segundo hijo (PLAN)
 * 
 * (EN ESTE PUNTO, LOS VALUES DE LOS HIJOS SE ENCUENTRAS HASHEADOS,
 * ASI QUE SERIA IDEAL TOMAR TODOS LOS VALORES DEL SELECT, MAPEARLOS
 * Y SELECCIONAR INGENIERIA EN SISTEMAS. EN UN FUTURO DIRECTAMENTE
 * TOMAMOS LOS DATOS DE TODAS LAS CARRERAS)
 * 
 * seleccionar carrera: ingenieria en sistemas
 * seleccioanr plan: 2011 (asumimos el plan mas nuevo por ahora)
 * click en boton con id "boton-buscar"
 * 
 * hago queryselectorall para los div con clase "corte"
 * 
 * creo un array "MATERIAS"
 * 
 * let informacionTotalDeLasMesasDeExactas = []
 * 
 * para cada elemento de clase "corte":
 *      let nombreMateria = tomo el inner text del encabezado
 *      let th = querySelectorAll("table thead tr")
 *      let trs = querySelectorAll("table tbody tr)
 *      let cabecerasPrincipales = getCabecerasPrincipales(th)
 *      let cabecerasVerMas = getCabecerasVerMas(trs)
 *      let mesas = []
 * 
 *      desde i = 0 hasta i = corte.length, n = n + 2
 *          const infoPrincipal = getObjetoDeInformacionDeLaMesa(cabecerasPrincipales, trs[i])
 *          const infoVerMas = getObjetoDeInformacionDeLaMesa(cabecerasVerMas, trs[i + 1])
 *          const infoCompletaDeLasMesas = getInfoCompleta(infoPrincipal, infoVerMas)
 *          mesas.push(infoCompletaDeLasMesas)
 * 
 *      const materia = {
 *          nombreMateria: nombreMateria,
 *          mesas: mesas,
 *      }
 * 
 *      informacionTotalDeLasMesasDeExactas.push(materia)
 * 
 * console.log(informacionTotalDeLasMesasDeExactas)
 */