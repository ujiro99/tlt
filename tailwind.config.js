module.exports = {
  purge: ['./src/**/*.tsx', './src/**/*.css', './src/**/*.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
