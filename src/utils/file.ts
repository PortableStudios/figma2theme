import ejs from 'ejs';
import fs from 'fs-extra';
import type { Data } from 'ejs';

// Render an EJS template with the given data and write the result to the output path
export const renderTemplate = async (
  templatePath: string,
  outputPath: string,
  data: Data
) => {
  const contents = await ejs.renderFile(templatePath, data);

  return fs.outputFile(outputPath, contents);
};
