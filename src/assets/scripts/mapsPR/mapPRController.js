
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
  return rawData.map(group => ({
      TIME: group.TIME, // [B.1] Mantener el contexto de tiempo para cada grupo
      data: group.data.map(cell => ({
          Longitude: cell.Longitude ?? null, // [B.2] Valida que haya coordenadas de longitud
          Latitude: cell.Latitude ?? null,  // [B.3] Valida que haya coordenadas de latitud
          mean_sphi: cell.mean_sphi ?? null // [B.4] Valida que el indice tenga un valor
      })).filter(cell => cell.Longitude !== null && cell.Latitude !== null) // [B.5] Filtrar celdas válidas
  }));
}

// [C] Funcion principal para obtener y procesar los datos --------------------
export async function fetchIonosphereData(file = 'igp_sphi.dat') {
  try {
      const rawData = await fetchRawData(file); // [C.1] Obtiene datos RAW
      console.log("Datos obtenidos:", rawData);

      const filteredData = filterData(rawData); // [C.2] Filtra datos RAW
      console.log("Datos filtrados:", filteredData);

      return filteredData; // [C.3] Retorna datos procesados
  } catch (error) {
      console.error("Error al obtener o procesar los datos:", error.message); // [C.4] Maneja errores
  }
}


