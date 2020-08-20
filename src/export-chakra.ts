import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import prettier from 'prettier';
import type { Data } from 'ejs';

import type { Tokens } from './types';

const prettierConfigFile = path.resolve(__dirname, '../.prettierrc');
const templateDir = path.resolve(__dirname, '../templates');
const storiesDir = path.resolve(__dirname, '../stories');

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

export default async function exportChakraFromTokens(
  tokens: Tokens,
  outputDir: string,
  figmaFileKey: string
) {
  // Create a config for the templates by combining the design tokens with default Chakra values
  const chakra = {
    breakpoints: tokens.breakpoints,
    colours: tokens.colours,
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
        ...tokens.typography.fonts,
        heading: `"${tokens.typography.fonts.heading}", sans-serif`,
        body: `"${tokens.typography.fonts.body}", sans-serif`,
        mono: '"Courier New", Courier, monospace',
      },
      fontSizes: tokens.typography.fontSizes,
      lineHeights: tokens.typography.lineHeights,
      letterSpacing: tokens.typography.letterSpacing,
    },
    headingVariants: tokens.headingVariants,
    textVariants: tokens.textVariants,
  };

  // Specify which templates should be rendered and where they should be saved
  const templates = [
    {
      input: `${templateDir}/index.ts.ejs`,
      output: `${outputDir}/index.ts`,
    },
  ];

  // Render and save all the templates simultaneously
  await Promise.all(
    templates.map((template) => {
      return renderTemplate(template.input, template.output, {
        chakra,
        figmaFileKey,
      });
    })
  );

  // Copy the stories in to the output folder
  await fs.copy(storiesDir, `${outputDir}/stories`);
}
