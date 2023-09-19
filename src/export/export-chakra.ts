import path from 'path';
import prettier from 'prettier';
import svgToJSX from 'svg-to-jsx';
import * as svgson from 'svgson';

import { version } from '../../package.json';
import { convertShadowsDesignTokenToCss } from '../utils/convertDesignTokenToCss';
import type {
  ChakraTokens,
  Dictionary,
  IconValue,
  Tokens,
} from '../utils/types';

import { renderTemplate } from './templating';

const prettierConfigFile = path.resolve(__dirname, '../../.prettierrc');
const templateDir = path.resolve(__dirname, '../../templates');

// Run Prettier on TypeScript code using the config file
const formatFileContents = async (contents: string) => {
  return prettier.resolveConfig(prettierConfigFile).then((options) => {
    return prettier.format(contents, { ...options, parser: 'typescript' });
  });
};

type ChakraIcon = {
  name: string;
  viewBox: string;
  path: string;
};
const processIcons = async (
  icons: Dictionary<IconValue>
): Promise<ChakraIcon[]> => {
  // Take an SVGO object and modify it to use with Chakra UI
  const processIcon = async (
    key: string,
    icon: IconValue
  ): Promise<ChakraIcon> => {
    // Convert the name from kebab-case to title-case (i.e. down-arrow to DownArrow)
    const name = key
      .split('-')
      .map((str) => `${str[0].toUpperCase()}${str.substring(1)}`)
      .join('');

    // Calculate the viewBox using the width and height
    const viewBox = `0 0 ${icon.info.width} ${icon.info.height}`;

    // Convert the SVG string to an object so we can modify it
    const svgObject = await svgson.parse(icon.data);
    // Remove all attributes from the <svg> tag to make it easier to remove later
    svgObject.attributes = {};
    // Modify all <path>, <rect> and <ellipse> tags in the SVG so we can change the SVG colour
    svgObject.children = svgObject.children.map((child) => {
      const newChild = { ...child };
      if (['path', 'rect', 'ellipse'].includes(newChild.name)) {
        // If it has "stroke" value change it to "currentColor"
        if ('stroke' in child.attributes) {
          newChild.attributes.stroke = 'currentColor';
        }
        // If it has a "fill" value change it to "currentColor", otherwise set it to "none" or it will default to black
        if ('fill' in child.attributes) {
          newChild.attributes.fill = 'currentColor';
        } else {
          newChild.attributes.fill = 'none';
        }
      }
      return newChild;
    });

    // Convert the modified SVG object back to an SVG string
    const svgString = await svgson.stringify(svgObject);
    // Convert the SVG string to a JSX string (for React) and remove the <svg> wrapper
    const jsxString = (await svgToJSX(svgString))
      .replace('<svg>', '')
      .replace('</svg>', '');

    return {
      name: `${name}Icon`,
      viewBox: viewBox,
      path: jsxString,
    };
  };

  // Process all the icons asynchronously using promises
  const processedIcons: ChakraIcon[] = await Promise.all(
    Object.keys(icons).map(async (key) => {
      const icon = icons[key];
      return processIcon(key, icon);
    })
  );
  return processedIcons;
};

// Process text styles to replace hardcoded font families with tokens
// e.g. replace `Noto Sans` with `body`
const processTextStyles = (
  textStyles: ChakraTokens['textStyles'],
  fontFamilies: ChakraTokens['typography']['fonts']
): ChakraTokens['textStyles'] => {
  const updatedTextStyles = { ...textStyles };

  // Find the token for a given font family (e.g. get `body` from `Arial`)
  const getFontFamilyToken = (fontFamily: string) => {
    const keys = Object.keys(fontFamilies);
    for (let i = 0; i < keys.length; i++) {
      if (fontFamily === fontFamilies[keys[i]]) {
        return keys[i];
      }
    }
  };

  // Replace the font family in each text style with the corresponding token
  Object.keys(updatedTextStyles).forEach((key) => {
    const value = updatedTextStyles[key];
    const fontFamily = value.fontFamily;
    if (typeof fontFamily === 'string') {
      const token = getFontFamilyToken(fontFamily);
      if (token) {
        value.fontFamily = token;
      }
    }
  });

  return updatedTextStyles;
};

// Reshaping the tokens to match Chakra's theme format (https://chakra-ui.com/docs/styled-system/theme)
// This function is recursive so that it can climb throughout the whole
// tree of tokens and make the nesisary undates to every individual token.
// TODO: Refactor to remove the need to use `any` types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reshapeDesignTokens = (tokens: any): any => {
  const newTokens = { ...tokens };

  for (const key in newTokens) {
    // Deleting the $type keys as Chakra doesn't need them.
    if (key === '$type') delete newTokens[key];

    // Flattening the `[key]: { $value: ... }` to `[key]: ...`
    if (newTokens[key]?.$value) {
      newTokens[key] = newTokens[key].$value;
    }

    // The only keys that are arrays are shadows, so we convert them to CSS shadows like Chakra expects.
    if (Array.isArray(newTokens[key])) {
      newTokens[key] = convertShadowsDesignTokenToCss(newTokens[key]);
    }

    // If the current key is an object recursively call the function again to climb the tree.
    if (newTokens[key] !== null && typeof newTokens[key] === 'object') {
      newTokens[key] = reshapeDesignTokens(newTokens[key]);
    }
  }

  // Return the tokens that are now in the Chakra tokens shape.
  return newTokens;
};

export default async function exportChakraFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string,
  versionDescription: string,
  fontFallbacks?: { [token: string]: string }
) {
  const chakraTokens = reshapeDesignTokens(tokens) as ChakraTokens;

  // Create a config for the templates by combining the design tokens with default Chakra values
  const chakra = {
    breakpoints: chakraTokens.breakpoints,
    colours: chakraTokens.colours,
    gridStyles: chakraTokens.gridStyles,
    icons: await processIcons(chakraTokens.icons),
    radii: {
      none: '0',
      ...chakraTokens.radii,
      full: '9999px',
    },
    shadows: {
      ...chakraTokens.shadows,
      none: 'none',
    },
    spacing: {
      px: '1px',
      '0': '0',
      ...chakraTokens.spacing,
    },
    sizes: {
      full: '100%',
      ...chakraTokens.sizes,
    },
    typography: {
      fonts: {
        ...Object.keys(chakraTokens.typography.fonts).reduce((obj, name) => {
          const font = chakraTokens.typography.fonts[name];
          const fallback = fontFallbacks?.[name] ?? 'sans-serif';
          return { ...obj, [name]: `${font}, ${fallback}` };
        }, {}),
        mono: '"Courier New", Courier, monospace',
      },
      fontSizes: chakraTokens.typography.fontSizes,
      lineHeights: chakraTokens.typography.lineHeights,
      letterSpacing: chakraTokens.typography.letterSpacing,
    },
    textStyles: processTextStyles(
      chakraTokens.textStyles,
      chakraTokens.typography.fonts
    ),
  };

  // Specify which templates should be rendered and where they should be saved
  const templates = [
    {
      input: `${templateDir}/index.ts.ejs`,
      output: `${outputDir}/index.ts`,
    },
    {
      input: `${templateDir}/icons.tsx.ejs`,
      output: `${outputDir}/icons.tsx`,
    },
    {
      input: `${templateDir}/grids.ts.ejs`,
      output: `${outputDir}/grids.ts`,
    },
  ];

  // Render and save all the templates simultaneously
  await Promise.all(
    templates.map((template) => {
      return renderTemplate(
        template.input,
        template.output,
        {
          chakra,
          version,
          figmaFileKey,
          versionDescription,
        },
        formatFileContents
      );
    })
  );
}
