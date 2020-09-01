import 'dotenv/config';
import 'colors';
import path from 'path';
import rimraf from 'rimraf';

import { logError } from './utils';
import importTokensFromFigma from './import-figma';
import exportChakraFromTokens from './export-chakra';

const getEnvironmentVariables = (): [string, string] => {
  // Get API key and file URL from the environment variables
  const apiKey = process.env.FIGMA_API_KEY ?? '';
  const fileUrl = process.env.FIGMA_FILE_URL ?? '';
  if (!apiKey || !fileUrl) {
    if (!apiKey) {
      logError(
        'Please provide a value for the FIGMA_API_KEY environment variable.',
        '- An API key can be created in the "Personal Access Tokens" section of the Figma settings.'
      );
    }
    if (!fileUrl) {
      logError(
        'Please provide a value for the FIGMA_FILE_URL environment variable.',
        '- The URL of a Figma file can be copied by pressing "Share" and then "Copy link".'
      );
    }
    process.exit(1);
  }

  // Extract the file key from the URL
  const fileKeyMatch = fileUrl.match(/figma\.com\/file\/(.*)\//);
  const fileKey = fileKeyMatch ? fileKeyMatch[1] : '';
  if (!fileKey) {
    logError(
      'The FIGMA_FILE_URL environment variable seems to be invalid.',
      '- The URL of a Figma file can be copied by pressing "Share" and then "Copy link".'
    );
    process.exit(1);
  }

  return [apiKey, fileKey];
};

async function main() {
  // Fetch and validate API key and file key from environment variables
  const [apiKey, fileKey] = getEnvironmentVariables();

  // Load the Figma file and extract our design tokens
  console.log('Importing design tokens from the Figma file...'.bold);
  const tokens = await importTokensFromFigma(apiKey, fileKey);

  // Print the design token object to the console
  console.log('Finished generating the design tokens:'.bold);
  console.log(JSON.stringify(tokens, undefined, 2));

  // Generate a Chakra UI theme using the tokens
  const outputDir = path.resolve(__dirname, '../theme');
  console.log('Exporting Chakra UI theme to "theme" folder...'.bold);
  rimraf.sync(outputDir);
  await exportChakraFromTokens(tokens, outputDir, fileKey);
}

main().catch((e) => console.error(e));
