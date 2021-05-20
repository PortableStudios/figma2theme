import React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { withDesign } from 'storybook-addon-designs';
import type { Story, Meta } from '@storybook/react';

import { ifFigmaDesignsForThemeEnabled } from '../utils';

export default {
  title: 'Theme/Styles/Typography',
  decorators: [withDesign],
  parameters: {
    design: ifFigmaDesignsForThemeEnabled({
      type: 'figma',
      url: 'https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit?node-id=621%3A763',
    }),
  },
} as Meta;

// Display the various "text styles" from the theme, including how they look at each breakpoint
type TextStyleValue = string | { [breakpoint: string]: string };
type TextStyle = {
  fontFamily: TextStyleValue;
  fontSize: TextStyleValue;
  fontStyle: TextStyleValue;
  fontWeight: TextStyleValue;
  letterSpacing: TextStyleValue;
  lineHeight: TextStyleValue;
};
export const TextStyles: Story = () => {
  const theme = useTheme();
  const breakpointKeys = Object.keys(theme.breakpoints).filter((k) => {
    // Exclude integer keys
    return !/^\+?\d+$/.test(k);
  });

  const textStyles = theme.textStyles ?? {};
  const textStyleKeys = Object.keys(textStyles);
  const renderExample = (style: string, overrides?: TextStyle) => {
    return (
      <Text
        textStyle={overrides === undefined ? style : undefined}
        {...overrides}
      >
        The quick brown fox
        <br />
        jumps over the lazy dog
      </Text>
    );
  };
  return (
    <Stack spacing={8}>
      {textStyleKeys.map((key) => {
        const style = textStyles[key];
        // If the style has any responsive values, render a text example for each breakpoint
        const isResponsive = Object.values(style).some(
          (v) => typeof v === 'object'
        );
        return (
          <Flex key={key} direction="column">
            <Heading
              fontFamily="sans-serif"
              fontSize="24px"
              fontWeight="black"
              textTransform="capitalize"
            >
              {key}
            </Heading>
            <Box
              border="2px solid"
              borderColor="gray.100"
              marginTop={4}
              padding={8}
            >
              {renderExample(key)}
            </Box>
            {isResponsive && (
              <Accordion
                allowToggle
                border="2px solid"
                borderTop="none"
                borderColor="gray.100"
              >
                <AccordionItem border="none">
                  <AccordionButton
                    backgroundColor="gray.100"
                    padding={4}
                    _hover={{ backgroundColor: 'gray.200' }}
                  >
                    <Box flex="1" fontWeight="bold" textAlign="left">
                      Responsive Styling
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel padding={0}>
                    <List>
                      {breakpointKeys.map((bp) => {
                        const changes = Object.values(style).some(
                          (v) => typeof v === 'object' && v !== null && bp in v
                        );
                        if (!changes) {
                          return null;
                        }

                        const breakpointPx =
                          parseInt(theme.breakpoints[bp], 10) * 16;
                        // Get the style values for the breakpoint we're rendering
                        const getValue = (value: TextStyleValue) => {
                          return typeof value === 'object' ? value[bp] : value;
                        };
                        const values = {
                          fontFamily: getValue(style.fontFamily),
                          fontSize: getValue(style.fontSize),
                          fontStyle: getValue(style.fontStyle),
                          fontWeight: getValue(style.fontWeight),
                          letterSpacing: getValue(style.letterSpacing),
                          lineHeight: getValue(style.lineHeight),
                        };
                        return (
                          <ListItem
                            key={bp}
                            borderBottom="2px solid"
                            borderColor="gray.100"
                            padding={8}
                            _last={{ border: 'none' }}
                          >
                            <Stack spacing={4}>
                              <Heading fontFamily="sans-serif" fontSize="12px">
                                {bp}
                                {bp !== 'base' && ` (${breakpointPx}px+)`}
                              </Heading>
                              {renderExample(key, values)}
                            </Stack>
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </Flex>
        );
      })}
    </Stack>
  );
};
