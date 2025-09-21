// router.js
let currentScreen = "welcome"; // pantalla inicial

function navigateTo(screen) {
    const content = document.getElementById("app");

    if (screen === "welcome") {
        // 🚫 No permitimos volver a welcome si ya se entró
        if (currentScreen !== "welcome") return;
        content.innerHTML = `
            <div class="welcome-screen">
                <h1>Bienvenido</h1>
                <button onclick="navigateTo('menu')">Entrar</button>
            </div>
        `;
    }

    if (screen === "menu") {
        content.innerHTML = `
            <div class="menu-screen">
                <h2>Menú Principal</h2>
                <ul>
                    <li onclick="navigateTo('seguros')">Mis seguros</li>
                    <li onclick="navigateTo('introducir')">Introducir seguro</li>
                    <li onclick="navigateTo('estado')">Estado de cuentas</li>
                </ul>
            </div>
        `;
    }

    if (screen === "seguros") {
        content.innerHTML = `
            <div class="sub-screen">
                <h2>Mis Seguros</h2>
                <button onclick="navigateTo('menu')">Volver al menú</button>
            </div>
        `;
    }

    if (screen === "introducir") {
        content.innerHTML = `
            <div class="sub-screen">
                <h2>Introducir Seguro</h2>
                <button onclick="navigateTo('menu')">Volver al menú</button>
            </div>
        `;
    }

    if (screen === "estado") {
        content.innerHTML = `
            <div class="sub-screen">
                <h2>Estado de cuentas</h2>
                <button onclick="navigateTo('menu')">Volver al menú</button>
            </div>
        `;
    }

    currentScreen = screen;
}

// Manejo del botón físico de retroceso Android
document.addEventListener("backbutton", function (e) {
    e.preventDefault();

    if (currentScreen === "welcome") {
        // 🚫 Nunca volver a welcome → forzamos a menú
        navigateTo("menu");
        return;
    }

    if (currentScreen === "menu") {
        if (confirm("¿Deseas salir de la aplicación?")) {
            navigator.app.exitApp();
        }
        return;
    }

    // Si estamos en cualquier otra pantalla, retrocede al menú
    navigateTo("menu");
}, false);

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    navigateTo("welcome");
});
