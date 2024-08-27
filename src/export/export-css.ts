import path from 'path';

import { version } from '../../package.json';
import { renderTemplate } from '../utils/file';
import { convertShadowsDesignTokenToCss } from '../utils/convertDesignTokenToCss';
import type { Dictionary, NestedDictionary, Tokens } from '../utils/types';

// Convert a design token dictionary into a simpler format
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

// Convert the text styles dictionary into a format that's closer to CSS
// e.g. convert `{ "fontSize": { "sm": "1rem", "xl": "1.125rem" }`  to `{ "font-size": "1rem", "@media (min-width: 80em)": { "font-size": "1.125rem" } }`
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
      const className = `.typography-${name.toLowerCase().replace(/\s/g, '-')}`;
      const fontFamily = getBaseValue(style.fontFamily) ?? '';
      // Prefer the variable font if it exists (e.g. "Inter" -> "Inter Variable")
      const variableFont =
        fontFamily.slice(0, -1) + ' Variable' + fontFamily.slice(-1);
      const baseStyle = {
        'font-family': `${variableFont}, ${fontFamily}, sans-serif`,
        'font-size': getBaseValue(style.fontSize),
        'font-style': getBaseValue(style.fontStyle),
        'font-weight': getBaseValue(style.fontWeight),
        'letter-spacing': getBaseValue(style.letterSpacing),
        'line-height': getBaseValue(style.lineHeight),
        'text-decoration-line': getBaseValue(style.textDecorationLine),
        'text-transform': getBaseValue(style.textTransform),
      };

      // Iterate over each breakpoint and create a media query if the value is different from the base
      const mediaQueries = breakpointsInOrder.reduce((acc, breakpoint) => {
        const breakpointStyle = {
          'font-size': getBreakpointValue(style.fontSize, breakpoint),
          'font-style': getBreakpointValue(style.fontStyle, breakpoint),
          'font-weight': getBreakpointValue(style.fontWeight, breakpoint),
          'letter-spacing': getBreakpointValue(style.letterSpacing, breakpoint),
          'line-height': getBreakpointValue(style.lineHeight, breakpoint),
          'text-decoration-line': getBreakpointValue(
            style.textDecorationLine,
            breakpoint
          ),
          'text-transform': getBreakpointValue(style.textTransform, breakpoint),
        };
        Object.keys(breakpointStyle).forEach((k) => {
          if (breakpointStyle[k as keyof typeof breakpointStyle] === undefined)
            delete breakpointStyle[k as keyof typeof breakpointStyle];
        });

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

export default async function exportCssFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string,
  versionDescription: string,
  fontFallbacks?: { [token: string]: string }
) {
  const breakpoints = processTokens(tokens.breakpoints);

  const nestedColors = processTokens(tokens.colours);
  // Completely flatten the colors object by prefixing any nested keys with the parent key
  const flattenColors = (
    obj: Dictionary<string>,
    prefix = ''
  ): { [key: string]: string } =>
    Object.entries(obj).reduce<Dictionary<string>>((acc, [key, value]) => {
      if (typeof value === 'object') {
        return { ...acc, ...flattenColors(value, `${prefix}${key}-`) };
      }

      if (key === 'default') {
        return { ...acc, [prefix.slice(0, -1)]: value };
      }

      return { ...acc, [`${prefix}${key}`]: value };
    }, {});
  const colors = flattenColors(nestedColors);

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

  const fontSize = processTokens(tokens.typography.fontSizes);

  const lineHeight = processTokens(tokens.typography.lineHeights);

  const letterSpacing = processTokens(tokens.typography.letterSpacing);

  const textStyles = processTextStyles(tokens.textStyles, tokens.breakpoints);

  const variables = {
    breakpoints,
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
    `${path.resolve(__dirname, '../../templates/css')}/theme.css.ejs`,
    `${outputDir}/theme.css`,
    { variables, version, figmaFileKey, versionDescription }
  );
}
