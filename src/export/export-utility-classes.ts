import fs from 'fs-extra';
import StyleDictionary from 'style-dictionary';

import { convertShadowsDesignTokenToCss } from '../utils/convertDesignTokenToCss';
import type { Tokens } from '../utils/types';

const tokensToUtilitiesMap = [
  {
    name: 'margin',
    tokenType: 'spacing',
    cssProperty: 'margin',
  },
  {
    name: 'margin-block',
    tokenType: 'spacing',
    cssProperty: 'margin-block',
  },
  {
    name: 'margin-inline',
    tokenType: 'spacing',
    cssProperty: 'margin-inline',
  },
  {
    name: 'margin-block-start',
    tokenType: 'spacing',
    cssProperty: 'margin-block-start',
  },
  {
    name: 'margin-inline-end',
    tokenType: 'spacing',
    cssProperty: 'margin-inline-end',
  },
  {
    name: 'margin-block-end',
    tokenType: 'spacing',
    cssProperty: 'margin-block-end',
  },
  {
    name: 'margin-inline-start',
    tokenType: 'spacing',
    cssProperty: 'margin-inline-start',
  },
];

StyleDictionary.registerFormat({
  name: 'css/utility-classes',
  formatter: ({ dictionary }) => {
    let output = '';
    dictionary.allProperties.forEach((prop) => {
      const tokenType = prop.path[0];

      tokensToUtilitiesMap.forEach((utility) => {
        if (tokenType === utility.tokenType) {
          const utilityClass = utility.name + '-' + prop.path[1];
          output += `.${utilityClass} {\n  ${utility.cssProperty}: var(--${prop.name});\n}\n\n`;
        }
      });
    });
    return output;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reshapeDesignTokens = (obj: any) => {
  for (const key in obj) {
    // TODO: See if there is a way to output groups of styles not just individual styles
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

export default async function exportUtilityClassesFromTokens(
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
            destination: `${outputDir}/utilities.css`,
            format: 'css/utility-classes',
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
