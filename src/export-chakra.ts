import fs from 'fs-extra';
import ejs from 'ejs';
import path from 'path';
import prettier from 'prettier';
import type { Data } from 'ejs';

import type { Tokens } from './types';

const prettierConfigFile = path.resolve(__dirname, '../.prettierrc');
const templateDir = path.resolve(__dirname, '../templates');

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
  outputDir: string
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
    // Index
    {
      input: `${templateDir}/index.ts.ejs`,
      output: `${outputDir}/index.ts`,
    },
    // Components
    {
      input: `${templateDir}/components/index.ts.ejs`,
      output: `${outputDir}/components/index.ts`,
    },
    {
      input: `${templateDir}/components/headingVariants.ts.ejs`,
      output: `${outputDir}/components/headingVariants.ts`,
    },
    {
      input: `${templateDir}/components/textVariants.ts.ejs`,
      output: `${outputDir}/components/textVariants.ts`,
    },
    // Foundations
    {
      input: `${templateDir}/foundations/index.ts.ejs`,
      output: `${outputDir}/foundations/index.ts`,
    },
    {
      input: `${templateDir}/foundations/breakpoints.ts.ejs`,
      output: `${outputDir}/foundations/breakpoints.ts`,
    },
    {
      input: `${templateDir}/foundations/colors.ts.ejs`,
      output: `${outputDir}/foundations/colors.ts`,
    },
    {
      input: `${templateDir}/foundations/radius.ts.ejs`,
      output: `${outputDir}/foundations/radius.ts`,
    },
    // TODO: Export shadows when the shadow "spread" value is returned by the Figma API
    // {
    //   input: `${templateDir}/foundations/shadows.ts.ejs`,
    //   output: `${outputDir}/foundations/shadows.ts`,
    // },
    {
      input: `${templateDir}/foundations/sizes.ts.ejs`,
      output: `${outputDir}/foundations/sizes.ts`,
    },
    {
      input: `${templateDir}/foundations/spaces.ts.ejs`,
      output: `${outputDir}/foundations/spaces.ts`,
    },
    {
      input: `${templateDir}/foundations/typography.ts.ejs`,
      output: `${outputDir}/foundations/typography.ts`,
    },
  ];

  // Render and save all the templates simultaneously
  await Promise.all(
    templates.map((template) => {
      return renderTemplate(template.input, template.output, { chakra });
    })
  );
}
