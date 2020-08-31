import 'dotenv/config';
import 'colors';
import path from 'path';
import rimraf from 'rimraf';

import getConfig from '../utils/config';
import importTokensFromFigma from '../import/import-figma';
import exportChakraFromTokens from '../export/export-chakra';

export default async function generate(
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string
) {
  // Fetch the config variables
  const { apiKey, fileKey } = await getConfig(apiKeyOverride, fileUrlOverride);

  // Load the Figma file and extract our design tokens
  console.log('Importing design tokens from the Figma file...'.bold);
  const tokens = await importTokensFromFigma(apiKey, fileKey);

  // Generate a Chakra UI theme using the tokens
  const relativeDir = path.relative(process.cwd(), outputDir);
  console.log(`Exporting Chakra UI theme to "${relativeDir}" folder...`.bold);
  rimraf.sync(outputDir);
  await exportChakraFromTokens(tokens, outputDir, fileKey);
}
