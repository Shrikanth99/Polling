/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06b6d4",      // Custom primary color
        secondary: "#ef863e",    // Custom secondary color
      },

      backgroundImage:{
        'auth-bg-img' : "url('./src/assets/images/auth-img.png')",
        'profile-bg--img' : "url('./src/assets/images/profile-bg.png')",
      }

    },
  },
  plugins: [],
}