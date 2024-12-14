// [A] Función para obtener el año y el día del año (DoY) a partir de una fecha
export function getSelectedDateInfo(dateString) {
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

  console.log("Solicitando descompresión a:", decompressUrl);

  return fetch(decompressUrl, { method: 'POST' })
    .then(response => {
      console.log("Respuesta de descompresión recibida:", response);
      if (!response.ok) {
        throw new Error("Error en la descompresion para la fecha seleccionada");
      }
      return response.json();
    })
    .then(decompressData => {
      console.log("Datos de descompresion:", decompressData);
      alert("Descompresion completada");
      return decompressData; // Devuelve los datos de la descompresión
    })
    .catch(error => {
      console.error("Error en la descompresion:", error);
      throw error; // Lanza el error para que se maneje en el archivo principal
    });
}

// [C] Función principal que coordina el proceso de descompresión y obtención de datos
export function processSphiData(year, doy, fetchSphiData) {
  decompressFiles(year, doy)
    .then(() => fetchSphiData(year, doy))
    .catch(error => {
      console.error("Error en el proceso de obtencion de datos:", error);
      alert("Error en el proceso de descompresión o lectura de datos para la fecha seleccionada.");
    });
}
