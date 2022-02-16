const path = require('path');
const toPath = (_path) => path.join(process.cwd(), _path);

module.exports = {
  stories: ['../stories/**/*.stories.tsx'],
  addons: [
    'storybook-addon-designs',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  webpackFinal: async (config) => {
    // Fix `framer-motion` build error
    // https://github.com/framer/motion/issues/1307#issuecomment-966827629
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      include: /node_modules/,
    });

    // Copied from Chakra UI repo to make Chakra work correctly in Storybook
    // https://github.com/chakra-ui/chakra-ui/blob/main/.storybook/main.js
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@emotion/core': toPath('node_modules/@emotion/react'),
          'emotion-theming': toPath('node_modules/@emotion/react'),
        },
      },
    };
  },
};
