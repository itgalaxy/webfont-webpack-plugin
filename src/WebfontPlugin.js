import fs from "fs-extra";
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
    this.pluginName = "WebfontPlugin";
  }

  apply(compiler) {
    this.fileDependencies = [];
    this.contextDependencies = [];

    const beforeCompileFn = (params, callback) => {
      this.generate(callback);
    };
    const afterEmitFn = (compilation, callback) => {
      let compilationFileDependencies = null;
      let addFileDependency = null;

      if (Array.isArray(compilation.fileDependencies)) {
        compilationFileDependencies = new Set(compilation.fileDependencies);
        addFileDependency = file => compilation.fileDependencies.push(file);
      } else {
        compilationFileDependencies = compilation.fileDependencies;
        addFileDependency = file => compilation.fileDependencies.add(file);
      }

      let compilationContextDependencies = null;
      let addContextDependency = null;

      if (Array.isArray(compilation.contextDependencies)) {
        compilationContextDependencies = new Set(
          compilation.contextDependencies
        );
        addContextDependency = context =>
          compilation.contextDependencies.push(context);
      } else {
        compilationContextDependencies = compilation.contextDependencies;
        addContextDependency = context =>
          compilation.contextDependencies.add(context);
      }

      for (const file of this.fileDependencies) {
        if (!compilationFileDependencies.has(file)) {
          addFileDependency(file);
        }
      }

      for (const context of this.contextDependencies) {
        if (!compilationContextDependencies.has(context)) {
          addContextDependency(context);
        }
      }

      callback();
    };

    if (compiler.hooks) {
      compiler.hooks.beforeCompile.tapAsync(this.pluginName, beforeCompileFn);
      compiler.hooks.afterEmit.tapAsync(this.pluginName, afterEmitFn);
    } else {
      compiler.plugin("before-compile", beforeCompileFn);
      compiler.plugin("after-emit", afterEmitFn);
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

          if (result.config.filePath) {
            const configFilePath = result.config.filePath;

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

            return fs.outputFile(file, content);
          })
        );
      }),
      error => callback(error)
    );
  }
}
