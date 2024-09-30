// Función para cambiar el contenido del iframe dinámicamente
function loadIframeDynamically(selectedValue) {
  const iframe = document.getElementById('chartIframe');
  const chartUrls = {
      clock5: './assets/charts/chart5.html',  // Ruta del gráfico antiguo 5
      clock6: './assets/charts/chart6.html',  // Ruta del gráfico antiguo 6
      chart10: './assets/charts/chart10.html',  // Nuevo gráfico 10
      chart11: './assets/charts/chart11.html'   // Nuevo gráfico 11
  };
  iframe.src = chartUrls[selectedValue];  // Cambiar la URL del iframe
}

// Escuchar el cambio en el <select>
document.getElementById('monitoringSelector').addEventListener('change', function() {
  const selectedValue = this.value;
  loadIframeDynamically(selectedValue);  // Cambiar el iframe según la selección
});

//--------------------------------------------------------------------------

/*
function loadIframeDynamically(selectedValue) {
  const iframe = document.getElementById('chartIframe');
  const chartUrls = {
      clock5: './assets/charts/chart5.html',  // Ruta del gráfico 5
      clock6: './assets/charts/chart6.html',  // Ruta del gráfico 6
  };
  iframe.src = chartUrls[selectedValue];  // Cambia la URL del iframe
}
*/
//----------------------------------------------
function displayClockOutputsPlot() {
  // Obtenemos el valor de la opción seleccionada
  const selectedValue = document.getElementById("monitoringSelector").value;

  // Obtenemos las imágenes por su id
  const clock1Image = document.getElementById("clock1");
  const clock2Image = document.getElementById("clock2");

  //const clock3Image = document.getElementById("clock3");
  //const clock2Image = document.getElementById("d2e4ff1b26174b7b9924d7eb4aba138a");

    // Obtenemos los contenedores de los gráficos por su id
    const chart1Div = document.getElementById("chart1");
    const chart2Div = document.getElementById("chart2");
    const chart5Div = document.getElementById("chart5");
    const chart6Div = document.getElementById("chart6");


  // Ocultamos todas las imágenes y gráficos al principio
  clock1Image.style.display = "none";
  clock2Image.style.display = "none";
  chart1Div.style.display = "none";
  chart2Div.style.display = "none";
  chart5Div.style.display = "none";
  chart6Div.style.display = "none";

  // Mostramos la imagen o gráfico correspondiente según la selección
  if (selectedValue === "clock1") {
    clock1Image.style.display = "block";
  } else if (selectedValue === "clock2") {
    clock2Image.style.display = "block";
  } else if (selectedValue === "chart1") {
    chart1Div.style.display = "block";
  } else if (selectedValue === "chart2") {
    chart2Div.style.display = "block";
  } else if (selectedValue === "chart5") {
    chart5Div.style.display = "block"; // Mostramos el iframe del gráfico 5
  } else if (selectedValue === "chart6") {
    chart6Div.style.display = "block"; // Mostramos el iframe del gráfico 6
  }
}



//-------------------------MENU----------------------------------------------------------
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

//---------------------------------------------MAP BOX MONITORING PAGE

const map1 = document.querySelector('.mapBox__map1');
const clock1 = document.querySelector('.clock1');

const map2 = document.querySelector('.mapBox__map2');
const clock2 = document.querySelector('.clock2');


// Función para alternar visibilidad de la imagen
function toggleVisibility(img, icon) {
    if (img.style.display === 'none') {
        img.style.display = 'block';

    } else {
        img.style.display = 'none';

    }
}

// Event listeners para los títulos
map1.addEventListener('click', () => {
    toggleVisibility(clock1);
});

map2.addEventListener('click', () => {
    toggleVisibility(clock2);
});

//-------------------------------------------------------------------------

