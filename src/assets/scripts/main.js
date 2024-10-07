/********************************************************
*                                                        *
*              GENERAL WEBSITE: NAV (HOVER)              *
*                                                        *
********************************************************/

// Obtener todos los enlaces de navegación
const navLinks = document.querySelectorAll(".headerNav__a");

// Obtener la URL actual sin el dominio
const currentPath = window.location.pathname;

console.log("Ruta actual:", currentPath);  // Verificar la URL actual

// Recorre todos los enlaces para comparar la URL y asignar la clase "active"
navLinks.forEach((link) => {
  // Obtener solo la ruta (pathname) del enlace
  let linkPath = new URL(link.href, window.location.origin).pathname;

  // Asegura que las rutas son consistentes (quitar / al final si lo hay)
  if (linkPath.endsWith("/")) {
    linkPath = linkPath.slice(0, -1);
  }

  console.log("Ruta del enlace:", linkPath);  // Verificar la ruta de cada enlace

  // Primero quitamos la clase 'active' de todos los enlaces (por si acaso)
  link.classList.remove('active');

  // Comparar la ruta del enlace con la URL actual
  if (currentPath === linkPath) {
    link.classList.add("active");
    console.log(`Enlace activado: ${link.href}`);  // Verificar si se añade la clase "active"
  }

  // Manejar la página de inicio (por si hay una discrepancia entre "/" y "index.html")
  if (currentPath === "/" && linkPath.includes("index.html")) {
    link.classList.add("active");
    console.log(`Enlace activado para la página de inicio: ${link.href}`);
  }
});


/********************************************************
*                                                        *
*                MONITORING PAGE: INDEX                  *
*                                                        *
********************************************************/
// Importar las imágenes usando require para que Parcel las procese
//const clock1Image = require('../images/clock1.png'); // This form is used for the back with Node.js
//const clock2Image = require('../images/clock2.png');

/*
function initializeChart() {
  const iframe = document.getElementById('dynamicIframe').contentWindow;
  const chartContainer = iframe.document.getElementById('chart-container');
}*/

document.addEventListener('DOMContentLoaded', function() {
  const monitoringSelector = document.getElementById('monitoringSelector');
  const iframeContainer = document.getElementById('iframeContainer');  // Contenedor del iframe
  const dynamicIframe = document.getElementById('dynamicIframe');  // El iframe dinámico para mostrar los gráficos

  if (monitoringSelector) {
      monitoringSelector.addEventListener('change', function() {
          const selectedValue = this.value;

          // Mapear las opciones del select a los gráficos HTML generados por Pyecharts
          const chartPaths = {
              MAC1_s4_time: './assets/images/MAC1_s4_time.html',
              MAC1_sphi_time: './assets/images/MAC1_sphi_time.html',
              MAC1_rotil1_time: './assets/images/MAC1_rotil1_time.html',

              YELL_s4_time: './assets/images/YELL_s4_time.html',
              YELL_sphi_time: './assets/images/YELL_sphi_time.html',
              YELL_rotil1_time: './assets/images/YELL_rotil1_time.html'
          };

          // Si la selección está en el mapa, mostramos el gráfico correspondiente
          if (chartPaths[selectedValue]) {
              console.log('Ruta del gráfico:', chartPaths[selectedValue]);  // Verificar la ruta del gráfico
              dynamicIframe.src = chartPaths[selectedValue];  // Cambiar el gráfico en el iframe
              iframeContainer.style.display = 'block';  // Mostrar el contenedor del iframe
              //dynamicIframe.style.display = 'block';  // Asegurarnos de que se muestre el iframe
          } else {
            iframeContainer.style.display = 'none';  // Ocultar el contenedor si no hay selección válida
              //dynamicIframe.src = './assets/images/placeholder.png';  // Volver al placeholder si no hay selección
          }
      });
      iframeContainer.style.display = 'none';
  } else {
      console.error("El elemento 'monitoringSelector' no fue encontrado en el DOM");
  }
});

/********************************************************
*                                                        *
*                MONITORING PAGE: MAPS                   *
*                                                        *
********************************************************/
const mapS4 = document.querySelector('.mapBox__s4H3');
const s4 = document.querySelector('.mapBox__s4Img');

const mapRotil = document.querySelector('.mapBox__rotilH3');
const rotil = document.querySelector('.mapBox__rotilImg');

const mapSphi = document.querySelector('.mapBox__sphiH3');
const sphi = document.querySelector('.mapBox__sphiImg');

// Función para alternar visibilidad de la imagen
function toggleVisibility(img, icon) {
    if (img.style.display === 'none') {
        img.style.display = 'block';

    } else {
        img.style.display = 'none';

    }
}

// Event listeners para los títulos
mapS4.addEventListener('click', () => {
    toggleVisibility(s4);
});

mapRotil.addEventListener('click', () => {
    toggleVisibility(rotil);
});

mapSphi.addEventListener('click', () => {
  toggleVisibility(sphi);
});

/********************************************************
*                                                        *
*                MONITORING PAGE: PAST RECORDS           *
*                                                        *
********************************************************/


// Establecer la fecha máxima al día de hoy
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Enero es 0
  const yyyy = today.getFullYear();
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  document.getElementById("dateInput").setAttribute("max", formattedDate);
});

document.getElementById("dateInput").addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const month = selectedDate.getMonth(); // 0 = enero, 1 = febrero, ..., 7 = agosto, 8 = septiembre
  const septiembreImage = document.getElementById("septiembreImage");
  const agostoImage = document.getElementById("agostoImage");
  // Ocultar ambas imágenes por defecto
  septiembreImage.style.display = "none";
  agostoImage.style.display = "none";
  // Mostrar la imagen correspondiente
  if (month === 7) {
    // Agosto
    agostoImage.style.display = "block";
  } else if (month === 8) {
    // Septiembre
    septiembreImage.style.display = "block";
  }
});



