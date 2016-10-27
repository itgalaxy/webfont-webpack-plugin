// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';
// eslint-disable-next-line node/no-unpublished-import
import webpack from 'webpack';
import webpackConfigBase from './configs/config-base';

test.cb('should execute successfully', (t) => {
    webpack(webpackConfigBase, (error, stats) => {
        if (error) {
            throw error;
        }

        t.true(stats.compilation.errors.length === 0, 'no compilation error');

        t.end();
    });
});
