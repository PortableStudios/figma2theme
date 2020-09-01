export type Dictionary<T> = { [key: string]: T };

export type Breakpoints = { [name: string]: string };

export type Palette = Dictionary<string | Dictionary<string>>;

export type Radii = Dictionary<string>;

export type Shadows = Dictionary<string>;

export type Sizes = Dictionary<string>;

export type Spacing = Dictionary<string>;

export type Typography = {
  fonts: {
    heading: string;
    body: string;
  };
  fontSizes: Dictionary<string>;
  lineHeights: Dictionary<string>;
  letterSpacing: Dictionary<string>;
};

export type TextVariant = {
  fontFamily: string | string[];
  fontSize: string | string[];
  fontStyle: string | string[];
  fontWeight: string | string[];
  letterSpacing: string | string[];
  lineHeight: string | string[];
};

export type Tokens = {
  breakpoints: Breakpoints;
  colours: Palette;
  radii: Radii;
  shadows: Shadows;
  sizes: Sizes;
  spacing: Spacing;
  typography: Typography;
  headingVariants: { [key: string]: TextVariant };
  textVariants: { [key: string]: TextVariant };
};
