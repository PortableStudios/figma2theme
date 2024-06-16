import ejs from 'ejs';
import path from 'path';
import fs from 'fs-extra';
import prettier from 'prettier';
import type { Data } from 'ejs';

const prettierConfigFile = path.resolve(__dirname, '../../.prettierrc');

// Run Prettier on TypeScript code using the config file
const formatFileContents = async (contents: string) => {
  const options = await prettier.resolveConfig(prettierConfigFile);

  return prettier.format(contents, { ...options, parser: 'typescript' });
};

// Render an EJS template with the given data, format it with Prettier and write the result to the output path
export const renderTemplate = async (
  templatePath: string,
  outputPath: string,
  data: Data
) => {
  let contents = await ejs.renderFile(templatePath, data);
  contents = await formatFileContents(contents);

  return fs.outputFile(outputPath, contents);
};
