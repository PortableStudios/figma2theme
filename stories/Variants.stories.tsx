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
type FontSize = string | string[];
type VariantListProps = {
  variants: { [key: string]: FontSize };
  component: typeof Heading | typeof Text;
};

const VariantList: React.FC<VariantListProps> = ({
  variants,
  component: Component,
}) => {
  const variantKeys = Object.keys(variants);
  const renderExample = (variant: string, fontSize: string) => {
    return (
      <Flex backgroundColor="gray.200" borderRadius="md" padding={4}>
        <Component variant={variant} fontSize={fontSize} width="19ch">
          The quick brown fox jumps over the lazy dog
        </Component>
      </Flex>
    );
  };
  return (
    <Stack spacing={8}>
      {variantKeys.map((key) => {
        const fontSize = variants[key];
        return (
          <Stack key={key} spacing={2}>
            <Heading
              fontSize="24px"
              fontWeight="black"
              textTransform="capitalize"
            >
              {key}
            </Heading>
            {Array.isArray(fontSize) ? (
              <List spacing={4}>
                {fontSize.map((size, i) => {
                  const breakpoint = parseInt(theme.breakpoints[i], 10) * 16;
                  const heading = `Breakpoint ${i + 1} (${breakpoint}px)`;
                  return (
                    <ListItem key={size}>
                      <Flex direction="column" marginBottom={2}>
                        <Heading fontSize="12px" fontWeight="bold">
                          {heading}
                        </Heading>
                        <Divider marginTop={2} />
                      </Flex>
                      {renderExample(key, size)}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              renderExample(key, fontSize)
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};

const getVariants = (variants: { [key: string]: { fontSize: FontSize } }) => {
  return Object.keys(variants).reduce(
    (obj, key) => ({
      ...obj,
      [key]: variants[key].fontSize,
    }),
    {}
  );
};

export const HeadingStory: Story = () => {
  return (
    <VariantList
      variants={getVariants(theme.components.Heading.variants)}
      component={Heading}
    />
  );
};
HeadingStory.storyName = 'Heading';

export const TextStory: Story = () => {
  return (
    <VariantList
      variants={getVariants(theme.components.Text.variants)}
      component={Text}
    />
  );
};
TextStory.storyName = 'Text';
