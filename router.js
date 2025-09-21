function navigateTo(route, addToHistory = true) {
    const content = document.getElementById("app");

    if (route === "welcome") {
        content.innerHTML = `
            <div class="welcome">
                <h1>Bienvenido a SegurGest</h1>
                <button id="enterBtn">Entrar</button>
            </div>
        `;
        document.getElementById("enterBtn").onclick = () => navigateTo("menu");
        if (addToHistory) history.replaceState({ route }, "", "#welcome");
    }

    if (route === "menu") {
        content.innerHTML = `
            <div class="menu">
                <h2>Menú principal</h2>
                <ul>
                    <li><a href="#" onclick="navigateTo('seguros')">Mis seguros</a></li>
                    <li><a href="#" onclick="navigateTo('introducir')">Introducir seguro</a></li>
                    <li><a href="#" onclick="navigateTo('estado')">Estado de cuentas</a></li>
                </ul>
            </div>
        `;
        if (addToHistory) history.pushState({ route }, "", "#menu");
    }

    if (route === "seguros") {
        content.innerHTML = `<h2>Mis seguros</h2><button onclick="navigateTo('menu')">Volver al menú</button>`;
        if (addToHistory) history.pushState({ route }, "", "#seguros");
    }

    if (route === "introducir") {
        content.innerHTML = `<h2>Introducir seguro</h2><button onclick="navigateTo('menu')">Volver al menú</button>`;
        if (addToHistory) history.pushState({ route }, "", "#introducir");
    }

    if (route === "estado") {
        content.innerHTML = `<h2>Estado de cuentas</h2><button onclick="navigateTo('menu')">Volver al menú</button>`;
        if (addToHistory) history.pushState({ route }, "", "#estado");
    }
}

// Manejo del botón atrás del navegador
window.onpopstate = (event) => {
    if (event.state && event.state.route) {
        navigateTo(event.state.route, false);
    }
};

// Arranque siempre en welcome
window.onload = () => navigateTo("welcome", false);
