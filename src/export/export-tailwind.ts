import path from 'path';

import { version } from '../../package.json';
import { renderTemplate } from '../utils/file';
import { convertShadowsDesignTokenToCss } from '../utils/convertDesignTokenToCss';
import type { Dictionary, NestedDictionary, Tokens } from '../utils/types';

const templateDir = path.resolve(__dirname, '../../templates/tailwind');

// Convert a design token dictionary into a simpler format that can be used in the Tailwind config
// e.g. convert `{ "sm": { "$type": "dimension", "$value": "30em" } }` to `{ "sm": "30em" }`
const processTokens = <Type, Token>(
  dictionary: NestedDictionary<{ $type: Type; $value: Token }>,
  transformKey: (key: string) => string = (key) => key,
  transformValue: (value: Token) => unknown = (value) => value
): Dictionary<Token> =>
  Object.entries(dictionary).reduce((obj, [key, dictionaryOrToken]) => {
    return {
      ...obj,
      [transformKey(key)]: dictionaryOrToken.$value
        ? transformValue(dictionaryOrToken.$value as Token)
        : processTokens(
            dictionaryOrToken as typeof dictionary,
            transformKey,
            transformValue
          ),
    };
  }, {});

// Convert the text styles dictionary into a format that can be used in a Tailwind plugin
// e.g. convert `{ "fontSize": { "sm": "1rem", "xl": "1.125rem" }`  to `{ "fontSize: "1rem", '@media (min-width: 80em)': { fontSize: "1.125rem" } }`
const processTextStyles = (
  textStyles: Tokens['textStyles'],
  breakpoints: Tokens['breakpoints']
) => {
  // Get the breakpoints in order (e.g. `["sm", "md", "lg", "xl"]`)
  const breakpointsInOrder = Object.entries(breakpoints)
    .sort(([, a], [, b]) => parseInt(a.$value) - parseInt(b.$value))
    .map(([name]) => name);

  // Get the base value for a given token (e.g. `{ "sm": "1rem", "xl": "1.125rem" }` will return `"1rem"`)
  const getBaseValue = (value: string | Dictionary<string>) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value.base) return value.base;

    const smallestBreakpoint = breakpointsInOrder.find((name) => value[name]);
    if (!smallestBreakpoint) return undefined;

    return value[smallestBreakpoint];
  };

  // Get the value for a given breakpoint, return undefined if it doesn't exist
  const getBreakpointValue = (
    value: string | Dictionary<string>,
    breakpoint: string
  ) => {
    if (!value) return undefined;
    if (typeof value === 'string') return undefined;
    if (value[breakpoint]) return value[breakpoint];

    return undefined;
  };

  return Object.entries(processTokens(textStyles)).reduce(
    (obj, [name, style]) => {
      const className = `.typography-${name}`;
      const fontFamily = getBaseValue(style.fontFamily) ?? '';
      // Prefer the variable font if it exists (e.g. "Inter" -> "Inter Variable")
      const variableFont =
        fontFamily.slice(0, -1) + ' Variable' + fontFamily.slice(-1);
      const baseStyle = {
        fontFamily: `${variableFont}, ${fontFamily}, sans-serif`,
        fontSize: getBaseValue(style.fontSize),
        fontStyle: getBaseValue(style.fontStyle),
        fontWeight: getBaseValue(style.fontWeight),
        letterSpacing: getBaseValue(style.letterSpacing),
        lineHeight: getBaseValue(style.lineHeight),
        textDecorationLine: getBaseValue(style.textDecorationLine),
        textTransform: getBaseValue(style.textTransform),
      };

      // Iterate over each breakpoint and create a media query if the value is different from the base
      const mediaQueries = breakpointsInOrder.reduce((acc, breakpoint) => {
        const breakpointStyle = {
          fontSize: getBreakpointValue(style.fontSize, breakpoint),
          fontStyle: getBreakpointValue(style.fontStyle, breakpoint),
          fontWeight: getBreakpointValue(style.fontWeight, breakpoint),
          letterSpacing: getBreakpointValue(style.letterSpacing, breakpoint),
          lineHeight: getBreakpointValue(style.lineHeight, breakpoint),
          textDecorationLine: getBreakpointValue(
            style.textDecorationLine,
            breakpoint
          ),
          textTransform: getBreakpointValue(style.textTransform, breakpoint),
        };

        // Skip the breakpoint if the style is the same as the base
        if (
          Object.entries(breakpointStyle).every(
            ([key, value]) =>
              value === undefined ||
              value === baseStyle[key as keyof typeof baseStyle]
          )
        ) {
          return acc;
        }

        return {
          ...acc,
          [`@media (min-width: ${breakpoints[breakpoint].$value})`]:
            breakpointStyle,
        };
      }, {});

      return { ...obj, [className]: { ...baseStyle, ...mediaQueries } };
    },
    {}
  );
};

export default async function exportTailwindFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string,
  versionDescription: string,
  fontFallbacks?: { [token: string]: string }
) {
  const screens = processTokens(tokens.breakpoints);

  const colors = processTokens(tokens.colours, (key) => {
    // Convert any "default" keys to "DEFAULT" which is what Tailwind uses
    if (key === 'default') return 'DEFAULT';

    return key;
  });

  const borderRadius = processTokens(tokens.radii);

  const boxShadow = processTokens(
    tokens.shadows,
    undefined,
    convertShadowsDesignTokenToCss
  );

  const fonts = processTokens(tokens.typography.fonts);
  const fontFamily = Object.keys(fonts).reduce<Dictionary<string>>(
    (obj, name) => {
      const font = fonts[name];
      // Prefer the variable font if it exists (e.g. "Inter" -> "Inter Variable")
      const variableFont = font.slice(0, -1) + ' Variable' + font.slice(-1);
      // Add font fallbacks if they exist
      const fallbacks = fontFallbacks?.[name] ?? 'sans-serif';

      return { ...obj, [name]: `${variableFont}, ${font}, ${fallbacks}` };
    },
    {}
  );
  // Add "sans" and "serif" to the font list if they don't exist (Tailwind uses these)
  if (!fontFamily.sans) fontFamily.sans = fontFamily.body;
  if (!fontFamily.serif) fontFamily.serif = fontFamily.heading;

  const fontSize = processTokens(tokens.typography.fontSizes);

  const lineHeight = processTokens(tokens.typography.lineHeights);

  const letterSpacing = processTokens(tokens.typography.letterSpacing);

  const textStyles = processTextStyles(tokens.textStyles, tokens.breakpoints);

  const tailwind = {
    screens,
    colors,
    borderRadius,
    boxShadow,
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
    textStyles,
    urls: tokens.urls,
  };

  await renderTemplate(
    `${templateDir}/tailwind.figma2theme.js.ejs`,
    `${outputDir}/tailwind.figma2theme.js`,
    { tailwind, version, figmaFileKey, versionDescription }
  );
}
