import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import prettier from 'prettier';
import svgToJSX from 'svg-to-jsx';
import * as svgson from 'svgson';
import type { Data } from 'ejs';

import { version } from '../../package.json';
import type { OptimisedSVG, Icons, Tokens } from '../utils/types';

const prettierConfigFile = path.resolve(__dirname, '../../.prettierrc');
const templateDir = path.resolve(__dirname, '../../templates');

// Run Prettier on TypeScript code using the config file
const formatFileContents = async (contents: string) => {
  return prettier.resolveConfig(prettierConfigFile).then((options) => {
    return prettier.format(contents, { ...options, parser: 'typescript' });
  });
};

// Render an EJS template with the given data, format it with Prettier and write the result to the output path
const renderTemplate = async (
  templatePath: string,
  outputPath: string,
  data: Data
) => {
  const contents = await ejs
    .renderFile(templatePath, data)
    .then((str) => formatFileContents(str));
  return fs.outputFile(outputPath, contents);
};

type ChakraIcon = {
  name: string;
  viewBox: string;
  path: string;
};
const processIcons = async (icons: Icons): Promise<ChakraIcon[]> => {
  // Take an SVGO object and modify it to use with Chakra UI
  const processIcon = async (
    key: string,
    icon: OptimisedSVG
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

export default async function exportChakraFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string
) {
  // Create a config for the templates by combining the design tokens with default Chakra values
  const chakra = {
    breakpoints: tokens.breakpoints,
    colours: tokens.colours,
    icons: await processIcons(tokens.icons),
    radii: {
      none: '0',
      ...tokens.radii,
      full: '9999px',
    },
    shadows: {
      ...tokens.shadows,
      none: 'none',
    },
    spacing: {
      px: '1px',
      '0': '0',
      ...tokens.spacing,
    },
    sizes: {
      full: '100%',
      ...tokens.sizes,
    },
    typography: {
      fonts: {
        // TODO: Support importing font stacks (e.g. "Roboto, Arial, sans-serif")
        ...Object.keys(tokens.typography.fonts).reduce((obj, name) => {
          const font = tokens.typography.fonts[name];
          return { ...obj, [name]: `"${font}", sans-serif` };
        }, {}),
        mono: '"Courier New", Courier, monospace',
      },
      fontSizes: tokens.typography.fontSizes,
      lineHeights: tokens.typography.lineHeights,
      letterSpacing: tokens.typography.letterSpacing,
    },
    textStyles: tokens.textStyles,
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
  ];

  // Render and save all the templates simultaneously
  await Promise.all(
    templates.map((template) => {
      return renderTemplate(template.input, template.output, {
        chakra,
        version,
        figmaFileKey,
      });
    })
  );
}
