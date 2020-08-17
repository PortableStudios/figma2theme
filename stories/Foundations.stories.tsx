import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Box, Divider, Flex, Heading, Stack, Text } from '@chakra-ui/core';

import theme from '../theme';

export default {
  title: 'Theme/Foundations',
} as Meta;

export const Breakpoints: Story = () => {
  const breakpoints = theme.breakpoints;
  return (
    <Stack spacing={4}>
      <Heading fontSize="24px" fontWeight="black">
        Breakpoints
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
          {breakpoints.map((rem, i) => {
            const px = `${parseFloat(rem) * 16}px`;
            return (
              <Box
                key={rem}
                as="tr"
                borderTop="1px solid"
                borderColor="gray.200"
              >
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
    </Stack>
  );
};

export const Colours: Story = () => {
  const sections = [
    {
      name: 'Project Colours',
      colours: theme.colors.brand,
    },
    {
      name: 'Portable Colours',
      colours: theme.colors.portable,
    },
  ];
  return (
    <Stack spacing={8}>
      {sections.map((section) => (
        <Stack key={section.name} spacing={4}>
          <Heading fontSize="24px" fontWeight="black">
            {section.name}
          </Heading>
          <Stack spacing={4}>
            {Object.keys(section.colours).map((key) => {
              const value =
                section.colours[key as keyof typeof section.colours];
              return (
                <Stack key={key} spacing={2}>
                  <Flex direction="column">
                    <Heading fontSize="14px" fontWeight="bold">
                      {key}
                    </Heading>
                    {typeof value !== 'object' && (
                      <Heading fontSize="12px" fontWeight="semibold">
                        {section.colours[key as keyof typeof section.colours]}
                      </Heading>
                    )}
                    <Divider marginTop={2} />
                  </Flex>
                  {typeof value === 'object' ? (
                    <Stack isInline spacing={2}>
                      {Object.keys(value).map((key2) => {
                        const value2 = value[key2];
                        return (
                          <Stack spacing={2}>
                            <Heading
                              fontSize="12px"
                              fontWeight="semibold"
                              textAlign="center"
                            >
                              {value2}
                            </Heading>
                            <Flex
                              alignItems="center"
                              backgroundColor={value2}
                              borderRadius="md"
                              boxShadow="lg"
                              flexShrink={0}
                              fontWeight="bold"
                              height="64px"
                              justifyContent="center"
                              width="64px"
                            >
                              <Text color="white" textShadow="0 0 2px black">
                                {key2}
                              </Text>
                            </Flex>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      backgroundColor={value}
                      borderRadius="md"
                      boxShadow="lg"
                      height="64px"
                      width="64px"
                    />
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export const Radii: Story = () => {
  const radii = theme.radii;
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Heading fontSize="24px" fontWeight="black">
          Radii
        </Heading>
      </Stack>
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
    </Stack>
  );
};

export const Shadows: Story = () => {
  const shadows = theme.shadows;
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Heading fontSize="24px" fontWeight="black">
          Shadows
        </Heading>
      </Stack>
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
      <Stack spacing={2}>
        <Heading fontSize="24px" fontWeight="black">
          Sizes
        </Heading>
        <Heading fontSize="16px" fontWeight="bold">
          Spacing values are also available for sizing
        </Heading>
      </Stack>
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
    <Stack spacing={4}>
      <Heading fontSize="24px" fontWeight="black">
        Spacing
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
    </Stack>
  );
};

export const Typography: Story = () => {
  const sections = [
    {
      title: 'Font Stacks',
      key: 'fontFamily',
      values: theme.fonts,
    },
    {
      title: 'Font Sizes',
      key: 'fontSize',
      values: theme.fontSizes,
    },
    {
      title: 'Font Weight',
      key: 'fontWeight',
      values: theme.fontWeights,
    },
    {
      title: 'Line Heights',
      key: 'lineHeight',
      values: theme.lineHeights,
    },
    {
      title: 'Letter Spacings',
      key: 'letterSpacing',
      values: theme.letterSpacings,
    },
  ] as const;

  return (
    <Stack spacing={4}>
      <Heading fontSize="24px" fontWeight="black">
        Typography
      </Heading>
      {sections.map((section) => {
        return (
          <Stack id={section.key} spacing={2}>
            <Heading fontSize="20px" fontWeight="bold">
              {section.title}
            </Heading>
            <Stack
              borderLeft="2px solid"
              borderColor="gray.100"
              paddingLeft={4}
              paddingY={2}
              spacing={8}
            >
              {Object.keys(section.values).map((key) => {
                return (
                  <Stack key={key} spacing={2}>
                    <Flex direction="column">
                      <Heading fontSize="14px" fontWeight="bold">
                        {key}
                      </Heading>
                      <Heading fontSize="12px" fontWeight="semibold">
                        {section.values[key as keyof typeof section.values]}
                      </Heading>
                      <Divider marginTop={2} />
                    </Flex>
                    <Text {...{ [section.key]: key }}>
                      The quick brown fox
                      <br />
                      jumps over the lazy dog
                    </Text>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};
