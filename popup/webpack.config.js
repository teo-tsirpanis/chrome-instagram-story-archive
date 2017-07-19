const path = require('path');

var query = {
  bypassOnDebug: true,
  optipng: {
    optimizationLevel: 7
  },
  gifsicle: {
    interlaced: true
  }
};

module.exports = {
  
  entry: [
    './popup/src/scripts/index.js'
  ],
  
  output: {
    filename: 'popup.js',
    path: path.join(__dirname, '../', 'build/js'),
    publicPath: '/'
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.scss', '.json'],
    modules: ['node_modules']
  },
  
  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, '../utils')
        ],
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          `image-webpack-loader?${JSON.stringify(query)}`
        ]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};
