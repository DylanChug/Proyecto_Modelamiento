/** @type {import('tailwindcss').Config} */
export default {
content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
],
theme: {
    extend: {
        colors: {
            'primario': '#1e40af', // Un azul académico
            'secundario': '#10b981', // Un verde para tareas completadas
            'alerta': '#ef4444',   // Rojo para tareas urgentes
        },
    },
},
plugins: [],
}
// tailwind.config.js
