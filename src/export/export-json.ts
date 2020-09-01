import fs from 'fs-extra';

import type { Tokens } from '../utils/types';

export default async function exportJsonFromTokens(
  tokens: Tokens,
  outputDir: string
) {
  await fs.mkdirs(outputDir);
  await fs.writeJson(`${outputDir}/tokens.json`, tokens, { spaces: 2 });
}
