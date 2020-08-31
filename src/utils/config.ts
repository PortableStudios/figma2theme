import fs from 'fs-extra';
import path from 'path';

import { logError } from './log';

// Read the API key and file URL config options from the .figma2themerc file
const getFileVariables = async (): Promise<{
  apiKey: string;
  fileUrl: string;
}> => {
  const filePath = path.resolve(process.cwd(), './.figma2themerc');
  // Return nothing if the file doesn't exist
  const fileExists = await fs.pathExists(filePath);
  if (!fileExists) {
    return { apiKey: '', fileUrl: '' };
  }

  // Otherwise read the file JSON and return the variables
  const json = await fs.readJSON(filePath);
  const apiKey = json.apiKey ?? '';
  const fileUrl = json.fileUrl ?? '';
  return { apiKey, fileUrl };
};

// Get the API key config option with the following priority:
// CLI arguments > Environment variables > .figma2themerc file
const getAPIKey = async (override?: string) => {
  let apiKey = override ?? '';
  // If it wasn't passed in through the CLI args, check the environment variables
  if (apiKey === '') {
    apiKey = process.env.FIGMA_API_KEY ?? '';
  }
  // If the environment variable is empty, check the .figma2themerc file
  if (apiKey === '') {
    apiKey = (await getFileVariables()).apiKey;
  }
  return apiKey;
};

// Get the file URL config option with the following priority:
// CLI arguments > Environment variables > .figma2themerc file
const getFileURL = async (override?: string) => {
  let fileUrl = override ?? '';
  // If it wasn't passed in through the CLI args, check the environment variables
  if (fileUrl === '') {
    fileUrl = process.env.FIGMA_FILE_URL ?? '';
  }
  // If the environment variable is empty, check the .figma2themerc file
  if (fileUrl === '') {
    fileUrl = (await getFileVariables()).fileUrl;
  }
  return fileUrl;
};

// Get the final config object
type Config = {
  apiKey: string;
  fileKey: string;
};
export default async function getConfig(
  apiKeyOverride?: string,
  fileUrlOverride?: string
): Promise<Config> {
  // Get the API key, throw an error if it's missing
  const apiKey = await getAPIKey(apiKeyOverride);
  if (apiKey === '') {
    logError('Please provide a value for the API key.', [
      '- An API key can be created in the "Personal Access Tokens" section of the Figma settings.',
      '- Provide the value through the CLI arguments (--api-key), the environment variables (FIGMA_API_KEY) or the .figma2themerc config file (apiKey).',
    ]);
    process.exit(1);
  }

  // Get the file URL, throw an error if it's missing
  const fileUrl = await getFileURL(fileUrlOverride);
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

  return { apiKey, fileKey };
}
