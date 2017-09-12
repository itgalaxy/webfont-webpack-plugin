import fs from "fs-extra";
import glob from "glob";
import globParent from "glob-parent";
import nodify from "nodeify";
import path from "path";
import webfont from "webfont";

export default class WebfontPlugin {
    constructor(options = {}) {
        if (!options.files) {
            throw new Error("Require `files` options");
        }

        if (!options.dest) {
            throw new Error("Require `dest` options");
        }

        this.options = Object.assign({}, options);
        this.skip = false;
        this.destFilename = null;
    }

    apply(compiler) {
        compiler.plugin("invalid", function(filename) {
            const srcFiles = glob.sync(this.options.files);

            this.skip =
                filename === this.destFilename ||
                srcFiles.indexOf(filename) === -1;
        });
        compiler.plugin("run", (compilation, callback) =>
            this.compile(callback)
        );
        compiler.plugin("watch-run", (compilation, callback) => {
            if (this.skip) {
                this.skip = false;

                return callback();
            }

            return this.compile(callback);
        });
        compiler.plugin("after-emit", (compilation, callback) =>
            this.watch(compilation, callback)
        );
    }

    compile(callback) {
        const { options } = this;

        return nodify(
            webfont(options).then(result => {
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
                        destStyles = path.join(
                            destStyles,
                            `${result.config.fontName}.${result.config
                                .template}`
                        );
                    } else if (this.options.dest.outputFilename) {
                        destStyles = path.join(
                            destStyles,
                            this.options.dest.outputFilename
                        );
                    } else {
                        destStyles = path.join(
                            destStyles,
                            path
                                .basename(result.config.template)
                                .replace(".njk", "")
                        );
                    }
                }

                return Promise.all(
                    Object.keys(result).map(type => {
                        if (
                            type === "config" ||
                            type === "usedBuildInStylesTemplate"
                        ) {
                            return Promise.resolve();
                        }

                        const content = result[type];

                        if (type !== "styles") {
                            this.destFilename = path.resolve(
                                path.join(dest, `${fontName}.${type}`)
                            );
                        } else {
                            this.destFilename = path.resolve(destStyles);
                        }

                        return new Promise((resolve, reject) => {
                            fs.outputFile(this.destFilename, content, error => {
                                if (error) {
                                    return reject(new Error(error));
                                }

                                return resolve();
                            });
                        });
                    })
                );
            }),
            error => callback(error)
        );
    }

    watch(compilation, callback) {
        const globPatterns =
            typeof this.options.files === "string"
                ? [this.options.files]
                : this.options.files;

        globPatterns.forEach(globPattern => {
            const context = globParent(globPattern);

            if (compilation.contextDependencies.indexOf(context) === -1) {
                compilation.contextDependencies.push(context);
            }
        });

        return callback();
    }
}
