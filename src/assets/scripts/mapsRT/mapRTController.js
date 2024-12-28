// [A] Funcion para obtener datos crudos del backend ---------------------------
// [A.1] Fetch para SPHI
async function fetchRawSphiData() {
  if (isFetching.sphi) {
    console.warn("Solicitud SPHI en proceso. Evitando solapamiento.");
    return null; // Evita solicitudes simultáneas
  }

  isFetching.sphi = true; // Activa el flag
  try {
    //const response = await fetch(`http://127.0.0.1:5000/api/mapsRT/read-igp-sphi?file=${file}`);
    const response = await fetch(`http://127.0.0.1:5000/api/mapsRT/read-igp-sphi`);
    if (!response.ok) {
      throw new Error(`Error HTTP para SPHI: ${response.status}`);
    }
    return await response.json(); // [A.1.2] Retorna JSON obtenido
  } finally {
    isFetching.sphi = false; // Desactiva el flag
  }
}

// [A.2] Fetch para ROTI
async function fetchRawRotiData() {
  if (isFetching.roti) {
    console.warn("Solicitud ROTI en proceso. Evitando solapamiento.");
    return null; // Evita solicitudes simultáneas
  }

  isFetching.roti = true; // Activa el flag
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/mapsRT/read-igp-roti`);
    if (!response.ok) {
      throw new Error(`Error HTTP para ROTI: ${response.status}`);
    }
    return await response.json(); // [A.2.2] Retorna JSON obtenido
  } finally {
    isFetching.roti = false; // Desactiva el flag
  }
}

// [A.3] Fetch para S4
async function fetchRawS4Data() {
  if (isFetching.s4) {
    console.warn("Solicitud S4 en proceso. Evitando solapamiento.");
    return null; // Evita solicitudes simultáneas
  }

  isFetching.s4 = true; // Activa el flag
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/mapsRT/read-igp-roti`);
    if (!response.ok) {
      throw new Error(`Error HTTP para S4: ${response.status}`);
    }
    return await response.json(); // [A.3.2] Retorna JSON obtenido
  } finally {
    isFetching.s4 = false; // Desactiva el flag
  }
}


// [B] Funcion para filtrar y estructurar los datos ---------------------------
// [B.1] Filtro para SPHI
function filterSphiData(rawData) {
  const latestTime = Math.max(...rawData.map(group => group.TIME));
  const latestGroup = rawData.find(group => group.TIME === latestTime);

  if (!latestGroup) {
    console.error("No se encontró bloque de datos TIME para SPHI...");
    return [];
  }

  return [
    {
      TIME: latestGroup.TIME,
      data: latestGroup.data
        .map(cell => ({
          Longitude: cell.Longitude ?? null,
          Latitude: cell.Latitude ?? null,
          mean_sphi: cell.mean_sphi ?? null,
        }))
        .filter(cell => cell.Longitude !== null && cell.Latitude !== null),
    },
  ];
}

// [B.2] Filtro para ROTI
function filterRotiData(rawData) {
  //console.log("Datos crudos para ROTI:", rawData); // Añade este console.log
  const latestTime = Math.max(...rawData.map(group => group.TIME));
  const latestGroup = rawData.find(group => group.TIME === latestTime);

  if (!latestGroup) {
    console.error("No se encontró bloque de datos TIME para ROTI...");
    return [];
  }

  return [
    {
      TIME: latestGroup.TIME,
      data: latestGroup.data
        .map(cell => ({
          Longitude: cell.Longitude ?? null,
          Latitude: cell.Latitude ?? null,
          mean_roti: cell.mean_roti ?? null,
        }))
        .filter(cell => cell.Longitude !== null && cell.Latitude !== null),
    },
  ];
}

// [B.3] Filtro para S4
function filterS4Data(rawData) {
  const latestTime = Math.max(...rawData.map(group => group.TIME));
  const latestGroup = rawData.find(group => group.TIME === latestTime);

  if (!latestGroup) {
    console.error("No se encontró bloque de datos TIME para S4...");
    return [];
  }

  return [
    {
      TIME: latestGroup.TIME,
      data: latestGroup.data
        .map(cell => ({
          Longitude: cell.Longitude ?? null,
          Latitude: cell.Latitude ?? null,
          mean_s4: cell.mean_s4 ?? null,
        }))
        .filter(cell => cell.Longitude !== null && cell.Latitude !== null),
    },
  ];
}


// [C] Funcion principal para obtener y procesar los datos --------------------
// [C.1] Para SPHI
//export async function fetchIgpSphiData(file = "igp_sphi.dat") {
  export async function fetchIgpSphiData() {
  try {
    const rawData = await fetchRawSphiData(); // [C.1.1] Obtiene datos crudos
    if (!rawData) return null;

    return filterSphiData(rawData); // [C.1.2] Filtra datos para SPHI
  } catch (error) {
    console.error("Error al obtener o procesar los datos SPHI:", error.message);
  }
}

// [C.2] Para ROTI
export async function fetchIgpRotiData() {
  try {
    const rawData = await fetchRawRotiData(); // [C.2.1] Obtiene datos crudos

    //console.log("Contenido detallado de los datos crudos para ROTI:", rawData); // Agrega este console.log aquí.


    if (!rawData) return null;

    return filterRotiData(rawData); // [C.2.2] Filtra datos para ROTI
  } catch (error) {
    console.error("Error al obtener o procesar los datos ROTI:", error.message);
  }
}

// [C.3] Para S4
export async function fetchIgpS4Data() {
  try {
    const rawData = await fetchRawS4Data(); // [C.3.1] Obtiene datos crudos
    if (!rawData) return null;

    return filterS4Data(rawData); // [C.3.2] Filtra datos para S4
  } catch (error) {
    console.error("Error al obtener o procesar los datos S4:", error.message);
  }
}


// [GLOBAL] Flag para manejar solicitudes individuales
const isFetching = {
  sphi: false,
  roti: false,
  s4: false,
};



// REAL TIME FUNCIONANDO....................................................................
/*
// [A] Funcion para obtener datos crudos del backend ---------------------------
async function fetchRawData(file) {
  const response = await fetch(`http://127.0.0.1:5000/rtMap/get-json?file=${file}`);
  if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`); // [A.1] Maneja errores en la respuesta
  }
  return await response.json(); // [A.2] Retorna JSON obtenido
}

// [B] Funcion para filtrar y estructurar los datos ---------------------------
function filterData(rawData) {
  // [B.0] Obteniene el último TIME
  const latestTime = Math.max(...rawData.map(group => group.TIME));

  // [B.1] Filtra solo el grupo correspondiente al último TIME
  const latestGroup = rawData.find(group => group.TIME === latestTime);

  if (!latestGroup) {
      console.error("No se encontró un grupo con el último TIME.");
      return [];
  }

  // [B.2] Procesa y filtra celdas válidas del grupo seleccionado
  return [{
      TIME: latestGroup.TIME,
      data: latestGroup.data.map(cell => ({
          Longitude: cell.Longitude ?? null,
          Latitude: cell.Latitude ?? null,
          mean_sphi: cell.mean_sphi ?? null
      })).filter(cell => cell.Longitude !== null && cell.Latitude !== null)
  }];
}

// [C] Funcion principal para obtener y procesar los -------------------------
export async function fetchIonosphereData(file = 'igp_sphi.dat') {
  try {
      const rawData = await fetchRawData(file); // [C.1] Obtiene datos crudos
      console.log("Datos obtenidos:", rawData);

      const filteredData = filterData(rawData); // [C.2] Filtra datos crudos
      console.log("Datos filtrados:", filteredData);

      return filteredData; // [C.3] Retorna datos procesados
  } catch (error) {
      console.error("Error al obtener o procesar los datos:", error.message); // [C.4] Maneja errores
  }
}


*/

