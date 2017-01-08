import chokidar from 'chokidar';
import fs from 'fs-extra';
import nodify from 'nodeify';
import path from 'path';
import webfont from 'webfont';

export default class WebfontPlugin {
    constructor(options = {}) {
        if (!options.files) {
            throw new Error('Require `files` options');
        }

        if (!options.dest) {
            throw new Error('Require `dest` options');
        }

        this.options = Object.assign({}, options);

        this.errors = [];
        this.watcher = null;
    }

    apply(compiler) {
        compiler.plugin('run', (compilerInstance, done) => this.compile(done));

        compiler.plugin('watch-run', (watching, done) => {
            if (this.watcher) {
                this.errors = [];

                return done();
            }

            this.watcher = chokidar.watch(this.options.files);

            this.watcher.on('ready', () => {
                this.watcher.on('all', () => {
                    // Need show errors on output
                    // eslint-disable-next-line no-empty-function
                    this.compile(() => {
                        this.errors.forEach((error) => {
                            // eslint-disable-next-line no-console
                            console.log(`[webpack-webfont] ${error.stack}` || error.message);
                        });
                    });
                });
            });

            this.watcher.on('error', (error) => {
                // eslint-disable-next-line no-console
                console.log(`[webpack-webfont] ${error.stack}` || error.message);
            });

            return this.compile(done);
        });

        compiler.plugin('compilation', (compilation) => {
            compilation.errors = compilation.errors.concat(this.errors);
        });
    }

    compile(callback) {
        const { options } = this;

        return nodify(
            webfont(options)
                .then((result) => {
                    const { fontName } = result.config;
                    const dest = path.resolve(this.options.dest.fontsDir);

                    let destStyles = null;

                    if (result.styles) {
                        if (this.options.dest.stylesDir) {
                            destStyles = path.resolve(this.options.dest.stylesDir);
                        }

                        if (!destStyles) {
                            destStyles = dest;
                        }

                        if (result.usedBuildInStylesTemplate) {
                            destStyles = path.join(destStyles, `${result.config.fontName}.${result.config.template}`);
                        } else {
                            destStyles = path.join(
                                destStyles,
                                path.basename(result.config.template).replace('.njk', '')
                            );
                        }
                    }

                    return Promise.all(Object.keys(result).map((type) => {
                        if (type === 'config' || type === 'usedBuildInStylesTemplate') {
                            return Promise.resolve();
                        }

                        const content = result[type];
                        let destFilename = null;

                        if (type !== 'styles') {
                            destFilename = path.resolve(path.join(dest, `${fontName}.${type}`));
                        } else {
                            destFilename = path.resolve(destStyles);
                        }

                        return new Promise((resolve, reject) => {
                            fs.outputFile(destFilename, content, (error) => {
                                if (error) {
                                    return reject(new Error(error));
                                }

                                return resolve();
                            });
                        });
                    }));
                }),
            (error) => {
                if (error) {
                    this.errors.push(error);
                }

                return callback();
            }
        );
    }
}
