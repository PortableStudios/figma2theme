import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-designs',
  ],
};

export default config;
