import React from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/core';
import type { StoryWrapper } from '@storybook/addons';

import theme from '../theme';

const withThemeProvider: StoryWrapper = (Story, context) => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Story {...context} />
    </ChakraProvider>
  );
};

export const decorators = [withThemeProvider];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};
