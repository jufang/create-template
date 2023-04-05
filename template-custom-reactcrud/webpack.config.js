const path = require("path"); // 获取绝对路径用
const webpack = require("webpack"); // webpack核心
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 动态生成html插件
const CopyPlugin = require("copy-webpack-plugin"); // 用于直接复制public中的文件到打包的最终文件夹中
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const ESLintPlugin = require("eslint-webpack-plugin"); // eslint插件，代替原来的eslint-loader
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 对CSS进行压缩
const TerserPlugin = require("terser-webpack-plugin"); // 对js进行压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

const backend = "http://106.14.248.48:8080".replace(
  '//+$/',
  '',
);
const parsedArgs = require('yargs').argv;
// 独立css文件，与html,js分开
const projectRoot = process.cwd();

const {
  mode = 'development',
  devserverPort = 9002,
} = parsedArgs;

const PUBLIC_PATH = "/"; // 基础路径

function resolve(dir){
  return path.join(__dirname, dir);
}
const isDevMode = mode === 'development';

const config = {
  cache: {
    type: 'filesystem', // memory 基于内存的临时缓存
  },
  mode,
  entry: "./src/index.js",
  stats: {
    children: false, // 不输出子模块的打包信息
  },
  output: {
    path: path.join(projectRoot, 'dist'), // 将打包好的文件放在此路径下，dev模式中，只会在内存中存在，不会真正的打包到此路径
    publicPath: PUBLIC_PATH, // 文件解析路径，index.html中引用的路径会被设置为相对于此路径
    filename: "js/[name].[chunkhash:8].js",
    chunkFilename: "js/[name].[chunkhash:8].chunk.js", // 编译后的文件名字
    assetModuleFilename: "assets/[name].[hash:8][ext]",
    clean: {
      keep: /library\// // 保留 'dist/library' 下的静态资源
    },
  },
  optimization: {
    runtimeChunk:true,
    minimizer: isDevMode? []: [
      new TerserPlugin({
        parallel: true, // 多线程并行构建
        terserOptions: {
          // https://github.com/terser/terser#minify-options
          compress: {
            warnings: false, // 删除无用代码时是否给出警告
            drop_debugger: true, // 删除所有的debugger
            // drop_console: true, // 删除所有的console.*
            pure_funcs: ["console.log"], // 删除所有的console.log
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 30000, //  模块超过30k自动被抽离成公共模块
      maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
      maxInitialRequests: 3, // 最大初始化请求数
      automaticNameDelimiter: '.', // 打包分割符
      cacheGroups: {
        vendors: { // 通过dllplugin动态链接之后，再打包不需要了基本框架
          chunks: 'all',
          test: /(react|react-dom\/client|react-router-dom|react-redux|redux)/,
          priority: 100,
          name: 'vendors',
        },
        'async-commons': { // 其余异步加载包
          chunks: 'async',
          minChunks: 2,
          name: 'async-commons',
          priority: 90,
        },
        commons: { // 其余同步加载包
          chunks: 'all',
          minChunks: 2,
          name: 'commons',
          priority: 80,
        },
      },
    },
  },
  module: {
    rules: [
      {
        // .js .jsx用babel解析
        test: /\.js?$/,
        include: resolve('src'),
        exclude: /(node_modules|lib)/,
        use: [
          'thread-loader',
          'babel-loader?cacheDirectory', // 使用默认的缓存目录,提升二次构建速度 node_modules/.cache/babel-loader
        ],
      },
      {
        // .css 解析
        test: /\.css$/,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader, // 加载顺序： css-loader > MiniCssExtractPlugin.loader
          {
            loader: 'css-loader',
            options: {
              modules: {
                // importLoaders: 1,
                localIdentName: '[local]_[hash:base64:5]', 
              }
            }
          }
        ],
      },
      {
        // 文件解析
        test: /\.(eot|woff|otf|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
        include: resolve("src"),
        type: "asset/resource",
      },
      {
        // 图片解析
        test: /\.(png|jpg|jpeg|gif)(\?|$)/i,
        include: resolve("src"),
        type: "asset",
      },
      // 自定义SVG图标
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'removeViewBox',
                    icon: true,
                    active: false
                  }
                 ]
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new webpack.DllReferencePlugin({
    //   manifest: require('./dist/library/library.json')
    // }),
    // new ESLintPlugin({
    //   context: ("src"),
    // }),
    // 拷贝public中的文件到最终打包文件夹里
    new CopyPlugin({
      patterns: [
        {
          from: "./public/**/*",
          to: "./",
          globOptions: {
            ignore: [ "**/index.html"],
          },
          noErrorOnMissing: true,
        },
        { from: 'src/assets/icons', to: 'icons' },
        { from: 'src/assets/img', to: 'img' },
        // { from: 'src/assets/svg', to: 'svg' },
      ],
    }),
    new HtmlWebpackPlugin({
      isProd: isDevMode? false: true,
      publicPath: PUBLIC_PATH,
      // 根据模板插入css/js等生成最终HTML
      filename: "index.html", //生成的html存放路径，相对于 output.path
      favicon: "./src/assets/img/favicon.png", // 自动把根目录下的favicon.ico图片加入html
      template: "./public/index.html", //html模板路径
      inject: 'body', // 是否将js放在body的末尾
    }),
    // new HtmlTagsPlugin({
    //   append: false, // 在生成资源后插入
    //   publicPath: "/", // 使用公共路径
    //   tags: ["library/library.dll.js"] // 资源路径
    // }),
    new CompressionPlugin({
      filename: "[path][base].gz", // 多个文件压缩就有多个.gz文件
      algorithm: "gzip", 
      include: resolve('src'),
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // 压缩超过此大小的文件
      minRatio: 0.8,
    }),
  ].concat(
    isDevMode ? [] : [new MiniCssExtractPlugin({
      filename: 'css/[name].[chunkhash:8].css',
      ignoreOrder: true,
    })],
  ).concat(isDevMode? [new webpack.HotModuleReplacementPlugin()]: []),
  resolve: {
    extensions: [".js", ".jsx", ".less", ".css", ".wasm"], //后缀名自动补全
    alias: {
      "@": resolve("src"),
    },
  },
};
// TODO /uploads  代理的是通过fetch获取的svg文件
if (isDevMode) {
  config.devtool = 'eval-cheap-module-source-map'; // eval-source-map 报错的时候在控制台输出哪一行报错
  config.devServer = {
    historyApiFallback: true,
    port: devserverPort,
    proxy: [
      {
        context: ['/api','/uploads'],
        target: backend,
        secure:false,
        changeOrigin: true,
        headers: {
          Referer: backend
        },
      },
    ],
    client: {
      overlay: { errors: true, warnings: false },
      logging: 'error',
    },
    static: path.join(process.cwd(), './dist'),
  };
} 

module.exports = config
