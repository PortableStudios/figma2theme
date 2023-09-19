#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';

import { generateChakra, generateJson, generateTailwind, generateCss } from './generate';

import { version } from '../package.json';

const OPTIONS = {
  OUTPUT: {
    FLAGS: '-o, --output <dir>',
    DESCRIPTION: 'specify the output directory',
  },
  API: {
    FLAGS: '--api-key <key>',
    DESCRIPTION: 'specify the Figma API key',
  },
  URL: {
    FLAGS: '--file-url <url>',
    DESCRIPTION: 'specify the URL of the Figma file',
  },
  LATEST: {
    FLAGS: '--latest-changes',
    DESCRIPTION: 'use the most current, up-to-date version of the Figma file',
  },
};

const program = new Command();

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
  .option(OPTIONS.OUTPUT.FLAGS, OPTIONS.OUTPUT.DESCRIPTION, './theme')
  .option(OPTIONS.API.FLAGS, OPTIONS.API.DESCRIPTION)
  .option(OPTIONS.URL.FLAGS, OPTIONS.URL.DESCRIPTION)
  .option(OPTIONS.LATEST.FLAGS, OPTIONS.LATEST.DESCRIPTION)
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
  .option(OPTIONS.OUTPUT.FLAGS, OPTIONS.OUTPUT.DESCRIPTION, './')
  .option(OPTIONS.API.FLAGS, OPTIONS.API.DESCRIPTION)
  .option(OPTIONS.URL.FLAGS, OPTIONS.URL.DESCRIPTION)
  .option(OPTIONS.LATEST.FLAGS, OPTIONS.LATEST.DESCRIPTION)
  .action(async (cmd) => {
    const { output, apiKey, fileUrl, latestChanges } = cmd.opts();
    const outputDir = path.resolve(process.cwd(), output);
    await generateJson(outputDir, apiKey, fileUrl, latestChanges).catch((e) => {
      console.error(e);
    });
  });

program
  .command('generate-tailwind')
  .description('output a Tailwind config file')
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
    await generateTailwind(outputDir, apiKey, fileUrl, latestChanges).catch(
      (e) => {
        console.error(e);
      }
    );
  });

program
  .command('generate-css')
  .description('output a CSS file with custom properties')
  .storeOptionsAsProperties(true)
  .option(OPTIONS.OUTPUT.FLAGS, OPTIONS.OUTPUT.DESCRIPTION, './')
  .option(OPTIONS.API.FLAGS, OPTIONS.API.DESCRIPTION)
  .option(OPTIONS.URL.FLAGS, OPTIONS.URL.DESCRIPTION)
  .option(OPTIONS.LATEST.FLAGS, OPTIONS.LATEST.DESCRIPTION)
  .action(async (cmd) => {
    const { output, apiKey, fileUrl, latestChanges } = cmd.opts();
    const outputDir = path.resolve(process.cwd(), output);
    await generateCss(outputDir, apiKey, fileUrl, latestChanges).catch((e) => {
      console.error(e);
    });
  });

program.parseAsync(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
