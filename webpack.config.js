const path = require("path");

module.exports = {

    mode: 'development',    // webpack4以降はモード指定する
    entry: './src/client/app.ts',  // エントリーポイント
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
    output: {
        filename: 'app.js',                            // バンドルのファイル名。[name]はentryで指定したキー
        path: path.resolve(__dirname, 'src'),          // ファイルの配置パス
        publicPath: "/",                               // ブラウザからバンドルにアクセスする際のパス
    },
    //webpack-dev-server用設定
    devServer: {
        open: true,                                   // ブラウザを自動で開く
        openPage: "index.html"  ,                     // 自動で指定したページを開く
        contentBase: path.resolve(__dirname, 'src'),  // HTML等コンテンツのルートディレクトリ
        watchContentBase: true,                       // コンテンツの変更監視をする
        port: 3000,                                   // ポート番号
    }

};