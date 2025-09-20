import { byId } from './utils.js';

export function initRouter({ onMis, onConta, onAdd }) {
    const sections = {
        welcome: byId('welcome'),
        menu: byId('menu'),
        mis: byId('mis'),
        add: byId('add'),
        conta: byId('conta')
    };

    // Stack de historial
    let historyStack = ['welcome']; 

    // Función para ir a una pantalla
    function go(id) {
        if (!sections[id]) return;
        Object.values(sections).forEach(s => s.classList.remove('active'));
        sections[id].classList.add('active');
        historyStack.push(id); // Añadir a historial
        if (id === 'mis') onMis?.();
        if (id === 'conta') onConta?.();
        if (id === 'add') onAdd?.();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Función para retroceder
    function goBack() {
        if (historyStack.length > 1) {
            historyStack.pop(); // Eliminar actual
            const last = historyStack[historyStack.length - 1];
            Object.values(sections).forEach(s => s.classList.remove('active'));
            sections[last].classList.add('active');
            return false; // No salir de la app
        } else {
            return true; // Estamos en la primera pantalla
        }
    }

    // Hacer accesible desde Android
    window.router = { goBack };

    // Botones de navegación
    function setupNavigation() {
        document.querySelectorAll('[data-go]').forEach(btn => {
            btn.removeEventListener('click', btn._clickHandler);
            btn._clickHandler = (e) => {
                e.preventDefault();
                go(btn.dataset.go);
            };
            btn.addEventListener('click', btn._clickHandler);
        });
    }

    setupNavigation();

    // Observar cambios dinámicos en el DOM
    const observer = new MutationObserver(setupNavigation);
    observer.observe(document.body, { childList: true, subtree: true });

    return go;
}

