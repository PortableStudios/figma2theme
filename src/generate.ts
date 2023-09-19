import * as Figma from 'figma-api';
import 'dotenv/config';
import 'colors';
import path from 'path';
import prompts from 'prompts';
import { format, parseISO } from 'date-fns';
import type {
  GetFileResult,
  GetVersionsResult,
  Version,
} from 'figma-api/lib/api-types';

import getConfig from './utils/config';
import { getFile, getVersions } from './api';
import { exportChakra, exportJson, exportTailwind, exportCss } from './export';

import importTokensFromFigma from './import/import-figma';

import type { Tokens } from './utils/types';

// Get a formatted date for a Figma file version
const getChoiceDate = (iso8601: string) => {
  return format(parseISO(iso8601), 'yyyy-MM-dd @ k:mm');
};

// Get a title for a Figma file version
const getChoiceTitle = (version: Version) => {
  // Format the ISO8601 date string
  const date = getChoiceDate(version.created_at);
  // If the version has no label then it's an "autosave"
  const label = version.label ? `"${version.label}"` : 'Autosave';

  return `${label}, created: ${date}`;
};

type VersionOption = {
  title: string;
  value: { description: string; id?: string };
  disabled?: boolean;
};

// Display the list of Figma file versions for the user to choose from
const chooseVersion = async (
  file: GetFileResult,
  versions: GetVersionsResult['versions']
) => {
  // Create the list of options
  const options: VersionOption[] = [];

  // First add the option to use the latest, most up-to-date version of the file
  const lastUpdated = getChoiceDate(file.lastModified);
  options.push({
    title: `Latest changes to the file (last updated: ${lastUpdated})`,
    value: { description: 'latest', id: undefined },
  });

  // If the file has named versions, allow the user to use the latest one
  const latestNamedVersion = versions.find((version) => version.label !== null);
  if (latestNamedVersion) {
    const title = getChoiceTitle(latestNamedVersion);
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
      title: getChoiceTitle(v),
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

  return options.find((option) => {
    return option.value.id === response.version.id;
  });
};

// Generic function to import tokens from Figma and pass them to an 'exporter' callback
type Exporter = (
  tokens: Tokens,
  fileKey: string,
  versionDescription: string,
  fontFallbacks?: { [token: string]: string }
) => Promise<void>;
const generator = async (
  exporter: Exporter,
  apiKeyOverride: string | undefined,
  fileUrlOverride: string | undefined,
  latestChanges: boolean | undefined
) => {
  // Fetch the config variables
  const { apiKey, fileKey, fontFallbacks } = await getConfig(
    apiKeyOverride,
    fileUrlOverride
  );

  // Fetch the Figma file
  const api = new Figma.Api({ personalAccessToken: apiKey });
  const file = await getFile(api, fileKey);

  // If we aren't using the latest version, display a version selection menu
  let selectedVersion: VersionOption | undefined;
  if (latestChanges) {
    const lastUpdated = getChoiceDate(file.lastModified);
    const title = `Latest changes to the file (last updated: ${lastUpdated})`;
    selectedVersion = { title: title, value: { description: 'latest' } };
  } else {
    console.log('Fetching the list of Figma file versions...'.bold);
    const versions = await getVersions(api, fileKey);
    selectedVersion = await chooseVersion(file, versions);
  }

  // Load the Figma file and extract our design tokens
  console.log('Importing design tokens from the Figma file...'.bold);
  const version = selectedVersion?.value.id ?? undefined;
  const tokens = await importTokensFromFigma(apiKey, fileKey, version);

  // Run the passed exporter function with the extracted tokens
  await exporter(tokens, fileKey, selectedVersion?.title ?? '', fontFallbacks);
};

export const generateChakra = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string,
  latestChanges?: boolean
) => {
  // Generate a Chakra UI theme using the tokens
  const exporter: Exporter = async (
    tokens,
    fileKey,
    versionDescription,
    fontFallbacks
  ) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting Chakra UI theme to "${relativeDir}" folder...`.bold);
    await exportChakra(
      tokens,
      outputDir,
      fileKey,
      versionDescription,
      fontFallbacks
    );
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


export const generateTailwind = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string,
  latestChanges?: boolean
) => {
  // Generate a Tailwind config JS file using the tokens
  const exporter: Exporter = async (tokens, fileKey, versionDescription) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(
      `Exporting Tailwind config file to "${relativeDir}/tailwind.config.js"...`
        .bold
    );
    await exportTailwind(tokens, outputDir, fileKey, versionDescription);
  };
  
 return generator(exporter, apiKeyOverride, fileUrlOverride, latestChanges);
};
  
  
export const generateCss = async (
  outputDir: string,
  apiKeyOverride?: string,
  fileUrlOverride?: string,
  latestChanges?: boolean
) => {
  // Generate a CSS file using the tokens
  const exporter: Exporter = async (tokens) => {
    const relativeDir = path.relative(process.cwd(), outputDir);
    console.log(`Exporting CSS file to "${relativeDir}/tokens.css"...`.bold);
    await exportCss(tokens, outputDir);
  };
  
  return generator(exporter, apiKeyOverride, fileUrlOverride, latestChanges);
};
