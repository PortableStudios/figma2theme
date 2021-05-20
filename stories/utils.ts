import type { Config } from 'storybook-addon-designs';

export const ifFigmaDesignsForThemeEnabled = (config: Config) => {
  if (process.env.STORYBOOK_SHOW_FIGMA_DESIGNS_FOR_THEME !== 'true') {
    return undefined;
  }

  return config;
};
