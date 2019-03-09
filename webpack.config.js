const path = require('path');

const conf = {
  entry: {
    options: './src/options/options.js',
    'plan-injection': './src/plan-injection/plan-injection.js',
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: '[name].js',
    publicPath: 'public/',
  },
  devServer: {
    overlay: true,
  },
  devtool: 'eval-sorcemap',
};

module.exports = (env, options) => {
  conf.devtool = (options.mode === 'production')
    // ? 'source-map'
    ? false
    : 'eval-sorcemap';
  return conf;
};
