import fs from 'fs-extra';
import ejs from 'ejs';

import type { Data } from 'ejs';

// Render an EJS template with the given data, format it with Prettier and write the result to the output path
export const renderTemplate = async (
  templatePath: string,
  outputPath: string,
  data: Data,
  formatFileContents: (s: string) => Promise<string>
) => {
  const contents = await ejs
    .renderFile(templatePath, data)
    .then((str) => formatFileContents(str));
  return fs.outputFile(outputPath, contents);
};
