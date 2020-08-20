import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Box, Divider, Flex, Heading, Stack } from '@chakra-ui/core';

import theme from '@/theme';

export default {
  title: 'Theme/Foundations',
} as Meta;

export const Breakpoints: Story = () => {
  const breakpoints = theme.breakpoints;
  return (
    <Box
      as="table"
      fontSize="14px"
      width="100%"
      sx={{ 'td,th': { padding: 2 } }}
    >
      <Box as="thead">
        <Box as="tr" backgroundColor="gray.200" textAlign="left">
          <Box as="th">Name</Box>
          <Box as="th">Size</Box>
          <Box as="th">Pixels</Box>
          <Box as="th" />
        </Box>
      </Box>
      <Box as="tbody">
        {(breakpoints as string[]).map((rem, i) => {
          const px = `${parseFloat(rem) * 16}px`;
          return (
            <Box key={rem} as="tr" borderTop="1px solid" borderColor="gray.200">
              <Box as="td">{i + 1}</Box>
              <Box as="td">{rem}</Box>
              <Box as="td">{px}</Box>
              <Box as="td">
                <Box backgroundColor="gray.400" height="12px" width={rem} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const Radii: Story = () => {
  const radii = theme.radii;
  return (
    <Stack spacing={4}>
      {Object.keys(radii).map((key) => {
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading fontSize="14px" fontWeight="bold">
                {key}
              </Heading>
              <Heading fontSize="12px" fontWeight="semibold">
                {radii[key as keyof typeof radii]}
              </Heading>
              <Divider marginTop={2} />
            </Flex>
            <Box
              backgroundColor="gray.400"
              borderRadius={key}
              height="64px"
              width="64px"
            />
          </Stack>
        );
      })}
    </Stack>
  );
};

export const Shadows: Story = () => {
  const shadows = theme.shadows;
  return (
    <Stack spacing={4}>
      {Object.keys(shadows).map((key) => {
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading fontSize="14px" fontWeight="bold">
                {key}
              </Heading>
              <Heading fontSize="12px" fontWeight="semibold">
                {shadows[key as keyof typeof shadows]}
              </Heading>
              <Divider marginTop={2} />
            </Flex>
            <Box
              backgroundColor="gray.400"
              boxShadow={key}
              height="64px"
              width="64px"
            />
          </Stack>
        );
      })}
    </Stack>
  );
};

export const Sizes: Story = () => {
  // Get the relevant sizing keys
  const sizeKeys = Object.keys(theme.sizes)
    .map((key) => {
      const size = theme.sizes[key as keyof typeof theme.sizes];
      // Skip nested sizes, spacing values and percentage based values
      const isNested = typeof size === 'object';
      const isSpacing = key === 'px' || /^\d+$/.test(key);
      const isPercentage = typeof size === 'string' && size.endsWith('%');
      if (isNested || isSpacing || isPercentage) {
        return undefined;
      }
      return key;
    })
    .filter((key): key is string => key !== undefined);

  // Get the values from the keys, calculate px size, sort by px size
  const sizes = sizeKeys
    .map((key) => {
      const size = theme.sizes[key as keyof typeof theme.sizes] as string;
      let px;
      if (size.endsWith('rem')) {
        px = parseFloat(size) * 16;
      } else {
        px = parseFloat(size);
      }

      return {
        name: key,
        size: size,
        px: px,
      };
    })
    .sort((a, b) => a.px - b.px);

  return (
    <Stack spacing={4}>
      <Heading fontSize="16px" fontWeight="bold">
        Spacing values are also available for sizing
      </Heading>
      <Box
        as="table"
        fontSize="14px"
        width="100%"
        sx={{ 'td,th': { padding: 2 } }}
      >
        <Box as="thead">
          <Box as="tr" backgroundColor="gray.200" textAlign="left">
            <Box as="th">Name</Box>
            <Box as="th">Size</Box>
            <Box as="th">Pixels</Box>
            <Box as="th" />
          </Box>
        </Box>
        <Box as="tbody">
          {sizes.map((size) => {
            return (
              <Box
                key={size.name}
                as="tr"
                borderTop="1px solid"
                borderColor="gray.200"
              >
                <Box as="td">{size.name}</Box>
                <Box as="td">{size.size}</Box>
                <Box as="td">{size.px}px</Box>
                <Box as="td">
                  <Box
                    backgroundColor="gray.400"
                    height="12px"
                    width={size.size}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
};

export const Spacing: Story = () => {
  const spacing = Object.keys(theme.spaces)
    .map((key) => {
      const size = theme.spaces[key as keyof typeof theme.spaces];
      let px;
      if (size.endsWith('rem')) {
        px = parseFloat(size) * 16;
      } else {
        px = parseFloat(size);
      }

      return {
        name: key,
        size: size,
        px: px,
      };
    })
    .sort((a, b) => a.px - b.px);

  return (
    <Box
      as="table"
      fontSize="14px"
      width="100%"
      sx={{ 'td,th': { padding: 2 } }}
    >
      <Box as="thead">
        <Box as="tr" backgroundColor="gray.200" textAlign="left">
          <Box as="th">Name</Box>
          <Box as="th">Size</Box>
          <Box as="th">Pixels</Box>
          <Box as="th" />
        </Box>
      </Box>
      <Box as="tbody">
        {spacing.map((space) => {
          return (
            <Box
              key={space.name}
              as="tr"
              borderTop="1px solid"
              borderColor="gray.200"
            >
              <Box as="td">{space.name}</Box>
              <Box as="td">{space.size}</Box>
              <Box as="td">{space.px}px</Box>
              <Box as="td">
                <Box
                  backgroundColor="gray.400"
                  height="12px"
                  width={space.size}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
