import React from 'react';
import {
  Divider,
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
      <Flex backgroundColor="gray.200" borderRadius="md" padding={4}>
        <Component variant={variant} {...styles}>
          The quick brown fox
          <br />
          jumps over the lazy dog
        </Component>
      </Flex>
    );
  };
  return (
    <Stack spacing={8}>
      {variantKeys.map((key) => {
        const v = variants[key];
        // If the variant has any responsive values, render a text example for each breakpoint
        const isResponsive = Object.values(v).some((a) => Array.isArray(a));
        return (
          <Stack key={key} spacing={2}>
            <Heading
              fontSize="24px"
              fontWeight="black"
              textTransform="capitalize"
            >
              {key}
            </Heading>
            {isResponsive ? (
              <List spacing={4}>
                {theme.breakpoints.map((breakpointRem, i) => {
                  const breakpointPx = parseInt(breakpointRem, 10) * 16;
                  const heading = `Breakpoint ${i + 1} (${breakpointPx}px)`;
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
                    <ListItem key={breakpointRem}>
                      <Flex direction="column" marginBottom={2}>
                        <Heading fontSize="12px" fontWeight="bold">
                          {heading}
                        </Heading>
                        <Divider marginTop={2} />
                      </Flex>
                      {renderExample(key, values)}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              renderExample(key)
            )}
          </Stack>
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
