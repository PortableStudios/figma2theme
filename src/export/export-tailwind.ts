import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';

import { version } from '../../package.json';
import { renderTemplate } from './templating';

import type { Tokens } from '../utils/types';

const prettierConfigFile = path.resolve(__dirname, '../../.prettierrc');
const templateDir = path.resolve(__dirname, '../../templates');

// Run Prettier on JS code using the config file
const formatFileContents = async (contents: string) => {
  return prettier.resolveConfig(prettierConfigFile).then((options) => {
    return prettier.format(contents, { ...options, parser: 'babel' });
  });
};

export default async function exportJsonFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string,
  versionDescription: string
) {
  await fs.mkdirs(outputDir);

  const tailwind = {
    content: [],
    theme: {
      extend: {},
    },
    plugins: [],
  };

  // render the main config
  await renderTemplate(
    `${templateDir}/tailwind.config.js.ejs`,
    `${outputDir}/tailwind.config.js`,
    {
      tailwind,
      version,
      figmaFileKey,
      versionDescription,
    },
    formatFileContents
  );

  // and the local edits file if it doesn't already exist.
  if (!fs.existsSync(`${outputDir}/tailwind.config.local.js`)) {
    await renderTemplate(
      `${templateDir}/tailwind.config.local.js.ejs`,
      `${outputDir}/tailwind.config.local.js`,
      {
        tailwind,
        version,
        figmaFileKey,
        versionDescription,
      },
      formatFileContents
    );
  }
}
