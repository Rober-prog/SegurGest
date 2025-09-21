function initRouter() {
  const sections = {
    welcome: document.getElementById('welcome'),
    menu: document.getElementById('menu'),
    mis: document.getElementById('mis'),
    add: document.getElementById('add'),
    conta: document.getElementById('conta'),
  };

  function go(pageId) {
    // Ocultar todas las secciones
    Object.values(sections).forEach(s => s && s.classList.remove('active'));

    // Mostrar la sección pedida
    if (sections[pageId]) {
      sections[pageId].classList.add('active');
    }

    // Historial:
    if (pageId === 'menu') {
      // Desde el menú ya no se puede retroceder a welcome
      history.replaceState({ page: 'menu' }, 'menu', '#menu');
    } else {
      history.pushState({ page: pageId }, pageId, '#' + pageId);
    }

    // Scroll arriba siempre
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Vincular todos los botones con atributo data-go
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const target = btn.dataset.go;
        if (target) go(target);
      });
    });
  }

  // Reconfigurar si se agregan botones dinámicamente
  const observer = new MutationObserver(setupNavigation);
  observer.observe(document.body, { childList: true, subtree: true });

  // Manejo del botón atrás (navegación interna)
  window.addEventListener('popstate', e => {
    if (e.state && e.state.page) {
      go(e.state.page);
    }
  });

  // Estado inicial
  window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && sections[hash]) {
      go(hash);
    } else {
      go('welcome');
    }
  });

  setupNavigation();

  return go;
}

// Inicializar al cargar
const go = initRouter();

