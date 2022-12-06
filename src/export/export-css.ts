import fs from 'fs-extra';
import StyleDictionary from 'style-dictionary';

import { convertShadowsDesignTokenToCss } from '../utils/convertDesignTokenToCss';
import type { Tokens } from '../utils/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reshapeDesignTokens = (obj: any) => {
  for (const key in obj) {
    // TODO: See if there is a way to output styles not just variables
    if (key === 'icons' || key === 'textStyles') {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] !== 'string' && typeof obj[key] !== 'object') {
      obj[key] = obj[key].toString();
    }

    if (Array.isArray(obj[key])) {
      obj[key] = convertShadowsDesignTokenToCss(obj[key]);
    }

    const newKey = key.replace('$', '');
    if (newKey !== key) {
      obj[newKey] = obj[key];
      delete obj[key];
    }

    if (obj[key] !== null && typeof obj[key] === 'object') {
      reshapeDesignTokens(obj[key]);
    }
  }
};

export default async function exportCssFromTokens(
  tokens: Tokens,
  outputDir: string
) {
  await fs.mkdirs(outputDir);
  const config = {
    source: [`${outputDir}/*.tokens.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        files: [
          {
            destination: `${outputDir}/tokens.css`,
            format: 'css/variables',
          },
        ],
      },
    },
  };

  reshapeDesignTokens(tokens);

  await fs.writeJson(`${outputDir}/temp-css.tokens.json`, tokens, {
    spaces: 2,
  });
  const styleDictionary = StyleDictionary.extend(config);
  await fs.remove(`${outputDir}/temp-css.tokens.json`);

  styleDictionary.buildAllPlatforms();
}
