import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { Decorator } from '@storybook/react-vite';

import theme from '../theme';

const withThemeProvider: Decorator = (Story) => {
  return (
    <ChakraProvider theme={theme}>
      <Story />
    </ChakraProvider>
  );
};

export const decorators = [withThemeProvider];
