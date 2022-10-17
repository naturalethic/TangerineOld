/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sacramento: "Sacramento",
                iosevka: "Iosevka",
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
    variants: {
        extend: {
            visibility: ["group-hover"],
        },
    },
};
