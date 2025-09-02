/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#03071E',
          800: '#370617',
          700: '#6A040F',
          600: '#9D0208',
          500: '#DC2F02',
          400: '#E85D04',
          300: '#F48C06',
          200: '#FAA307',
          100: '#FFBA08',
        },
        accent: {
          600: '#9D0208D0',
        }
      },
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
        'latin': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    direction: true,
  },
};