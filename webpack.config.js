const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// mini-css-extract-pluginでstlye.cssとstlye.jsが作成されるため↓を使用
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env) => {
  const sourceMap = env === 'development';
  const devtool = env === 'development' ? 'source-map': 'none';

  // production -> 最適化された状態でJSファイルを出力
  // development -> ソースマップ有効でJSファイルが出力
  return {
    mode: env,
    devtool: devtool,
    entry: {
      bundle: ["./src/js/index.js"],
      style: ["./src/scss/style.scss"],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js'
    },
    optimization: {
      minimizer: [
        new TerserJSPlugin({}),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    plugins: [
      new FixStyleOnlyEntriesPlugin(),
      new MiniCssExtractPlugin({filename: 'css/[name].css'}),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      //日本で0.25%以上のシェア、ie10以下は含めない、オペラミニを含めない
                      // https://browserl.ist/?q=%3E0.25%25+in+JP%2C+not+ie+%3C%3D+10%2C+not+op_mini+all
                      "targets": [">0.25% in JP", "not ie <= 10", "not op_mini all"]
                    }
                  ]
                ]
              },
            },
          ],
          exclude: /(node_modules|dist)/
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              // cssファイルの依存関係を解決する役割
              loader: 'css-loader',
              options: {
                sourceMap: sourceMap,
                // minimize: true,
                importLoaders: 2,
                url: false, //cssを別ファイルで切り出すため
              }
            },
            {
              // post cssを処理するローダー
              loader: 'postcss-loader',
              options: {
                sourceMap: sourceMap,
                plugins: [
                  // autoprefixを有効にしてベンダープレフィックスを付与する
                  require('autoprefixer')({
                    grid: 'autoplace',
                    "browsers": [">0.25% in JP", "not ie <= 10", "not op_mini all"]
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: sourceMap,
              },
            },
          ],
        },
      ]
    }
  }
}