import React from 'react';
import {
  Button,
  Divider,
  Flex,
  Heading,
  Stack,
  useTheme,
} from '@chakra-ui/react';
import type { StoryFn, Meta } from '@storybook/react-vite';

export default {
  title: 'Theme/Styles/Button',
  argTypes: { onClick: { action: 'clicked' } },
} as Meta;

type ListProps = {
  property: 'variant' | 'size';
  values: string[];
  defaultValue?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};
const List: React.FC<ListProps> = ({
  property,
  values,
  defaultValue,
  onClick,
}) => {
  return (
    <Stack spacing={8}>
      {values.map((value) => (
        <Stack key={value} alignItems="flex-start" spacing={2}>
          <Flex direction="column">
            <Heading fontFamily="sans-serif" fontSize="14px" fontWeight="bold">
              {value}
            </Heading>
            {value === defaultValue && (
              <Heading
                fontFamily="sans-serif"
                fontSize="12px"
                fontWeight="semibold"
              >
                default
              </Heading>
            )}
            <Divider marginTop={2} />
          </Flex>
          <Button {...{ [property]: value }} onClick={onClick}>
            Click Me!
          </Button>
        </Stack>
      ))}
    </Stack>
  );
};

export const Variants: StoryFn = ({ onClick }) => {
  const theme = useTheme();
  const variants = Object.keys(theme.components.Button.variants ?? {});
  const defaultValue = theme.components.Button.defaultProps?.variant;
  return (
    <List
      property="variant"
      values={variants}
      defaultValue={defaultValue}
      onClick={onClick}
    />
  );
};

export const Sizes: StoryFn = ({ onClick }) => {
  const theme = useTheme();
  const sizes = Object.keys(theme.components.Button.sizes ?? {});
  const defaultValue = theme.components.Button.defaultProps?.size;
  return (
    <List
      property="size"
      values={sizes}
      defaultValue={defaultValue}
      onClick={onClick}
    />
  );
};
