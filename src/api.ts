import * as Figma from 'figma-api';

import { logError } from './utils/log';

import type { GetFileResult, GetVersionsResult } from 'figma-api/lib/api-types';

// Fetch a Figma file using file key
const getFile = async (api: Figma.Api, fileKey: string, version?: string) => {
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

// Fetch figma versions suing file key
const getVersions = async (api: Figma.Api, fileKey: string) => {
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

export { getFile, getVersions };
