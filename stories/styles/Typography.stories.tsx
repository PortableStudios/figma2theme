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
} from '@chakra-ui/core';
import type { Story, Meta } from '@storybook/react';

export default {
  title: 'Theme/Styles/Typography',
} as Meta;

// Reusable component to display both heading and text variants
// All breakpoints are displayed if the variant has responsive font sizing
type Variant = {
  fontFamily: string | { [breakpoint: string]: string };
  fontSize: string | { [breakpoint: string]: string };
  fontStyle: string | { [breakpoint: string]: string };
  fontWeight: string | { [breakpoint: string]: string };
  letterSpacing: string | { [breakpoint: string]: string };
  lineHeight: string | { [breakpoint: string]: string };
};
type VariantListProps = {
  variants: { [key: string]: Variant };
  component: typeof Heading | typeof Text;
};
const VariantList: React.FC<VariantListProps> = ({
  variants,
  component: Component,
}) => {
  const theme = useTheme();
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
        const isResponsive = Object.values(v).some(
          (a) => typeof a === 'object'
        );
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
                      {['base', ...Object.keys(theme.breakpoints)].map((bp) => {
                        const changes = Object.values(v).some(
                          (value) => typeof value === 'object' && bp in value
                        );
                        if (!changes) {
                          return null;
                        }

                        const breakpointPx =
                          parseInt(theme.breakpoints[bp], 10) * 16;
                        // Get the style values for the breakpoint we're rendering
                        const getValue = (
                          value: string | { [breakpoint: string]: string }
                        ) => {
                          return typeof value === 'object' ? value[bp] : value;
                        };
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
                            key={bp}
                            borderBottom="2px solid"
                            borderColor="gray.100"
                            padding={8}
                            _last={{ border: 'none' }}
                          >
                            <Stack spacing={4}>
                              <Heading fontSize="12px">
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

export const HeadingVariants: Story = () => {
  const theme = useTheme();
  return (
    <VariantList
      variants={theme.components.Heading?.variants ?? {}}
      component={Heading}
    />
  );
};

export const TextVariants: Story = () => {
  const theme = useTheme();
  return (
    <VariantList
      variants={theme.components.Text?.variants ?? {}}
      component={Text}
    />
  );
};
