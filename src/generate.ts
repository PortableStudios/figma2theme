import * as Figma from 'figma-api';
import 'dotenv/config';
import 'colors';
import path from 'path';
import rimraf from 'rimraf';
import prompts from 'prompts';
import importTokensFromFigma from './import/import-figma';
import type { Version } from 'figma-api/lib/api-types';

import getConfig from './utils/config';
import { getFile, getVersions } from './api';
import { exportChakra, exportJson } from './export';

import type { Tokens } from './utils/types';

// Generate a title for a Figma file version
const generateChoiceTitle = (version: Version) => {
  // If the version has no label then it's an "autosave"
  if (!version.label) {
    return `Autosave - ${version.created_at}`;
  }

  return `"${version.label}" - ${version.created_at}`;
};

type VersionOption = {
  title: string;
  value: { description: string; id?: string };
  disabled?: boolean;
};

// Fetch and display the list of Figma file versions to the user to choose from
const chooseVersion = async (apiKey: string, fileKey: string) => {
  const api = new Figma.Api({ personalAccessToken: apiKey });
  const versions = await getVersions(api, fileKey);
  const latest = await getFile(api, fileKey);
  const latestNamedVersion = versions.find((version) => version.label !== null);

  // Create the list of options
  const options: VersionOption[] = [];

  // First add the option to use the latest, most up-to-date version of the file
  options.push({
    title: `Latest changes to the file (${latest.lastModified})`,
    value: { description: 'latest', id: undefined },
  });

  // If the file has named versions, allow the user to use the latest one
  if (latestNamedVersion) {
    const title = generateChoiceTitle(latestNamedVersion);
    options.push({
      title: `Latest named version of the file (${title})`,
      value: { description: 'latest-named', id: latestNamedVersion.id },
    });
  }

  // Add a spacer between the convenience options and the list of specific versions
  options.push({
    title: '------------------------------',
    value: { description: 'spacer' },
    disabled: true,
  });

  // Add the list of specific versions
  versions.forEach((v) => {
    options.push({
      title: generateChoiceTitle(v),
      value: { description: 'autosave', id: v.id },
    });
  });

  // Prompt the user to select a version and return their choice
  const response = await prompts({
    type: 'select',
    name: 'version',
    message: 'Please select which version of the Figma file to use:',
    choices: options,
    initial: 0,
  });

  return response.version as VersionOption['value'];
};

// Generic function to import tokens from Figma and pass them to an 'exporter' callback
type Exporter = (tokens: Tokens, fileKey: string) => Promise<void>;
const generator = async (
  exporter: Exporter,
  apiKeyOverride: string | undefined,
  fileUrlOverride: string | undefined,
  latestChanges: boolean | undefined
) => {
  // Fetch the config variables
  const { apiKey, fileKey } = await getConfig(apiKeyOverride, fileUrlOverride);

  // If we aren't using the latest version, display a version selection menu
  let version;
  if (!latestChanges) {
    console.log('Fetching the list of Figma file versions...'.bold);
    version = await chooseVersion(apiKey, fileKey);
  }

  // Load the Figma file and extract our design tokens
  console.log('Importing design tokens from the Figma file...'.bold);
  const tokens = await importTokensFromFigma(apiKey, fileKey, version?.id);

  // Run the passed exporter function with the extracted tokens
  await exporter(tokens, fileKey);
};

export const generateChakra = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string,
  latestChanges?: boolean
) => {
  // Generate a Chakra UI theme using the tokens
  const exporter: Exporter = async (tokens, fileKey) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting Chakra UI theme to "${relativeDir}" folder...`.bold);
    rimraf.sync(outputDir);
    await exportChakra(tokens, outputDir, fileKey);
  };

  return generator(exporter, apiKeyOverride, fileUrlOverride, latestChanges);
};

export const generateJson = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string,
  latestChanges?: boolean
) => {
  // Generate a JSON file using the tokens
  const exporter: Exporter = async (tokens) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting JSON file to "${relativeDir}/tokens.json"...`.bold);
    await exportJson(tokens, outputDir);
  };

  return generator(exporter, apiKeyOverride, fileUrlOverride, latestChanges);
};
