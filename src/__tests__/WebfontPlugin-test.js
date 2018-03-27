import WebfontPlugin from "../WebfontPlugin";
import del from "del";
import fs from "fs-extra";
import path from "path";
import test from "ava";
import webpack from "webpack";
import webpackConfigBase from "./fixtures/config-base";

const webfontPluginBaseConfig = {
  dest: path.join(__dirname, "fixtures/css/fonts"),
  destTemplate: path.join(__dirname, "fixtures/css"),
  files: path.join(__dirname, "fixtures/svg-icons/**/*.svg"),
  template: "css",
  templateFontPath: "./fonts/"
};

test("should export `WebfontPlugin` as a class", t => {
  t.true(typeof WebfontPlugin === "function");
});

test("should throw error if not passed `files`", t => {
  t.throws(() => new WebfontPlugin(), "Require `files` options");
});

test("should throw error if not passed `dest`", t => {
  t.throws(
    () =>
      new WebfontPlugin({
        files: "**/*.svg"
      }),
    "Require `dest` options"
  );
});

const fixtures = path.resolve(__dirname, "fixtures");

test.before(() =>
  del([
    path.resolve(fixtures, "build"),
    path.resolve(fixtures, "css/fonts"),
    path.resolve(fixtures, "css/webfont.css")
  ])
);

test.afterEach(() =>
  del([
    path.resolve(fixtures, "build"),
    path.resolve(fixtures, "css/fonts"),
    path.resolve(fixtures, "css/webfont.css")
  ])
);

test.cb("should generate fonts and build-in template", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig);

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (webpackError, stats) => {
    if (webpackError) {
      throw webpackError;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const files = [
      path.resolve(fixtures, "css/fonts/webfont.eot"),
      path.resolve(fixtures, "css/fonts/webfont.svg"),
      path.resolve(fixtures, "css/fonts/webfont.woff"),
      path.resolve(fixtures, "css/fonts/webfont.woff2"),
      path.resolve(fixtures, "css/css/webfont.css")
    ];

    const promises = [];

    files.forEach(pathToFile => {
      promises.push(fs.pathExists(pathToFile));
    });

    return Promise.all(promises)
      .then(() => t.end())
      .catch(error => {
        t.fail(error);
        t.end();
      });
  });
});

test.cb("should generate fonts and external template", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig, {
    template: path.resolve(fixtures, "templates/webfont.css.njk")
  });

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (webpackError, stats) => {
    if (webpackError) {
      throw webpackError;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const files = [
      path.resolve(fixtures, "css/fonts/webfont.eot"),
      path.resolve(fixtures, "css/fonts/webfont.svg"),
      path.resolve(fixtures, "css/fonts/webfont.woff"),
      path.resolve(fixtures, "css/fonts/webfont.woff2"),
      path.resolve(fixtures, "css/css/webfont.css")
    ];

    const promises = [];

    files.forEach(pathToFile => {
      promises.push(fs.pathExists(pathToFile));
    });

    return Promise.all(promises)
      .then(() => t.end())
      .catch(error => {
        t.fail(error);
        t.end();
      });
  });
});

test.cb("should generate fonts and external config", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig, {
    config: path.resolve(fixtures, "config/.webfontrc")
  });

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (webpackError, stats) => {
    if (webpackError) {
      throw webpackError;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const files = [
      path.resolve(fixtures, "css/fonts/webfont.eot"),
      path.resolve(fixtures, "css/fonts/webfont.svg"),
      path.resolve(fixtures, "css/fonts/webfont.woff"),
      path.resolve(fixtures, "css/fonts/webfont.woff2"),
      path.resolve(fixtures, "css/css/webfont.css")
    ];

    const promises = [];

    files.forEach(pathToFile => {
      promises.push(fs.pathExists(pathToFile));
    });

    return Promise.all(promises)
      .then(() => t.end())
      .catch(error => {
        t.fail(error);
        t.end();
      });
  });
});

test.cb(
  "should generate and regenerate fonts and build-in template in watch mode",
  t => {
    t.plan(4);

    const options = Object.assign({}, webfontPluginBaseConfig);

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (webpackError, stats) => {
      if (webpackError) {
        throw webpackError;
      }

      countCompilation++;

      t.true(
        stats.compilation.warnings.length === 0,
        "no compilation warnings"
      );
      t.true(stats.compilation.errors.length === 0, "no compilation error");

      const files = [
        path.resolve(fixtures, "css/fonts/webfont.eot"),
        path.resolve(fixtures, "css/fonts/webfont.svg"),
        path.resolve(fixtures, "css/fonts/webfont.woff"),
        path.resolve(fixtures, "css/fonts/webfont.woff2"),
        path.resolve(fixtures, "css/css/webfont.css")
      ];

      const promises = [];

      files.forEach(pathToFile => {
        promises.push(fs.pathExists(pathToFile));
      });

      return Promise.all(promises)
        .then(() => {
          if (countCompilation === 2) {
            watching.close();

            return t.end();
          }

          return true;
        })
        .catch(error => {
          t.fail(error);
          t.end();
        });
    });

    Promise.resolve()
      .then(() => fs.readFile(path.resolve(fixtures, "svg-icons/avatar.svg")))
      .then(content =>
        fs.writeFile(path.resolve(fixtures, "svg-icons/avatar.svg"), content)
      )
      .catch(error => {
        t.fail(error);
        t.end();
      });
  }
);

test.cb(
  "should generate and regenerate fonts and external template in watch mode",
  t => {
    t.plan(4);

    const options = Object.assign({}, webfontPluginBaseConfig, {
      template: path.resolve(fixtures, "templates/webfont.css.njk")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (webpackError, stats) => {
      if (webpackError) {
        throw webpackError;
      }

      countCompilation++;

      t.true(
        stats.compilation.warnings.length === 0,
        "no compilation warnings"
      );
      t.true(stats.compilation.errors.length === 0, "no compilation error");

      const files = [
        path.resolve(fixtures, "css/fonts/webfont.eot"),
        path.resolve(fixtures, "css/fonts/webfont.svg"),
        path.resolve(fixtures, "css/fonts/webfont.woff"),
        path.resolve(fixtures, "css/fonts/webfont.woff2"),
        path.resolve(fixtures, "css/css/webfont.css")
      ];

      const promises = [];

      files.forEach(pathToFile => {
        promises.push(fs.pathExists(pathToFile));
      });

      return Promise.all(promises)
        .then(() => {
          if (countCompilation === 2) {
            watching.close();

            return t.end();
          }

          return true;
        })
        .catch(error => {
          t.fail(error);
          t.end();
        });
    });

    Promise.resolve()
      .then(() =>
        fs.readFile(path.resolve(fixtures, "templates/webfont.css.njk"))
      )
      .then(content =>
        fs.writeFile(
          path.resolve(fixtures, "templates/webfont.css.njk"),
          content
        )
      )
      .catch(error => {
        t.fail(error);
        t.end();
      });
  }
);

test.cb(
  "should generate and regenerate fonts and external config in watch mode",
  t => {
    t.plan(4);

    const options = Object.assign({}, webfontPluginBaseConfig, {
      config: path.resolve(fixtures, ".webfontrc")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (webpackError, stats) => {
      if (webpackError) {
        throw webpackError;
      }

      countCompilation++;

      t.true(
        stats.compilation.warnings.length === 0,
        "no compilation warnings"
      );
      t.true(stats.compilation.errors.length === 0, "no compilation error");

      const files = [
        path.resolve(fixtures, "css/fonts/webfont.eot"),
        path.resolve(fixtures, "css/fonts/webfont.svg"),
        path.resolve(fixtures, "css/fonts/webfont.woff"),
        path.resolve(fixtures, "css/fonts/webfont.woff2"),
        path.resolve(fixtures, "css/css/webfont.css")
      ];

      const promises = [];

      files.forEach(pathToFile => {
        promises.push(fs.pathExists(pathToFile));
      });

      return Promise.all(promises)
        .then(() => {
          if (countCompilation === 2) {
            watching.close();

            return t.end();
          }

          return true;
        })
        .catch(error => {
          t.fail(error);
          t.end();
        });
    });

    Promise.resolve()
      .then(() => fs.readFile(path.resolve(fixtures, ".webfontrc")))
      .then(content =>
        fs.writeFile(path.resolve(fixtures, ".webfontrc"), content)
      )
      .catch(error => {
        t.fail(error);
        t.end();
      });
  }
);

test.cb("should have errors with default `bail` value", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig, {
    files: [
      path.join(__dirname, "fixtures/svg-icons/**/*.svg"),
      path.join(__dirname, "fixtures/broken-svg-icons/**/*.svg")
    ]
  });

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (webpackError, stats) => {
    if (webpackError) {
      throw webpackError;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(
      stats.compilation.errors.length === 1,
      "have module not found error"
    );
    t.end();
  });
});
