/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                lato: ["Lato", "sans-serif"],
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
