import React from 'react';
import flatten from 'flat';
import { Story, Meta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import {
  Box,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/react';

import { ifFigmaDesignsForThemeEnabled } from '../utils';

export default {
  title: 'Theme/Foundations',
  decorators: [withDesign],
} as Meta;

export const Breakpoints: Story = () => {
  const theme = useTheme();
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
        {Object.entries<string>(breakpoints).map(([name, rem]) => {
          const px = `${parseFloat(rem) * 16}px`;
          return (
            <Box key={rem} as="tr" borderTop="1px solid" borderColor="gray.200">
              <Box as="td">{name}</Box>
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
Breakpoints.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=851%3A221',
  }),
};

export const Colours: Story = () => {
  const theme = useTheme();
  const colours = { ...theme.colors };
  delete colours.transparent;
  delete colours.current;
  delete colours.whiteAlpha;
  delete colours.blackAlpha;

  // Completely flatten the colours object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatColours = flatten(colours) as any;

  // Build the colours object back up to have a single layer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newColours: any = {};
  Object.keys(flatColours).forEach((key) => {
    const value = flatColours[key];
    const parts = key.split('.');

    if (parts.length === 1) {
      newColours[key] = value;
    } else {
      const group = parts.shift() as string;
      const rest = parts.join('.');
      if (!newColours[group]) newColours[group] = {};
      newColours[group][rest] = value;
    }
  });

  return (
    <Stack spacing={4}>
      {Object.keys(newColours).map((key) => {
        const value = newColours[key as keyof typeof newColours];
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading
                fontFamily="sans-serif"
                fontSize="14px"
                fontWeight="bold"
              >
                {key}
              </Heading>
              {typeof value !== 'object' && (
                <Heading
                  fontFamily="sans-serif"
                  fontSize="12px"
                  fontWeight="semibold"
                >
                  {newColours[key as keyof typeof newColours]}
                </Heading>
              )}
              <Divider marginTop={2} />
            </Flex>
            {typeof value === 'object' ? (
              <Stack isInline spacing={2}>
                {Object.keys(value).map((key2) => {
                  const value2 = value[key2];
                  return (
                    <Stack key={key2} spacing={2}>
                      <Heading
                        fontFamily="sans-serif"
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
                        fontSize="13px"
                        fontWeight="bold"
                        height="80px"
                        justifyContent="center"
                        textAlign="center"
                        width="80px"
                      >
                        <Text
                          color="white"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                          textShadow="0 0 1px black, 0 0 2px black"
                        >
                          {key2.split('.').join('.ㅤ')}
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
                height="80px"
                width="80px"
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
Colours.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=1053%3A326',
  }),
};

export const CustomIcons: Story = () => {
  const theme = useTheme();
  const customIcons = theme.customIcons;
  console.log({ customIcons });
  const hasCustomIcons = customIcons && Object.keys(customIcons).length > 0;
  return (
    <Stack spacing={4}>
      {hasCustomIcons ? (
        Object.keys(customIcons).map((key) => {
          const IconComponent = customIcons[key as keyof typeof customIcons];
          return (
            <Stack key={key} spacing={2}>
              <Flex direction="column">
                <Heading
                  fontFamily="sans-serif"
                  fontSize="14px"
                  fontWeight="bold"
                >
                  {key}
                </Heading>
                <Divider marginTop={2} />
              </Flex>
              <IconComponent fontSize="64px" />
            </Stack>
          );
        })
      ) : (
        <Heading fontFamily="sans-serif" fontSize="16px" fontWeight="bold">
          No custom icons found in the theme
        </Heading>
      )}
    </Stack>
  );
};
CustomIcons.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=697%3A0',
  }),
};

export const Radii: Story = () => {
  const theme = useTheme();
  const radii = theme.radii;
  return (
    <Stack spacing={4}>
      {Object.keys(radii).map((key) => {
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading
                fontFamily="sans-serif"
                fontSize="14px"
                fontWeight="bold"
              >
                {key}
              </Heading>
              <Heading
                fontFamily="sans-serif"
                fontSize="12px"
                fontWeight="semibold"
              >
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
Radii.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=855%3A48',
  }),
};

export const Shadows: Story = () => {
  const theme = useTheme();
  const shadows = theme.shadows;
  return (
    <Stack spacing={4}>
      {Object.keys(shadows).map((key) => {
        return (
          <Stack key={key} spacing={2}>
            <Flex direction="column">
              <Heading
                fontFamily="sans-serif"
                fontSize="14px"
                fontWeight="bold"
              >
                {key}
              </Heading>
              <Heading
                fontFamily="sans-serif"
                fontSize="12px"
                fontWeight="semibold"
              >
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
Shadows.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=860%3A0',
  }),
};

export const Sizes: Story = () => {
  const theme = useTheme();
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
      <Heading fontFamily="sans-serif" fontSize="16px" fontWeight="bold">
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
Sizes.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=1022%3A4',
  }),
};

export const Spacing: Story = () => {
  const theme = useTheme();
  const spacing = Object.keys(theme.space)
    .map((key) => {
      const size = theme.space[key];
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
Spacing.parameters = {
  design: ifFigmaDesignsForThemeEnabled({
    type: 'figma',
    url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=860%3A112',
  }),
};
