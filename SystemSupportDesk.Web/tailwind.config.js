/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Importante para o nosso switch de tema
    theme: {
        extend: {
            colors: {
                // Cores da Marca (Roxo Kovia)
                primary: {
                    light: '#9F7AEA', // Roxo claro
                    DEFAULT: '#7C3AED', // Roxo principal (purple-600)
                    dark: '#5B21B6',  // Roxo escuro
                },
                // Modo Escuro (Fundo e Superfícies)
                dark: {
                    bg: '#121214',      // Fundo principal
                    surface: '#202024', // Cards e Sidebar
                    border: '#323238',  // Bordas
                    text: '#E1E1E6',    // Texto principal
                },
                // Modo Claro
                light: {
                    bg: '#F4F5F7',
                    surface: '#FFFFFF',
                    border: '#E1E3E6',
                    text: '#121214',
                },
                // Header Zenvia Style
                header: '#2D2D35',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Fonte padrão bonita
            }
        },
    },
    plugins: [],
}