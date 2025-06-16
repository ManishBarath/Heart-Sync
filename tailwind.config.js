/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx","./app/**/*" ,"./component/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}