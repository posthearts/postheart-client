/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgrounds: {
          default: 'hsla(0, 0%, 94%, 1)',
          canvas: 'hsla(0, 0%, 98%, 1)',
          hover_clicked: 'hsla(0, 0%, 94%, 1)',
          'on-canvas': 'hsla(0, 0%, 100%, 1)',
        },
        text: {
          default: 'hsla(0, 0%, 3%, 1)',
          disabled: 'hsla(0, 0%, 55%, 1)',
          primary: 'hsla(0, 0%, 100%, 1)',
          secondary: 'hsla(0, 0%, 35%, 1)',
          'on-primary': 'hsla(0, 0%, 100%, 1)',
          tertiary: 'hsla(0, 0%, 55%, 1)',
        },
        border: {
          default: 'hsla(0, 0%, 96%, 1)',
          'input-active': 'hsla(0, 0%, 16%, 1)',
        },
        icon: {
          primary: 'hsla(0, 0%, 55%, 1)',
        },
        button: {
          neutral: 'hsla(0, 0%, 100%, 1)',
          accent: 'hsla(241, 80%, 64%, 1)',
        },
        grey: {
          '100': 'hsla(0, 0%, 70%, 1)',
        }
      },
      backgroundImage: {
        'candy-gradient': 'linear-gradient(284.27deg, #FFCFD6 17.62%, #FEEFC4 53.98%, #D8E8F3 80.16%)'
      },
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';",
        'hemis': "Hemis, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';"
      },
      letterSpacing: {
        tight: '0.1px'
      },
      lineHeight: {
        small: '18px',
      },
      boxShadow: {
        small: '0px 4px 8px 0px hsla(0, 0%, 35%, 0.1)',
        'standard': '0px 4px 10px 0px hsla(0, 0%, 17%, 0.1)',
        'x-small': '0px 2px 2px 0px hsla(0, 0%, 3%, 0.03)'
      }
    },
  },
  plugins: [],
}

