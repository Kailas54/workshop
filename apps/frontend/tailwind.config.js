/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    preflight: false, // Don't reset existing CSS for the workshop UI
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
