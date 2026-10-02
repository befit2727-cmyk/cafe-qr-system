/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          50: '#fdf8f5',
          100: '#f9eee6',
          200: '#f3d9c8',
          300: '#e9bca3',
          400: '#dc9778',
          500: '#cb7452',
          600: '#b85a3c',
          700: '#994630',
          800: '#7d3a2b',
          900: '#431c15',
        },
        espresso: {
          900: '#1c1512',
          800: '#2b211b',
          700: '#3e3129',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
