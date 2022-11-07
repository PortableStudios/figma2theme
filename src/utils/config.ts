import fs from 'fs-extra';
import path from 'path';

import { logError } from './log';

// Specify the keys for each configuration option
// i.e. the env variable name and the key for the .figma2themerc JSON
type Keys = {
  env: string;
  file: string;
};
const configKeys = {
  apiKey: {
    env: 'FIGMA_API_KEY',
    file: 'apiKey',
  },
  fileUrl: {
    env: 'FIGMA_FILE_URL',
    file: 'fileUrl',
  },
} as const;

// Get the JSON from the .figma2themerc config file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getConfigFileJSON = async (): Promise<any> => {
  const filePath = path.resolve(process.cwd(), './.figma2themerc');
  return (await fs.pathExists(filePath)) ? fs.readJSON(filePath) : {};
};

// Get a config value with the following priority:
// CLI arguments > Environment variables > .figma2themerc file
const getValue = async (keys: Keys, override?: string): Promise<string> => {
  let value = override ?? '';
  // If the value wasn't passed through CLI arguments, check environment variables
  if (value === '') {
    value = process.env[keys.env] ?? '';
  }
  // If the environment variable was empty, check the .figma2themerc file
  if (value === '') {
    const configFile = await getConfigFileJSON();
    value = configFile[keys.file] ?? '';
  }
  return value;
};

// Get the final config object
type Config = {
  apiKey: string;
  fileKey: string;
  fontFallbacks?: { [token: string]: string };
};
export default async function getConfig(
  apiKeyOverride?: string,
  fileUrlOverride?: string
): Promise<Config> {
  // Get the API key, throw an error if it's missing
  const apiKey = await getValue(configKeys.apiKey, apiKeyOverride);
  if (apiKey === '') {
    logError('Please provide a value for the API key.', [
      '- An API key can be created in the "Personal Access Tokens" section of the Figma settings.',
      '- Provide the value through the CLI arguments (--api-key), the environment variables (FIGMA_API_KEY) or the .figma2themerc config file (apiKey).',
    ]);
    process.exit(1);
  }

  // Get the file URL, throw an error if it's missing
  const fileUrl = await getValue(configKeys.fileUrl, fileUrlOverride);
  if (fileUrl === '') {
    logError('Please provide a value for the Figma file URL.', [
      '- The URL of a Figma file can be copied by pressing "Share" and then "Copy link".',
      '- Provide the value through the CLI arguments (--file-url), the environment variables (FIGMA_FILE_URL) or the .figma2themerc config file (fileUrl).',
    ]);
    process.exit(1);
  }

  // Get the file key from the file URL, throw an error if the URL is malformed
  const fileKeyMatch = fileUrl.match(/figma\.com\/file\/(.*)\//);
  const fileKey = fileKeyMatch ? fileKeyMatch[1] : '';
  if (fileKey === '') {
    logError('Your Figma file URL seems to be invalid.', [
      `- The URL we found was: ${fileUrl}`,
      '- The URL of a Figma file can be copied by pressing "Share" and then "Copy link".',
    ]);
    process.exit(1);
  }

  // Get the "fontFallbacks" object from the config file
  const configFileJson = await getConfigFileJSON();
  const fontFallbacks = configFileJson.fontFallbacks;

  return { apiKey, fileKey, fontFallbacks };
}
