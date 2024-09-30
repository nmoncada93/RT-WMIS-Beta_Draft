


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

