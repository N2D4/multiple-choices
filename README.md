# multiple-choices
A simple web app which displays multiple choice questions.

[Live Demo](https://n.ethz.ch/~wohlwenk/kapitel6/)

## Installation/Usage
This is a vanilla HTML/CSS/JS web app, meaning you can literally just double-click `src/index.html` (all the way back to 2005!)  - at least in theory, in practice, most browsers block ES6 modules on `file://`, so you'll either have to disable X-origin restrictions temporarily, or launch a localhost server (eg. with `npx serve` if you have Node.js installed).

However, we use ES6+ features which might not be available in all browsers (not quite all the way back to 2005), so for production you might want to use Babel as a transpiler. For a default set-up with Webpack, first install [Node.js](http://nodejs.org), then run `make` in the command line (on \*nix; on Windows you'll have to install Babel manually). The output can then be found in `out/prod`.

### List of Makefile targets
- `make`, `make prod`: Copies the `src` folder to `out/prod` and replaces `js/bundle.js` with the Webpack production bundle.
- `make dev`: Copies the `src` folder to `out/dev` and replaces `js/bundle.js` with the Webpack development bundle.
- `make bundle`, `make prod-bundle`: Only create the Webpack production bundle, and copy it to `out/prod-bundle.js`.
- `make dev-bundle`: Only create the Webpack development bundle, and copy it to `out/dev-bundle.js`.
- `make clean`: Clean `out` directory.
- `make clean-all`: Clean `out` and `buildtools` directories.
