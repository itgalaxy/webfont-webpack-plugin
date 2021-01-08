import path from "path";
import Watchpack from "watchpack";
import fs from "fs-extra";
import nodify from "nodeify";
import webfont from "webfont";

export default class WebfontPlugin {
  constructor(options = {}) {
    if (!options.files) {
      throw new Error("Require `files` options");
    }

    if (!options.dest) {
      throw new Error("Require `dest` options");
    }

    this.options = Object.assign(
      {
        bail: null
      },
      options
    );
    this.pluginName = "WebfontPlugin";
    if (options.verbose) {
        console.log(this.pluginName, this.options);
    }
    this.firstRun = true;
    this.watching = null;
    this.watcher = null;
    this.needRegenerate = true;
  }

  apply(compiler) {
    this.fileDependencies = [];
    this.contextDependencies = [];

    if (typeof this.options.bail !== "boolean" && compiler.options.bail) {
      this.options.bail = compiler.options.bail;
    }

    const hookFn = callback =>
      this.generate(error =>
        callback(error && this.options.bail ? error : null)
      );

    const beforeRunFn = (compilation, callback) => hookFn(callback);
    const watchRunFn = (watching, callback) => {
      this.watching = watching;

      if (this.firstRun) {
        return hookFn(() => {
          this.firstRun = false;
          this.needRegenerate = false;

          return callback();
        });
      }

      return callback();
    };
    const doneFn = () => {
      if (this.watching && !this.watching.closed) {
        const oldWatcher = this.watcher;

        this.watcher = new Watchpack(
          this.watching.watchFileSystem
            ? this.watching.watchFileSystem.watcherOptions
            : {}
        );
        this.watcher.watch(
          this.fileDependencies,
          this.contextDependencies,
          Date.now()
        );
        this.watcher.once("change", () => {
          if (!this.needRegenerate) {
            this.needRegenerate = true;
            hookFn(() => {
              this.needRegenerate = false;
            });
          }
        });

        if (oldWatcher) {
          oldWatcher.close();
        }
      }
    };
    const watchCloseFn = () => {
      if (this.watcher) {
        this.watcher.close();
      }
    };

    if (compiler.hooks) {
      compiler.hooks.beforeRun.tapAsync(this.pluginName, beforeRunFn);
      compiler.hooks.watchRun.tapAsync(this.pluginName, watchRunFn);
      compiler.hooks.done.tap(this.pluginName, doneFn);
      compiler.hooks.watchClose.tap(this.pluginName, watchCloseFn);
    } else {
      compiler.plugin("before-run", beforeRunFn);
      compiler.plugin("watch-run", watchRunFn);
      compiler.plugin("done", doneFn);
      compiler.plugin("watch-close", watchCloseFn);
    }
  }

  generate(callback) {
    const { options } = this;

    nodify(
      webfont(options).then(result => {
        const { fontName, template } = result.config;
        const dest = path.resolve(this.options.dest);

        let destTemplate = dest;

        if (result.template) {
          if (this.options.destTemplate) {
            destTemplate = path.resolve(this.options.destTemplate);
          }

          if (result.usedBuildInTemplate) {
            destTemplate = path.join(destTemplate, `${fontName}.${template}`);
          } else {
            destTemplate = path.join(
              destTemplate,
              path.basename(template).replace(".njk", "")
            );
          }

          if (result.config.config) {
            const configFilePath = result.config.config;

            if (!this.fileDependencies.includes(configFilePath)) {
              this.fileDependencies.push(configFilePath);
            }
          }

          if (!result.usedBuildInTemplate) {
            const templateFilePath = result.config.template;

            if (!this.fileDependencies.includes(templateFilePath)) {
              this.fileDependencies.push(templateFilePath);
            }
          }

          result.glyphsData.forEach(glyphData => {
            const { srcPath } = glyphData;
            const srcDirname = path.dirname(srcPath);

            if (!this.contextDependencies.includes(srcDirname)) {
              this.contextDependencies.push(srcDirname);
            }
          });
        }

        return Promise.all(
          Object.keys(result).map(type => {
            if (
              type === "config" ||
              type === "usedBuildInTemplate" ||
              type === "glyphsData"
            ) {
              return Promise.resolve();
            }

            const content = result[type];
            let file = null;

            if (type !== "template") {
              file = path.resolve(dest, `${fontName}.${type}`);
            } else {
              file = destTemplate;
            }

            if (options.verbose) {
                console.log(this.pluginName, 'output file', file);
            }

            return fs.outputFile(file, content);
          })
        );
      }).catch(reason => console.error(reason)),
      error => callback(error)
    );
  }
}
