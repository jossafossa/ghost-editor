let mix = require('laravel-mix');

mix
  .sourceMaps()
  .js('assets/js/bundle.js', 'build/js/bundle.js')
  .sass('assets/scss/style.scss', 'build/css/style.css')
  .copyDirectory('assets/img', 'build/img')
  .browserSync("http://ghost.test");
