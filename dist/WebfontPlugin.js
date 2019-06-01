"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _watchpack = _interopRequireDefault(require("watchpack"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _nodeify = _interopRequireDefault(require("nodeify"));

var _webfont = _interopRequireDefault(require("webfont"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WebfontPlugin {
  constructor(options = {}) {
    if (!options.files) {
      throw new Error("Require `files` options");
    }

    if (!options.dest) {
      throw new Error("Require `dest` options");
    }

    this.options = Object.assign({
      bail: null
    }, options);
    this.pluginName = "WebfontPlugin";
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

    const hookFn = callback => this.generate(error => callback(error && this.options.bail ? error : null));

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
        this.watcher = new _watchpack.default(this.watching.watchFileSystem ? this.watching.watchFileSystem.watcherOptions : {});
        this.watcher.watch(this.fileDependencies, this.contextDependencies, Date.now());
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
    const {
      options
    } = this;
    (0, _nodeify.default)((0, _webfont.default)(options).then(result => {
      const {
        fontName,
        template
      } = result.config;

      const dest = _path.default.resolve(this.options.dest);

      let destTemplate = dest;

      if (result.template) {
        if (this.options.destTemplate) {
          destTemplate = _path.default.resolve(this.options.destTemplate);
        }

        if (result.usedBuildInTemplate) {
          destTemplate = _path.default.join(destTemplate, `${fontName}.${template}`);
        } else {
          destTemplate = _path.default.join(destTemplate, _path.default.basename(template).replace(".njk", ""));
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

        if (result.glyphsData) {
          result.glyphsData.forEach(glyphData => {
            const {
              srcPath
            } = glyphData;

            const srcDirname = _path.default.dirname(srcPath);

            if (!this.contextDependencies.includes(srcDirname)) {
              this.contextDependencies.push(srcDirname);
            }
          });
        }

        if (result.fontsData) {
          result.fontsData.forEach(fontData => {
            const {
              srcPath
            } = fontData;

            const srcDirname = _path.default.dirname(srcPath);

            if (!this.contextDependencies.includes(srcDirname)) {
              this.contextDependencies.push(srcDirname);
            }
          });
        }
      }

      return Promise.all(Object.keys(result).map(type => {
        if (type === "config" || type === "usedBuildInTemplate" || type === "glyphsData" || type === "fontsData") {
          return Promise.resolve();
        }

        let content = result[type]; // After adding TTF mode multiple files can be returned.
        //

        if (!Array.isArray(content)) {
          if (type !== "template") {
            content = [{
              name: _path.default.resolve(dest, `${fontName}.${type}`),
              buffer: content
            }];
          } else {
            content = [{
              name: destTemplate,
              buffer: content
            }];
          }
        } else {
          content.forEach(file => {
            file.name = _path.default.resolve(dest, _path.default.basename(file.name));
          });
        }

        return Promise.all(content.map(file => {
          return _fsExtra.default.outputFile(file.name, file.buffer);
        }));
      }));
    }), error => callback(error));
  }

}

exports.default = WebfontPlugin;