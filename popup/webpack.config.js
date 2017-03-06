const path = require('path');

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
    extensions: ['', '.js', '.jsx', '.scss', '.json'],
    modulesDirectories: ['node_modules']
  },
  
  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
        loader: 'babel',
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
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      }
    ]
  }
};
