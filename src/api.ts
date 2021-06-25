import * as Figma from 'figma-api';
import type { GetFileResult, GetVersionsResult } from 'figma-api/lib/api-types';

import { logError } from './utils/log';

// Fetch a Figma file using the file key and an optional version ID
export const getFile = async (
  api: Figma.Api,
  fileKey: string,
  version?: string
) => {
  let file: GetFileResult;
  try {
    file = await api.getFile(fileKey, { version });
  } catch (e) {
    logError(
      'There was an error loading the Figma file.',
      '- Please double check the values of your FIGMA_API_KEY and FIGMA_FILE_URL environment variables.'
    );
    process.exit(1);
  }

  return file;
};

// Fetch the list of Figma file versions using the file key
export const getVersions = async (api: Figma.Api, fileKey: string) => {
  let versions: GetVersionsResult;
  try {
    versions = await api.getVersions(fileKey);
  } catch (e) {
    logError(
      'There was an error loading the Figma file.',
      '- Please double check the values of your FIGMA_API_KEY and FIGMA_FILE_URL environment variables.'
    );
    process.exit(1);
  }

  return versions.versions;
};
