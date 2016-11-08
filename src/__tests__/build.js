import WebfontPlugin from '../WebfontPlugin';
// eslint-disable-next-line node/no-unpublished-import
import bluebird from 'bluebird';
// eslint-disable-next-line node/no-unpublished-import
import del from 'del';
import path from 'path';
// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';
// eslint-disable-next-line node/no-unpublished-import
import webpack from 'webpack';
import webpackConfigBase from './configs/config-base';

const fs = bluebird.promisifyAll(require('fs')); // eslint-disable-line import/no-commonjs

const fixtures = path.resolve(__dirname, 'fixtures');

test.beforeEach(() => del([
    path.resolve(__dirname, 'build'),
    `${fixtures}/css/fonts`,
    `${fixtures}/css/webfont.css`
]));

const webfontPluginBaseConfig = {
    css: true,
    cssTemplateFontPath: './fonts/',
    dest: {
        css: path.resolve(__dirname, 'fixtures/css/webfont.css'),
        fontsDir: path.resolve(__dirname, 'fixtures/css/fonts')
    },
    files: path.resolve(__dirname, 'fixtures/svg-icons/**/*.svg')
};

test.cb('should execute successfully', (t) => {
    t.plan(1);

    webpackConfigBase.plugins = [
        new WebfontPlugin(webfontPluginBaseConfig)
    ];

    webpack(webpackConfigBase, (error, stats) => {
        if (error) {
            throw error;
        }

        t.true(stats.compilation.errors.length === 0, 'no compilation error');

        const files = [
            `${fixtures}/css/fonts/webfont.eot`,
            `${fixtures}/css/fonts/webfont.svg`,
            `${fixtures}/css/fonts/webfont.woff`,
            `${fixtures}/css/fonts/webfont.woff2`,
            `${fixtures}/css/webfont.css`
        ];

        const promises = [];

        files.forEach((pathToFile) => {
            promises.push(fs.statAsync(pathToFile));
        });

        return Promise
            .all(promises)
            .then(() => t.end())
            .catch(() => {
                t.fail();
                t.end();
            });
    });
});

test.cb('should execute successfully on watch', (t) => {
    t.plan(1);

    webpackConfigBase.plugins = [
        new WebfontPlugin(webfontPluginBaseConfig)
    ];

    const compiler = webpack(webpackConfigBase);

    let watcherRun = false;
    const promises = [];
    const watcher = compiler.watch({
        aggregateTimeout: 300,
        poll: true
    }, (noUsed, stats) => {
        if (watcherRun) {
            return;
        }

        watcherRun = true;
        t.true(stats.compilation.errors.length === 0, 'no compilation error');

        const files = [
            `${fixtures}/css/fonts/webfont.eot`,
            `${fixtures}/css/fonts/webfont.svg`,
            `${fixtures}/css/fonts/webfont.woff`,
            `${fixtures}/css/fonts/webfont.woff2`,
            `${fixtures}/css/webfont.css`
        ];

        files.forEach((pathToFile) => {
            promises.push(fs.statAsync(pathToFile));
        });

        watcher.close(() => Promise
            .all(promises)
            .then(() => t.end())
            .catch(() => {
                t.fail();
                t.end();
            })
        );
    });
});
