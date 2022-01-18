module.exports = {
    purge: ['./index.html', './src/**/*.{svelte,js,ts}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                transparent: 'transparent',
                current: 'currentColor',
                fore: "#333859",
                back: "#10162a",
                accent: "#484c6a",
                primary: "#00c97e",
                white: "#ffffff",
                black: "#000000",
                gray: "#5c6070",
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
}