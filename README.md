# webpack-webfont

[![NPM version](https://img.shields.io/npm/v/webpack-webfont.svg)](https://www.npmjs.org/package/webpack-webfont) 
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/webpack-webfont/master.svg?label=build)](https://travis-ci.org/itgalaxy/webpack-webfont) 
[![dependencies Status](https://david-dm.org/itgalaxy/webpack-webfont/status.svg)](https://david-dm.org/itgalaxy/webpack-webfont) 
[![devDependencies Status](https://david-dm.org/itgalaxy/webpack-webfont/dev-status.svg)](https://david-dm.org/itgalaxy/webpack-webfont?type=dev)

Webpack plugin for the [webfont](https://github.com/itgalaxy/webfont) package. 
Generating fonts from svg icons using the webpack. Supported any style (`CSS`, `SCSS` and own) of templates.

## Install

```shell
npm install --save-dev webpack-webfont
```
## Usage

For `CSS`:

```css
@import 'webfont.css';

```

```js
import WebfontPlugin from '../../Plugin';
import path from 'path';

export default {
    entry: path.resolve(__dirname, '../fixtures/entry.js'),
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.css/,
                loaders: [
                    'style',
                    'css'
                ]
            },
            {
                test: /\.scss$/,
                loaders: [
                'style',
                'css',
                'sass'
                ]
            },
            {
                loader: 'url-loader',
                test: /\.(svg|eot|ttf|woff|woff2)?$/
            },
        ]
    },

    resolve: {
        modulesDirectories: ["web_modules", "node_modules"]
    },
    plugins: [
        new WebfontPlugin({
            files: path.resolve(__dirname, '../fixtures/svg-icons/**/*.svg'),
            css: true,
            cssTemplateFontPath: './fonts/',
            dest: {
                fontsDir: path.resolve(__dirname, '../fixtures/css/fonts'),
                css: path.resolve(__dirname, '../fixtures/css/webfont.css'),
            }
        })
    ]
};
```

For `SCSS`:

```scss
@import 'webfont.scss';

a.avatar {
    &::before {
        @extend %webfont;
        content: $webfont-avatar;
    }
}
```

```js
import WebfontPlugin from '../../Plugin';
import path from 'path';

export default {
    entry: path.resolve(__dirname, '../entry.js'),
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.css/,
                loaders: [
                    'style',
                    'css'
                ]
            },
            {
                test: /\.scss$/,
                loaders: [
                  'style',
                  'css',
                  'sass'
                ]
            },
            {
                loader: 'url-loader',
                test: /\.(svg|eot|ttf|woff|woff2)?$/
            },
        ]
    },

    resolve: {
        modulesDirectories: ["web_modules", "node_modules"]
    },
    plugins: [
        new WebfontPlugin({
            files: path.resolve(__dirname, '../svg-icons/**/*.svg'),
            css: true,
            cssFormat: 'scss',
            cssTemplateFontPath: './fonts/',
            dest: {
                fontsDir: path.resolve(__dirname, '../scss/fonts'),
                css: path.resolve(__dirname, '../scss/_webfont.scss'),
            }
        })
    ]
};
```

## Options

- `General options` - see [webfont](https://github.com/itgalaxy/webfont) options. Some options are required.
- `dest` - (required) generated files.
  - `fontsDir` - (required) directory fonts saving.
  - `stylesDir` - (optional) directory styles saving.

## Related

- [webfont](https://github.com/itgalaxy/webfont) - api for this package.

## Contribution

Feel free to push your code if you agree with publishing under the MIT license.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
