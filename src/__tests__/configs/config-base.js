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
                loader: 'url',
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
    plugins: [],
    resolve: {
        modules: ['node_modules']
    },
    resolveLoader: {
        moduleExtensions: ['-loader']
    }
};
