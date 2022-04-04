let mix = require('laravel-mix');
const { exec } = require('child_process');

mix
  .sourceMaps()
  .js('assets/js/bundle.js', 'build/js')
  .sass('assets/scss/style.scss', 'build/css')
  .copyDirectory('assets/img', 'build/img')
  .browserSync("http://ghost.test");

mix.after(() => {
  exec("A:/games/SteamLibrary/steamapps/common/Aseprite/Aseprite.exe -b build/img/tiles/sprite.ase --save-as build/img/tiles/export/tile-{slice}.png");
})