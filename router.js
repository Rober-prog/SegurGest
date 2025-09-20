export function initRouter({ onMis, onConta, onAdd }) {
  // Mapeo de secciones
  const sections = {
    welcome: document.getElementById('welcome'),
    menu: document.getElementById('menu'),
    mis: document.getElementById('mis'),
    add: document.getElementById('add'),
    conta: document.getElementById('conta')
  };

  // Pila de historial para controlar retroceso
  const historyStack = [];

  // Función para cambiar de sección
  function go(id) {
    if (!sections[id]) return;

    // Guardar historial, excepto si vamos a la misma sección consecutiva
    if (historyStack[historyStack.length - 1] !== id) {
      historyStack.push(id);
    }

    // Ocultar todas y mostrar la deseada
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[id].classList.add('active');

    // Llamar callbacks si existen
    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Configurar los botones de navegación
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        go(btn.dataset.go);
      };
    });
  }

  setupNavigation();

  // Exponer función para retroceso
  function goBack() {
    if (historyStack.length > 1) {
      historyStack.pop(); // eliminar sección actual
      const prev = historyStack[historyStack.length - 1];
      go(prev);
      historyStack.pop(); // quitarla para que no se duplique en el push
    } else {
      // Aquí puedes mostrar tu popup de confirmación de salida
      return true; // indica que es la última sección
    }
    return false;
  }

  return { go, goBack };
}
