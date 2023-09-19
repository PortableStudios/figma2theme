import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';

import { version } from '../../package.json';
import { renderTemplate } from './templating';

import type {
  Tokens,
  TailwindConfig,
  TextVariant,
  Breakpoints,
  Dictionary,
} from '../utils/types';

const prettierConfigFile = path.resolve(__dirname, '../../.prettierrc');
const templateDir = path.resolve(__dirname, '../../templates');

// Run Prettier on JS code using the config file
const formatFileContents = async (contents: string) => {
  return prettier.resolveConfig(prettierConfigFile).then((options) => {
    return prettier.format(contents, { ...options, parser: 'babel' });
  });
};

export const styleValueAtBreakpoint = (
  key: string,
  value: string | string[] | Dictionary<string>
): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    throw new Error('Cannot handle array value for responsive textStyles');
  }
  return value[key];
};

// This takes the responsive textStyles that get applied in a system like Chakra
// and translates them into a set of responsive styles at the various breakpoints
// defined in the theme.
export const generateResponsiveTextStyles = (
  styles: Dictionary<TextVariant>,
  breakpoints: Breakpoints
) => {
  breakpoints = {
    base: '0px',
    ...breakpoints,
  };
  return Object.entries(breakpoints).reduce(
    (allStyles, [breakpointName, breakPointSize]) => {
      return {
        ...allStyles,
        [`@media (min-width: ${breakPointSize})`]: Object.entries(
          styles
        ).reduce((thisStyle, [styleName, style]) => {
          return {
            ...thisStyle,
            [`.style-${styleName}`]: {
              fontFamily: styleValueAtBreakpoint(
                breakpointName,
                style.fontFamily
              ),
              fontSize: styleValueAtBreakpoint(breakpointName, style.fontSize),
              fontStyle: styleValueAtBreakpoint(
                breakpointName,
                style.fontStyle
              ),
              fontWeight: styleValueAtBreakpoint(
                breakpointName,
                style.fontWeight
              ),
              letterSpacing: styleValueAtBreakpoint(
                breakpointName,
                style.letterSpacing
              ),
              lineHeight: styleValueAtBreakpoint(
                breakpointName,
                style.lineHeight
              ),
              textDecorationLine: styleValueAtBreakpoint(
                breakpointName,
                style.textDecorationLine
              ),
              textTransform: styleValueAtBreakpoint(
                breakpointName,
                style.textTransform
              ),
            },
          };
        }, {}),
      };
    },
    {}
  );
};

export const tokens2Tailwind = async (
  tokens: Tokens
): Promise<TailwindConfig> => {
  const tailwind = {
    content: [],
    theme: {
      screens: tokens.breakpoints,
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        ...tokens.colours,
      },
      borderRadius: {
        none: '0',
        full: '9999px',
        ...tokens.radii,
      },
      spacing: tokens.spacing,
      dropShadow: tokens.shadows,
      // Tailwind wants these to be Dictionary<string[]> not Dictionary<string>
      fontFamily: Object.entries(tokens.typography.fonts).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: [value] }),
        {}
      ),
      fontSize: tokens.typography.fontSizes,
      lineHeight: tokens.typography.lineHeights,
      letterSpacing: tokens.typography.letterSpacing,
    },
    componentDefinitions: generateResponsiveTextStyles(
      tokens.textStyles,
      tokens.breakpoints
    ),
  };

  return tailwind;
};

export default async function exportJsonFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string,
  versionDescription: string
) {
  await fs.mkdirs(outputDir);

  const tailwind = await tokens2Tailwind(tokens);

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
