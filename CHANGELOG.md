# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

## 1.0.0 - 2018-04-23

- Changed: minimum require `node` version is `>=8.9.0`.

## 0.2.2 - 2018-05-11

- Fixed: protected close `chokidar` `watcher`, when `os` already kill `watcher`.

## 0.2.1 - 2018-03-30

- Fixed: check if `watchFileSystem` is available.

## 0.2.0 - 2018-03-27

- Added: `bail` option for ignore errors.
- Refactor: use other generate strategy to avoid infinity loops.

## 0.1.0 - 2018-03-21

- Added: `webpack@4` support.
- Changed: rewrite `watch` logic.
- Changed: rename plugin to `webfont-webpack-plugin`.
- Changed: drop support `webpack@2` and less version.
- Changed: minimum require `node` version is `>=6.9.5`.
- Changed: minimum require `webfont` version is `^8.0.0`.

## 0.0.1-alpha.10 - 2017-09-22

- Fixed: regression error after fix infinity recompilation.

## 0.0.1-alpha.9 - 2017-09-21

- Fixed: infinite recompilation.

## 0.0.1-alpha.8 - 2017-08-29

- Added: config option `dest.outputFilename`.

## 0.0.1-alpha.7 - 2016-12-11

- Fixed: used `run` and `watch-run` events for the compilation fonts and styles, for avoid endless compilation in watch mode.

## 0.0.1-alpha.6 - 2016-12-11

- Fixed: used the `webpack` watch system for watching changes.

## 0.0.1-alpha.5 - 2016-12-11

- Fixed: used the `make` event for the compilation fonts and styles.

## 0.0.1-alpha.4 - 2016-11-09

- Fixed: flush `errors` on every compilation.
- Chore: minimum required `webfont` version is now `^7.0.0`.
- Chore: minimum required `eslint-plugin-import` version is now `^2.2.0`.
- Chore: minimum required `eslint-plugin-itgalaxy` version is now `^26.0.0`.
- Chore: minimum required `eslint-plugin-jsx-a11y` version is now `^3.0.0`.
- Chore: minimum required `eslint-plugin-react` version is now `^6.6.0`.
- Chore: refactored for new `webfont` version.
- Chore: improved tests.

## 0.0.1-alpha.3 - 2016-11-08

- Chore: refactoring code.
- Chore: refactoring tests.

## 0.0.1-alpha.2 - 2016-11-07

- Fixed: problems with `watch`.

## 0.0.1-alpha.1 - 2016-10-31

- Chore: initial public release.
