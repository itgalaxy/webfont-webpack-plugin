import WebfontPlugin from '../WebfontPlugin';
import path from 'path';
// eslint-disable-next-line node/no-unpublished-import
import sinon from 'sinon';
// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';

const webfontPluginBaseConfig = {
    cssTemplateFontPath: './fonts/',
    dest: {
        fontsDir: path.resolve(__dirname, 'fixtures/css/fonts'),
        stylesDir: path.resolve(__dirname, 'fixtures/css')
    },
    files: path.resolve(__dirname, 'fixtures/svg-icons/**/*.svg'),
    template: 'css'
};

test('should export `WebfontPlugin` as a class', (t) => {
    t.true(typeof WebfontPlugin === 'function');
});

test('should throw error if not passed `files`', (t) => {
    t.throws(() => new WebfontPlugin(), 'Require `files` options');
});

test('should throw error if not passed `dest`', (t) => {
    t.throws(() => new WebfontPlugin({
        files: '**/*.svg'
    }), 'Require `dest` options');
});

test('should export options', (t) => {
    const webfontPlugin = new WebfontPlugin(webfontPluginBaseConfig);

    t.deepEqual(webfontPlugin.options, webfontPluginBaseConfig);
});

test('should register methods on apply', (t) => {
    const webfontPlugin = new WebfontPlugin(webfontPluginBaseConfig);
    const compiler = {
        plugin: sinon.spy()
    };

    webfontPlugin.apply(compiler);

    t.true(compiler.plugin.calledWith('run'));
    t.true(compiler.plugin.calledWith('watch-run'));
    t.true(compiler.plugin.calledWith('compilation'));
});
