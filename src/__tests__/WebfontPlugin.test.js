import path from "path";
import del from "del";
import fs from "fs-extra";
import webpack from "webpack";
import WebfontPlugin from "../WebfontPlugin";
import webpackConfigBase from "./fixtures/config-base";

const fixtures = path.resolve(__dirname, "fixtures");
const cssDir = path.join(fixtures, "css");

const pluginBaseConfig = {
  dest: path.resolve(cssDir, "../css"),
  destTemplate: path.resolve(cssDir, "../css"),
  files: path.join(fixtures, "svg-icons/**/*.svg"),
  template: "css",
  templateFontPath: "./"
};

/* eslint-disable no-sync */

describe("webfontPlugin", () => {
  beforeAll(() =>
    del([
      path.resolve(fixtures, "build"),
      path.resolve(fixtures, "css/*.{svg,ttf,eot,woff,woff2,css}")
    ])
  );

  afterEach(() =>
    del([
      path.resolve(fixtures, "build"),
      path.resolve(fixtures, "css/*.{svg,ttf,eot,woff,woff2,css}")
    ])
  );

  it("should export `WebfontPlugin` as a class", () => {
    expect(typeof WebfontPlugin === "function").toBe(true);
  });

  it("should throw error if not passed `files`", () => {
    expect(() => new WebfontPlugin()).toThrow("Require `files` options");
  });

  it("should throw error if not passed `dest`", () => {
    expect(
      () =>
        new WebfontPlugin({
          files: "**!/!*.svg"
        })
    ).toThrow("Require `dest` options");
  });

  it("should generate fonts and build-in template", done => {
    const options = Object.assign({}, pluginBaseConfig);

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    webpack(webpackConfigBase, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot("warnings");
      expect(stats.compilation.errors).toMatchSnapshot("errors");

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      return done();
    });
  });

  it("should generate fonts and external template", done => {
    const options = Object.assign({}, pluginBaseConfig, {
      template: path.resolve(fixtures, "templates/webfont.css.njk")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    webpack(webpackConfigBase, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot();
      expect(stats.compilation.errors).toMatchSnapshot();

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      expect(Object.keys(stats.compilation.assets)).toMatchSnapshot();

      return done();
    });
  });

  it("should generate fonts and external config", done => {
    const options = Object.assign({}, pluginBaseConfig, {
      config: path.resolve(fixtures, "config/.webfontrc")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    webpack(webpackConfigBase, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot();
      expect(stats.compilation.errors).toMatchSnapshot();

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      return done();
    });
  });

  it("should regenerate fonts and build-in template in watch mode", done => {
    const options = Object.assign({}, pluginBaseConfig);

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot(
        `warning in compilation ${countCompilation}`
      );
      expect(stats.compilation.errors).toMatchSnapshot(
        `errors in compilation ${countCompilation}`
      );

      if (countCompilation === 0) {
        watching.close();
      }

      countCompilation++;

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      return done();
    });

    Promise.resolve()
      .then(() => fs.readFile(path.join(fixtures, "svg-icons/avatar.svg")))
      .then(content =>
        fs.writeFile(path.join(fixtures, "svg-icons/avatar.svg"), content)
      )
      .catch(error => {
        throw error;
      });
  });

  it("should regenerate fonts and external template in watch mode", done => {
    const options = Object.assign({}, pluginBaseConfig, {
      template: path.resolve(fixtures, "templates/webfont.css.njk")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot(
        `warning in compilation ${countCompilation}`
      );
      expect(stats.compilation.errors).toMatchSnapshot(
        `errors in compilation ${countCompilation}`
      );

      if (countCompilation === 0) {
        watching.close();
      }

      countCompilation++;

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      return done();
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
        throw error;
      });
  });

  it("should generate and regenerate fonts and external config in watch mode", done => {
    const options = Object.assign({}, pluginBaseConfig, {
      config: path.resolve(fixtures, ".webfontrc")
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    const compiler = webpack(webpackConfigBase);
    let countCompilation = 0;

    const watching = compiler.watch({}, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot(
        `warning in compilation ${countCompilation}`
      );
      expect(stats.compilation.errors).toMatchSnapshot(
        `errors in compilation ${countCompilation}`
      );

      if (countCompilation === 0) {
        watching.close();
      }

      countCompilation++;

      expect(fs.existsSync(path.join(cssDir, "webfont.css"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.eot"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.svg"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.ttf"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff"))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, "webfont.woff2"))).toBe(true);

      return done();
    });

    Promise.resolve()
      .then(() => fs.readFile(path.resolve(fixtures, ".webfontrc")))
      .then(content =>
        fs.writeFile(path.resolve(fixtures, ".webfontrc"), content)
      )
      .catch(error => {
        throw error;
      });
  });

  it("should has errors with default `bail` value", done => {
    const options = Object.assign({}, pluginBaseConfig, {
      files: [
        path.resolve(__dirname, "fixtures/svg-icons/**/*.svg"),
        path.resolve(__dirname, "fixtures/broken-svg-icons/**/*.svg")
      ]
    });

    webpackConfigBase.plugins = [new WebfontPlugin(options)];

    webpack(webpackConfigBase, (error, stats) => {
      if (error) {
        throw error;
      }

      expect(stats.compilation.warnings).toMatchSnapshot();
      expect(stats.compilation.errors).toHaveLength(1);

      expect(Object.keys(stats.compilation.assets)).toMatchSnapshot();

      done();
    });
  });
});
