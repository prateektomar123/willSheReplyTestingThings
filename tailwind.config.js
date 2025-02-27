/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF9ED8',
          DEFAULT: '#FF69B4',
          dark: '#D84C9E',
        },
        secondary: {
          light: '#FFD1E8',
          DEFAULT: '#FFC0CB',
          dark: '#E6A9B3',
        },
        background: {
          light: '#FFF5F8',
          DEFAULT: '#FFF0F5',
          dark: '#2D2D2D',
        },
        text: {
          light: '#4A4A4A',
          DEFAULT: '#333333',
          dark: '#F5F5F5',
        }
      },
    },
  },
  plugins: [],
}