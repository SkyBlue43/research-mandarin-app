/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',     // For Next.js 13+ app directory
      './pages/**/*.{js,ts,jsx,tsx}',   // For pages directory
      './components/**/*.{js,ts,jsx,tsx}', // If you have components folder
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  