# webfont-webpack-plugin

[![NPM version](https://img.shields.io/npm/v/webfont-webpack-plugin.svg)](https://www.npmjs.org/package/webfont-webpack-plugin)
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/webfont-webpack-plugin/master.svg?label=build)](https://travis-ci.org/itgalaxy/webfont-webpack-plugin)
[![Build status](https://ci.appveyor.com/api/projects/status/355nglgpgweh2i8a/branch/master?svg=true)](https://ci.appveyor.com/project/evilebottnawi/webfont-webpack-plugin/branch/master)
[![dependencies Status](https://david-dm.org/itgalaxy/webfont-webpack-plugin/status.svg)](https://david-dm.org/itgalaxy/webfont-webpack-plugin)
[![devDependencies Status](https://david-dm.org/itgalaxy/webfont-webpack-plugin/dev-status.svg)](https://david-dm.org/itgalaxy/webfont-webpack-plugin?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/itgalaxy/webfont-webpack-plugin.svg)](https://greenkeeper.io)

Webpack plugin for the [webfont](https://github.com/itgalaxy/webfont) package.
Generating web fonts from svg icons and ttf fonts using the webpack. Supported any style (`CSS`, `SCSS` and own) of templates.

## Install

```shell
npm install --save-dev webfont-webpack-plugin
```

## Usage

Example for `CSS` with directly `import` (will be works for `SCSS`/`Less`/Etc):

**entry.js**

```js
import "webfont.css";
```

**webpack.config.js**

```js
import WebfontPlugin from "webfont-webpack-plugin";
import path from "path";

export default {
  entry: path.resolve(__dirname, "../entry.js"),
  output: {
    path: path.resolve(__dirname, "../dist")
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ["style-loader", "css-loader"]
      },
      {
        loader: "url-loader",
        test: /\.(svg|eot|ttf|woff|woff2)?$/
      }
    ]
  },
  plugins: [
    new WebfontPlugin({
      files: path.resolve(__dirname, "../fixtures/svg-icons/**/*.svg"),
      dest: path.resolve(__dirname, "../fixtures/css/fonts"),
      destTemplate: path.resolve(__dirname, "../fixtures/css")
    })
  ]
};
```

Example for `SCSS` with `import` inside `SCSS` file (will be works for `CSS`/`SCSS`/`Less`/Etc):

**any-file.scss**

```scss
@import "webfont.scss";

a.avatar {
  &::before {
    @extend %webfont;
    content: $webfont-avatar;
  }
}
```

**entry.js**

```js
import "any-file.scss";
```

**webpack.config.js**

```js
import WebfontPlugin from "webfont-webpack-plugin";
import path from "path";

export default {
  entry: path.resolve(__dirname, "../entry.js"),
  output: {
    path: path.resolve(__dirname, "../build")
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        loader: "url-loader",
        test: /\.(svg|eot|ttf|woff|woff2)?$/
      }
    ]
  },
  plugins: [
    new WebfontPlugin({
      files: path.resolve(__dirname, "../fixtures/svg-icons/**/*.svg"),
      dest: path.resolve(__dirname, "../fixtures/css/fonts"),
      destTemplate: path.resolve(__dirname, "../fixtures/css")
    })
  ]
};
```

## Options

- `files` - (required) `glob` for files (non `svg` files ignored by default).
- `dest` - (required) path to generated files.
- `destTemplate` - (optional) path to generated template directory (if not passed used `dest` option value).
- `bail` - (optional) break build if generation have error.
- additional options - see [webfont](https://github.com/itgalaxy/webfont) options.

## Related

- [webfont](https://github.com/itgalaxy/webfont) - api for this package.

## Contribution

Feel free to push your code if you agree with publishing under the MIT license.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
