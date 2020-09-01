import 'dotenv/config';
import 'colors';
import path from 'path';
import rimraf from 'rimraf';

import getConfig from './utils/config';
import importTokensFromFigma from './import/import-figma';
import { exportChakra, exportJson } from './export';
import type { Tokens } from './utils/types';

// Generic function to import tokens from Figma and pass them to an 'exporter' callback
type Exporter = (tokens: Tokens, fileKey: string) => Promise<void>;
const generator = async (
  exporter: Exporter,
  apiKeyOverride: string | undefined,
  fileUrlOverride: string | undefined
) => {
  // Fetch the config variables
  const { apiKey, fileKey } = await getConfig(apiKeyOverride, fileUrlOverride);

  // Load the Figma file and extract our design tokens
  console.log('Importing design tokens from the Figma file...'.bold);
  const tokens = await importTokensFromFigma(apiKey, fileKey);

  // Run the passed exporter function with the extracted tokens
  await exporter(tokens, fileKey);
};

export const generateChakra = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string
) => {
  // Generate a Chakra UI theme using the tokens
  const exporter: Exporter = async (tokens, fileKey) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting Chakra UI theme to "${relativeDir}" folder...`.bold);
    rimraf.sync(outputDir);
    await exportChakra(tokens, outputDir, fileKey);
  };
  return generator(exporter, apiKeyOverride, fileUrlOverride);
};

export const generateJson = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string
) => {
  // Generate a JSON file using the tokens
  const exporter: Exporter = async (tokens) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting JSON file to "${relativeDir}/tokens.json"...`.bold);
    await exportJson(tokens, outputDir);
  };
  return generator(exporter, apiKeyOverride, fileUrlOverride);
};
