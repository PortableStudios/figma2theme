#!/usr/bin/env node
import program from 'commander';
import path from 'path';

import { generateChakra, generateJson } from './generate';
import { version } from '../package.json';

program
  .name('figma2theme')
  .version(version)
  .description(
    'Portable tool that allows us to extract design tokens from a Figma file and use them to generate a theme'
  );

program
  .command('generate-chakra')
  .description('output a Chakra UI theme')
  .storeOptionsAsProperties(true)
  .option('-o, --output <dir>', 'specify the output directory', './theme')
  .option('--api-key <key>', 'specify the Figma API key')
  .option('--file-url <url>', 'specify the URL of the Figma file')
  .option(
    '--latest-changes',
    'use the most current, up-to-date version of the Figma file'
  )
  .action(async (cmd) => {
    const { output, apiKey, fileUrl, latestChanges } = cmd.opts();
    const outputDir = path.resolve(process.cwd(), output);
    await generateChakra(outputDir, apiKey, fileUrl, latestChanges).catch((e) =>
      console.error(e)
    );
  });

program
  .command('generate-json')
  .description('output a JSON file')
  .storeOptionsAsProperties(true)
  .option('-o, --output <dir>', 'specify the output directory', './')
  .option('--api-key <key>', 'specify the Figma API key')
  .option('--file-url <url>', 'specify the URL of the Figma file')
  .option(
    '--latest-changes',
    'use the most current, up-to-date version of the Figma file'
  )
  .action(async (cmd) => {
    const { output, apiKey, fileUrl, latestChanges } = cmd.opts();
    const outputDir = path.resolve(process.cwd(), output);
    await generateJson(outputDir, apiKey, fileUrl, latestChanges).catch((e) => {
      console.error(e);
    });
  });

program.parseAsync(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
