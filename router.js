let historyStack = ['welcome']; // Pantalla inicial

export function initRouter({ onMis, onConta, onAdd }) {
    const sections = { welcome: byId('welcome'), menu: byId('menu'), mis: byId('mis'), add: byId('add'), conta: byId('conta') };
    
    function go(id) {
        Object.values(sections).forEach(s => s.classList.remove('active'));
        sections[id]?.classList.add('active');
        historyStack.push(id); // Guardar historial
        if(id==='mis') onMis?.();
        if(id==='conta') onConta?.();
        if(id==='add') onAdd?.();
        window.scrollTo({top:0, behavior:'smooth'});
    }

    function goBack() {
        if (historyStack.length > 1) {
            historyStack.pop();
            const last = historyStack[historyStack.length - 1];
            Object.values(sections).forEach(s => s.classList.remove('active'));
            sections[last]?.classList.add('active');
            return false; // No salir de la app
        } else {
            return true; // Estamos en la primera pantalla
        }
    }

    window.router = { goBack };

    document.querySelectorAll('[data-go]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            go(btn.dataset.go);
        });
    });

    return go;
}
