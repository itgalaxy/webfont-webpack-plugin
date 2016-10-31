import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import webfont from 'webfont';

function WebfontPlugin(options) {
    this.errors = [];
    this.options = options;
}

WebfontPlugin.prototype = {
    apply(compiler) {
        compiler.plugin('run', (compilerInstance, callback) => this.compile(callback));

        let watchStarted = false;

        compiler.plugin('watch-run', (watching, watchRunCallback) => {
            if (watchStarted) {
                return watchRunCallback();
            }

            watchStarted = true;

            return chokidar.watch(this.options.files).on('all', () => this.compile(watchRunCallback));
        });

        compiler.plugin('compilation', (compilation) => {
            compilation.errors = compilation.errors.concat(this.errors);
        });
    },
    compile(callback) {
        const options = this.options;

        if (!options.dest) {
            this.errors.push(new Error('Require "dest" argument'));

            return callback();
        }

        if (!options.dest.fontsDir) {
            this.errors.push(new Error('Require "fonts" property for "dest" argument'));

            return callback();
        }

        if (options.css && !options.dest.css) {
            this.errors.push(new Error(
                'Require "css" property for "dest" argument if you passed "true" "css" argument'
            ));

            return callback();
        }

        return webfont(options)
            .then((result) => {
                const promisesFs = [];
                const fontsDest = options.dest.fontsDir;
                const fontName = result.config.fontName;

                if (result.svg) {
                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            path.join(fontsDest, `${fontName}.svg`),
                            result.svg,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                if (result.ttf) {
                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            path.join(fontsDest, `${fontName}.ttf`),
                            result.ttf,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                if (result.eot) {
                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            path.join(fontsDest, `${fontName}.eot`),
                            result.eot,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                if (result.woff) {
                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            path.join(fontsDest, `${fontName}.woff`),
                            result.woff,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                if (result.woff2) {
                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            path.join(fontsDest, `${fontName}.woff2`),
                            result.woff2,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                if (result.css) {
                    const cssDest = options.dest.css;

                    promisesFs.push(new Promise(
                        (resolve, reject) => fs.outputFile(
                            cssDest,
                            result.css,
                            (error) => {
                                if (error) {
                                    return reject(error);
                                }

                                return resolve();
                            }
                        )
                    ));
                }

                return Promise.all(promisesFs).then(() => callback());
            })
            .catch((error) => {
                this.errors.push(error);
                callback();
            });
    }
};

export default WebfontPlugin;
