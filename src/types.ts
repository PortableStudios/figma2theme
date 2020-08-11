export type Dictionary<T> = { [key: string]: T };

export type Breakpoints = string[];

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

export type Tokens = {
  breakpoints: Breakpoints;
  colours: {
    portable: Palette;
    brand: Palette;
  };
  radii: Radii;
  shadows: Shadows;
  sizes: Sizes;
  spacing: Spacing;
  typography: Typography;
};
