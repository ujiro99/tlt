module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested-vars'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
