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
} from '@chakra-ui/core';
import type { Story, Meta } from '@storybook/react';

import theme from '../theme';

export default {
  title: 'Theme/Variants',
} as Meta;

// Reusable component to display both heading and text variants
// All breakpoints are displayed if the variant has responsive font sizing
type Variant = {
  fontFamily: string | string[];
  fontSize: string | string[];
  fontStyle: string | string[];
  fontWeight: string | string[];
  letterSpacing: string | string[];
  lineHeight: string | string[];
};
type VariantListProps = {
  variants: { [key: string]: Variant };
  component: typeof Heading | typeof Text;
};
const VariantList: React.FC<VariantListProps> = ({
  variants,
  component: Component,
}) => {
  const variantKeys = Object.keys(variants);
  const renderExample = (variant: string, styles?: Variant) => {
    return (
      <Component variant={variant} {...styles}>
        The quick brown fox
        <br />
        jumps over the lazy dog
      </Component>
    );
  };
  return (
    <Stack spacing={8}>
      {variantKeys.map((key) => {
        const v = variants[key];
        // If the variant has any responsive values, render a text example for each breakpoint
        const isResponsive = Object.values(v).some((a) => Array.isArray(a));
        return (
          <Flex key={key} direction="column">
            <Heading
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
                    paddingY={4}
                    _hover={{ backgroundColor: 'gray.200' }}
                  >
                    <Box flex="1" fontWeight="bold" textAlign="left">
                      Responsive Styling
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel padding={0}>
                    <List>
                      {['0rem', ...theme.breakpoints].map(
                        (breakpointRem, i, breakpoints) => {
                          const breakpointPx = parseInt(breakpointRem, 10) * 16;
                          const next = parseInt(breakpoints[i + 1], 10) * 16;
                          let heading;
                          if (i === 0) {
                            heading = `< ${next}px`;
                          } else if (i < breakpoints.length - 1) {
                            heading = ` ${breakpointPx}px - ${next - 1}px`;
                          } else {
                            heading = ` >= ${breakpointPx}px`;
                          }
                          // Get the style values for the breakpoint we're rendering
                          const getValue = (value: string | string[]) =>
                            Array.isArray(value) ? value[i] : value;
                          const values = {
                            fontFamily: getValue(v.fontFamily),
                            fontSize: getValue(v.fontSize),
                            fontStyle: getValue(v.fontStyle),
                            fontWeight: getValue(v.fontWeight),
                            letterSpacing: getValue(v.letterSpacing),
                            lineHeight: getValue(v.lineHeight),
                          };
                          return (
                            <ListItem
                              key={breakpointRem}
                              borderBottom="2px solid"
                              borderColor="gray.100"
                              padding={8}
                              _last={{ border: 'none' }}
                            >
                              <Stack spacing={4}>
                                <Heading fontSize="12px">{heading}</Heading>
                                {renderExample(key, values)}
                              </Stack>
                            </ListItem>
                          );
                        }
                      )}
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

export const HeadingStory: Story = () => {
  return (
    <VariantList
      variants={theme.components.Heading.variants}
      component={Heading}
    />
  );
};
HeadingStory.storyName = 'Heading';

export const TextStory: Story = () => {
  return (
    <VariantList variants={theme.components.Text.variants} component={Text} />
  );
};
TextStory.storyName = 'Text';
