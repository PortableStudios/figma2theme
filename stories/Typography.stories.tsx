import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/core';

import theme from '../theme';

export default {
  title: 'Theme/Foundations/Typography',
} as Meta;

type SectionProps = {
  property: string;
  values: { [key: string]: string | number };
};
const Section: React.FC<SectionProps> = ({ property, values }) => {
  return (
    <Stack spacing={4}>
      {Object.keys(values).map((key) => {
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading fontSize="14px" fontWeight="bold">
                {key}
              </Heading>
              <Heading fontSize="12px" fontWeight="semibold">
                {values[key as keyof typeof values]}
              </Heading>
            </Flex>
            <Box border="2px solid" borderColor="gray.100" padding={4}>
              <Text {...{ [property]: key }}>
                The quick brown fox
                <br />
                jumps over the lazy dog
              </Text>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};

export const FontStacks: Story = () => (
  <Section property="fontFamily" values={theme.fonts} />
);

export const FontSizes: Story = () => (
  <Section property="fontSize" values={theme.fontSizes} />
);

export const FontWeights: Story = () => (
  <Section property="fontWeight" values={theme.fontWeights} />
);

export const LineHeights: Story = () => (
  <Section property="lineHeight" values={theme.lineHeights} />
);

export const LetterSpacings: Story = () => (
  <Section property="letterSpacing" values={theme.letterSpacings} />
);
