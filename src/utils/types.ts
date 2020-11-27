export type Dictionary<T> = { [key: string]: T };

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

export type Breakpoints = { [name: string]: string };

// From @types/svgo
export type OptimisedSVG = {
  data: string;
  info: {
    width: string;
    height: string;
  };
};
export type Icons = { [name: string]: OptimisedSVG };

export type Palette = Dictionary<string | Dictionary<string>>;

export type Radii = Dictionary<string>;

export type Shadows = Dictionary<string>;

export type Sizes = Dictionary<string>;

export type Spacing = Dictionary<string>;

export type Typography = {
  fonts: Dictionary<string>;
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
  textDecorationLine: string | string[];
  textTransform: string | string[];
};

export type Tokens = {
  breakpoints: Breakpoints;
  colours: Palette;
  icons: Icons;
  radii: Radii;
  shadows: Shadows;
  sizes: Sizes;
  spacing: Spacing;
  typography: Typography;
  textStyles: { [key: string]: TextVariant };
};
