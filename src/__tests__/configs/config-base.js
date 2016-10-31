import WebfontPlugin from '../../Plugin';
import path from 'path';

export default {
    entry: path.resolve(__dirname, '../fixtures/entry.js'),
    module: {
        loaders: [
            {
                loaders: [
                    'style',
                    'css'
                ],
                test: /\.css/
            },
            {
                loaders: [
                    'style',
                    'css',
                    'sass'
                ],
                test: /\.scss$/
            },
            {
                loader: 'url-loader',
                test: /\.(svg|eot|ttf|woff|woff2)?$/
            },
            {
                loaders: ['file?name=i/[hash].[ext]'],
                test: /\.(svg|eot|ttf|woff|woff2)?$/
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../build')
    },
    plugins: [
        new WebfontPlugin({
            css: true,
            cssTemplateFontPath: './fonts/',
            dest: {
                css: path.resolve(__dirname, '../fixtures/css/webfont.css'),
                fontsDir: path.resolve(__dirname, '../fixtures/css/fonts')
            },
            files: path.resolve(__dirname, '../fixtures/svg-icons/**/*.svg')
        })
    ],
    resolve: {
        modulesDirectories: ['web_modules', 'node_modules']
    }
};
