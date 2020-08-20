import React from 'react';
import { Divider, Flex, Heading, Input, Stack } from '@chakra-ui/core';
import type { Story, Meta } from '@storybook/react';

import theme from '@/theme';

export default {
  title: 'Theme/Styles/Input',
} as Meta;

type ListProps = {
  property: 'variant' | 'size';
  values: string[];
  defaultValue?: string;
};
const List: React.FC<ListProps> = ({ property, values, defaultValue }) => {
  return (
    <Stack spacing={8}>
      {values.map((value) => (
        <Stack key={value} alignItems="flex-start" spacing={2}>
          <Flex direction="column">
            <Heading fontSize="14px" fontWeight="bold">
              {value}
            </Heading>
            {value === defaultValue && (
              <Heading fontSize="12px" fontWeight="semibold">
                default
              </Heading>
            )}
            <Divider marginTop={2} />
          </Flex>
          <Input {...{ [property]: value }} placeholder="Type here" />
        </Stack>
      ))}
    </Stack>
  );
};

export const Variants: Story = () => {
  const variants = Object.keys(theme.components.Input.variants ?? {});
  const defaultValue = theme.components.Input.defaultProps?.variant;
  return (
    <List property="variant" values={variants} defaultValue={defaultValue} />
  );
};

export const Sizes: Story = () => {
  const sizes = Object.keys(theme.components.Input.sizes ?? {});
  const defaultValue = theme.components.Input.defaultProps?.size;
  return <List property="size" values={sizes} defaultValue={defaultValue} />;
};
