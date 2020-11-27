import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { StoryWrapper } from '@storybook/addons';

import theme from '../theme';

const withThemeProvider: StoryWrapper = (Story, context) => {
  return (
    <ChakraProvider theme={theme}>
      <Story {...context} />
    </ChakraProvider>
  );
};

export const decorators = [withThemeProvider];
