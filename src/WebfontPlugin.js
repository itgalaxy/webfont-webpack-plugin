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
  }

  apply(compiler) {
    const beforeCompileFn = (params, callback) => {
      this.generate(callback);
    };

    if (compiler.hooks) {
      compiler.hooks.beforeCompile.tapAsync("WebfontPlugin", beforeCompileFn);
    } else {
      compiler.plugin("before-compile", beforeCompileFn);
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
        }

        return Promise.all(
          Object.keys(result).map(type => {
            if (type === "config" || type === "usedBuildInTemplate" || type === "glyphsData") {
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
