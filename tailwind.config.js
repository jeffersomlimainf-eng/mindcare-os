/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#1392ec",
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
                "sintropia-bg": "#F9F9FB",
                "sintropia-text": "#2D2D44",
                "sintropia-sub": "#555566",
                "sintropia-accent": "#9EA5FF",
                "sintropia-accent-to": "#B87AFF",
            },
            fontFamily: {
                "sans": ["Inter", "sans-serif"],
                "serif": ["DM Serif Display", "serif"]
            },
            borderRadius: {
                "DEFAULT": "8px",
                "lg": "8px",
                "xl": "12px",
                "2xl": "24px",
                "3xl": "32px",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
