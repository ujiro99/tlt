module.exports = {
  plugins: [
    require('postcss-atroot'),
    require('postcss-import'),
    require('postcss-nested-vars'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
