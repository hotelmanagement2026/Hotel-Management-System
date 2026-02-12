/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./App.jsx",
        "./index.jsx"
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Lato"', 'sans-serif'],
            },
            colors: {
                gold: {
                    400: '#D4AF37',
                    500: '#C5A028',
                    600: '#B08D26',
                },
                dark: {
                    900: '#0c0a09', // stone-950
                    800: '#1c1917', // stone-900
                }
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                'luxury-gradient': 'linear-gradient(to bottom, rgba(12, 10, 9, 0.3), rgba(12, 10, 9, 1))',
            }
        },
    },
    plugins: [],
}
