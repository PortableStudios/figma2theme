import * as Figma from 'figma-api';
import 'dotenv/config';
import 'colors';
import path from 'path';
import rimraf from 'rimraf';
import prompts from 'prompts';
import importTokensFromFigma from './import/import-figma';

import getConfig from './utils/config';
import { getFile, getVersions } from './api';
import { exportChakra, exportJson } from './export';

import type { Tokens } from './utils/types';

// Generate choice title from figma data
// Note: If no label, presume its a autosave
const generateChoiceTitle = ({
  label,
  created_at,
}: {
  label?: string;
  created_at: string;
}) => (label ? `"${label}" - ${created_at}` : `Autosave - ${created_at}`);

type VersionReturnType = { description: string; id: string | undefined };

// Use 'prompts' to decide what version figma file you want to use
const chooseVersion = async (
  apiKey: string,
  fileKey: string
): Promise<VersionReturnType> => {
  const api = new Figma.Api({ personalAccessToken: apiKey });
  const versions = await getVersions(api, fileKey);
  const latest = await getFile(api, fileKey);
  const latestNamedVersion = versions.find((version) => version.label !== null);

  const choiceOptions = [
    {
      title: `Latest changes to the file (${latest.lastModified})`,
      // Leaving 'id' undfined will mean the latest figma file will be pulled down.
      value: { description: 'latest', id: undefined },
    },
    ...(latestNamedVersion
      ? [
          {
            title: `Latest named version of the file (${generateChoiceTitle(
              latestNamedVersion
            )})`,
            value: {
              description: 'latest-named',
              id: latestNamedVersion.id,
            },
          },
        ]
      : []),
    { title: '------------------------------', value: '', disabled: true },
    ...versions.map((version) => ({
      title: generateChoiceTitle(version),
      value: { description: 'autosave', id: version.id },
    })),
  ];

  const response = await prompts({
    type: 'select',
    name: 'version',
    message: 'Please select which version of the Figma file to use:',
    choices: choiceOptions,
    initial: 0,
  });

  return response.version;
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

  let version: VersionReturnType | undefined;

  // If --lastest-change flag
  if (latestChanges) {
    console.log('fetching latest figma file...'.bold);
  } else {
    console.log('fetching versions of figma file...'.bold);
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
