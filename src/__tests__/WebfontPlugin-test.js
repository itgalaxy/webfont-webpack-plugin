import WebfontPlugin from "../WebfontPlugin";
import del from "del";
import fs from "fs-extra";
import path from "path";
import test from "ava";
import webpack from "webpack";
import webpackConfigBase from "./configs/config-base";

const webfontPluginBaseConfig = {
  dest: path.resolve(__dirname, "fixtures/css/fonts"),
  destTemplate: path.resolve(__dirname, "fixtures/css"),
  files: path.resolve(__dirname, "fixtures/svg-icons/**/*.svg"),
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

test.beforeEach(() =>
  del([
    path.resolve(__dirname, "build"),
    `${fixtures}/css/fonts`,
    `${fixtures}/css/webfont.css`
  ])
);

test.cb("should generate fonts and build-in template", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig);

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (error, stats) => {
    if (error) {
      throw error;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const files = [
      `${fixtures}/css/fonts/webfont.eot`,
      `${fixtures}/css/fonts/webfont.svg`,
      `${fixtures}/css/fonts/webfont.woff`,
      `${fixtures}/css/fonts/webfont.woff2`,
      `${fixtures}/css/webfont.css`
    ];

    const promises = [];

    files.forEach(pathToFile => {
      promises.push(fs.pathExists(pathToFile));
    });

    // eslint-disable-next-line promise/no-promise-in-callback
    return Promise.all(promises)
      .then(() => t.end())
      .catch(() => {
        t.fail();
        t.end();
      });
  });
});

test.cb("should generate fonts and external template", t => {
  t.plan(2);

  const options = Object.assign({}, webfontPluginBaseConfig, {
    template: path.join(__dirname, "fixtures/templates/webfont.css.njk")
  });

  webpackConfigBase.plugins = [new WebfontPlugin(options)];

  webpack(webpackConfigBase, (error, stats) => {
    if (error) {
      throw error;
    }

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const files = [
      `${fixtures}/css/fonts/webfont.eot`,
      `${fixtures}/css/fonts/webfont.svg`,
      `${fixtures}/css/fonts/webfont.woff`,
      `${fixtures}/css/fonts/webfont.woff2`,
      `${fixtures}/css/webfont.css`
    ];

    const promises = [];

    files.forEach(pathToFile => {
      promises.push(fs.pathExists(pathToFile));
    });

    // eslint-disable-next-line promise/no-promise-in-callback
    return Promise.all(promises)
      .then(() => t.end())
      .catch(() => {
        t.fail();
        t.end();
      });
  });
});
