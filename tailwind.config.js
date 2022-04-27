module.exports = {
  content: ["./src/**/*.{svelte,js,css}"],
  theme: {
    extend: {
      colors: {
        primary: "#00c97e",
        secondary: "#FF5964",
        back: "#f8f8f8",
        fade: "#333859",
        accent: "#10162A",
        transparent: "transparent"
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}