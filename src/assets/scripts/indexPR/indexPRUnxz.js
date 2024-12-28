// [A] Función para obtener el año y el día del año (DoY) a partir de una fecha
export function getSelectedDate(dateString) {
  const selectedDate = new Date(dateString);
  const year = selectedDate.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const diff = selectedDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const doy = Math.floor(diff / oneDay);
  return { year, doy };
}

// [B] Función para descomprimir los archivos en el backend
export function decompressFiles(year, doy) {
  const decompressUrl = `http://127.0.0.1:5000/indexPR/descomprimir-archivos/${year}/${doy}`;
  console.log("Requesting for unzip:", decompressUrl);

  return fetch(decompressUrl, { method: 'POST' })
    .then(response => {
      console.log("request for unzip recived:", response);
      if (!response.ok) {
        throw new Error("error unzipping for selected date");
      }
      return response.json();
    })
    .then(decompressData => {
      console.log("Decompress Data:", decompressData);
      console.log("Decompress completed");
      return decompressData; // Devuelve los datos de la descompresión
    })
    .catch(error => {
      console.error("error unzipping:", error);
      throw error; // Lanza el error para manejarlo en otro lugar
    });
}

// [C] Función principal que coordina el proceso de descompresión y obtención de datos
export function processIndexData(year, doy, fetchSphiData, fetchRotiData) {
  decompressFiles(year, doy)
    .then(() => {
      // Hacer fetch de SPHI y ROTI en paralelo
      return Promise.all([
        fetchSphiData(year, doy),  // Obtiene sphi.tmp
        fetchRotiData(year, doy)   // Obtiene roti.tmp
      ]);
    })
    .then(() => {
      console.log("sphi.tmp and roti.tmp files were successfully obtained");
    })
    .catch(error => {
      console.error("Error in data collection process:", error);
    });
}
