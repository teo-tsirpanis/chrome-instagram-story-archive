const path = require('path');

module.exports = {
  
  entry: [
    './content/src/scripts/index.js'
  ],
  
  output: {
    filename: 'content.js',
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
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
