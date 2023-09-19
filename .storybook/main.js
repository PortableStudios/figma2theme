module.exports = {
  stories: ['../stories/**/*.stories.tsx'],
  core: {
    builder: 'webpack5',
  },
  features: {
    emotionAlias: false,
  },
  addons: [
    'storybook-addon-designs',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
};
