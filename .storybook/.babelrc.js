const path = require('path');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
          '@': path.resolve(__dirname, '../'),
        },
      },
    ],
  ],
};
