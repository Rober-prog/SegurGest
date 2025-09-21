function go(pageId) {
  // Ocultar todas las secciones
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Mostrar la sección solicitada
  const section = document.getElementById(pageId);
  if (section) section.classList.add('active');

  // Manipular el historial
  if (pageId === 'menu') {
    // El menú reemplaza el historial (no se puede volver a welcome)
    history.replaceState({ page: 'menu' }, 'menu', '#menu');
  } else {
    // El resto de pantallas se añaden al historial normal
    history.pushState({ page: pageId }, pageId, '#' + pageId);
  }
}

// Manejo del botón atrás del navegador (o WebView)
window.addEventListener('popstate', function (event) {
  if (event.state && event.state.page) {
    go(event.state.page);
  }
});

// Inicializar la vista según la URL
window.addEventListener('load', function () {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    go(hash);
  } else {
    go('welcome'); // Pantalla inicial
  }
});

