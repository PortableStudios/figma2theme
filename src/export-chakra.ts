import { logError } from './utils';
import type { Tokens } from './types';

export default async function exportChakraFromTokens(
  _tokens: Tokens,
  _outputDir: string
) {
  logError(
    'Chakra export has not been implemented yet.',
    '- Please ask Darcy to write the code.'
  );
  process.exit(1);
}
