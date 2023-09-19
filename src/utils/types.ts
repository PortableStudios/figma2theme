/**
 * Utility types
 */

export type Dictionary<T> = { [key: string]: T };

export type NestedDictionary<T> = { [key: string]: T | NestedDictionary<T> };

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * Define the dictionary for breakpoint tokens, e.g.
 * ```json
 * {
 *   "sm": { "$type": "dimension", "$value": "30em" },
 *   "md": { "$type": "dimension", "$value": "48em" },
 *   "lg": { "$type": "dimension", "$value": "62em" }
 * }
 * ```
 */

export type BreakpointValue = string;
export type BreakpointToken = { $type: 'dimension'; $value: BreakpointValue };
export type BreakpointTokens = Dictionary<BreakpointToken>;

/**
 * Define the dictionary for colour tokens, e.g.
 * ```json
 * {
 *  "background": { "$type": "color", "$value": "#FFFFFF" },
 *  "interaction": {
 *    "focused": { "$type": "color", "$value": "#68ADE7" }
 *  },
 *  "surface": {
 *    "primary": {
 *      "default": { "$type": "color", "$value": "#FFFFFF" },
 *      "muted": { "$type": "color", "$value": "#F4F5F7" },
 *      "hover": { "$type": "color", "$value": "#E8EBEE" }
 *    }
 *  }
 * }
 * ```
 */

export type ColourValue = string;
export type ColourToken = { $type: 'color'; $value: ColourValue };
export type ColourTokens = NestedDictionary<ColourToken>;

/**
 * Define the dictionary for grid styles, e.g.
 * ```json
 * {
 *  "page": {
 *    "columns": {
 *      "base": { "$type": "number", "$value": 1 },
 *      "sm": { "$type": "number", "$value": 2 },
 *      "md": { "$type": "number", "$value": 3 }
 *    },
 *    "gutter": {
 *      "base": { "$type": "dimension", "$value": "0.25rem" },
 *      "sm": { "$type": "dimension", "$value": "0.5rem" },
 *      "md": { "$type": "dimension", "$value": "1rem" }
 *    },
 *    "margin" {
 *      "base": { "$type": "dimension", "$value": "0.25rem" },
 *      "sm": { "$type": "dimension", "$value": "0.5rem" },
 *      "md": { "$type": "dimension", "$value": "1rem" }
 *    }
 *  }
 * }
 * ```
 */

export type GridColumnValue = number;
export type GridColumnToken = { $type: 'number'; $value: GridColumnValue };

export type GridGutterValue = string;
export type GridGutterToken = { $type: 'dimension'; $value: GridGutterValue };

export type GridMarginValue = string;
export type GridMarginToken = { $type: 'dimension'; $value: GridMarginValue };

export type GridVariantToken = {
  columns: Dictionary<GridColumnToken>;
  gutter: Dictionary<GridGutterToken>;
  margin: Dictionary<GridMarginToken>;
};
export type GridVariantTokens = Dictionary<GridVariantToken>;

/**
 * Define the dictionary for SVG icons, e.g.
 * ```json
 * {
 *  "zig-zag": {
 *    "$value": {
 *      "data": "<svg width=\"24\" height=\"24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m12 18-9-3 18-6-9-3\" stroke=\"#000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
 *      "info": { "width": "24", "height": "24" }
 *    }
 *  }
 * }
 * ```
 */

export type IconValue = {
  data: string;
  info: { width: string; height: string };
};
export type IconToken = { $value: IconValue };
export type IconTokens = Dictionary<IconToken>;

/**
 * Define the dictionary for radii, e.g.
 * ```json
 * {
 *  "radii": {
 *    "sm": { "$type": "dimension", "$value": "0.125rem" },
 *    "md": { "$type": "dimension", "$value": "0.25rem" },
 *    "lg": { "$type": "dimension", "$value": "0.5rem" }
 *  }
 * }
 * ```
 */

export type RadiiValue = string;
export type RadiiToken = { $type: 'dimension'; $value: RadiiValue };
export type RadiiTokens = Dictionary<RadiiToken>;

/**
 * Define the dictionary for shadows, e.g.
 * ```json
 * {
 *  "outline": {
 *    "$type": "shadow",
 *    "$value": [
 *      {
 *        "inset": false,
 *        "color": "#4299e199",
 *        "offsetX": "0px",
 *        "offsetY": "0px",
 *        "blur": "0px",
 *        "spread": "3px"
 *      }
 *    ]
 *  }
 * }
 * ```
 */

export type ShadowValue = {
  inset: boolean;
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
};
export type ShadowToken = { $type: 'shadow'; $value: ShadowValue[] };
export type ShadowTokens = Dictionary<ShadowToken>;

/**
 * Define the dictionary for sizes, e.g.
 * ```json
 * {
 *  "sm": { "$type": "dimension", "$value": "24rem" },
 *  "md": { "$type": "dimension", "$value": "28rem" },
 *  "lg": { "$type": "dimension", "$value": "32rem" }
 * }
 * ```
 */

export type SizeValue = string;
export type SizeToken = { $type: 'dimension'; $value: SizeValue };
export type SizeTokens = Dictionary<SizeToken>;

/**
 * Define the dictionary for spacing, e.g.
 * ```json
 * {
 *  "1": { "$type": "dimension", "$value": "0.25rem" },
 *  "2": { "$type": "dimension", "$value": "0.5rem" },
 *  "3": { "$type": "dimension", "$value": "0.75rem" }
 *  "4": { "$type": "dimension", "$value": "1rem" }
 * }
 * ```
 */

export type SpacingValue = string;
export type SpacingToken = { $type: 'dimension'; $value: SpacingValue };
export type SpacingTokens = Dictionary<SizeToken>;

/**
 * Define the dictionary for typography, e.g.
 * ```json
 * {
 *  "fonts": {
 *    "heading": { "$type": "fontFamily", "$value": "Noto Serif" },
 *    "body": { "$type": "fontFamily", "$value": "Noto Sans" }
 *  },
 *  "fontSizes": {
 *    "sm": { "$type": "dimension", "$value": "1rem" },
 *    "md": { "$type": "dimension", "$value": "2rem" },
 *    "lg": { "$type": "dimension", "$value": "3rem" }
 *  },
 *  "lineHeights": {
 *    "none": { "$type": "string", "$value": "1" },
 *    "normal": { "$type": "string", "$value": "normal" },
 *    "short": { "$type": "string", "$value": "1.25" },
 *    "base": { "$type": "string", "$value": "1.5" },
 *    "tall": { "$type": "string", "$value": "1.75" }
 *  },
 *  "letterSpacing": {
 *    "tight": { "$type": "dimension", "$value": "-0.05em" },
 *    "normal": { "$type": "dimension", "$value": "0" },
 *    "wide": { "$type": "dimension", "$value": "0.05em" }
 *  }
 * }
 * ```
 */

export type FontFamilyValue = string;
export type FontFamilyToken = { $type: 'fontFamily'; $value: FontFamilyValue };
export type FontFamilyTokens = Dictionary<FontFamilyToken>;

export type FontSizeValue = string;
export type FontSizeToken = { $type: 'dimension'; $value: FontSizeValue };
export type FontSizeTokens = Dictionary<FontSizeToken>;

export type LineHeightValue = string;
export type LineHeightToken = { $type: 'string'; $value: LineHeightValue };
export type LineHeightTokens = Dictionary<LineHeightToken>;

export type LetterSpacingValue = string;
export type LetterSpacingToken = {
  $type: 'dimension';
  $value: LetterSpacingValue;
};
export type LetterSpacingTokens = Dictionary<LetterSpacingToken>;

export type TypographyTokens = {
  fonts: FontFamilyTokens;
  fontSizes: FontSizeTokens;
  lineHeights: LineHeightTokens;
  letterSpacing: LetterSpacingTokens;
};

/**
 * Define the dictionary for text styles, e.g.
 * ```json
 * {
 *  "h1": {
 *    "$type": "typography",
 *    "$value": {
 *      "fontFamily": "Noto Serif",
 *      "fontSize": {
 *        "base": "2rem",
 *        "md": "3rem",
 *        "xl", "4rem"
 *      },
 *      "fontStyle": "normal",
 *      "fontWeight", "700",
 *      "letterSpacing": "0em",
 *      "lineHeight": {
 *        "base": "2.75rem",
 *        "md": "3.75rem",
 *        "lg": "4.5rem"
 *      },
 *      "textDecorationLine": "none",
 *      "textTransform": "none"
 *    }
 *  }
 * }
 * ```
 */

export type TextStyleValue = {
  fontFamily: string | Dictionary<string>;
  fontSize: string | Dictionary<string>;
  fontStyle: string | Dictionary<string>;
  fontWeight: string | Dictionary<string>;
  letterSpacing: string | Dictionary<string>;
  lineHeight: string | Dictionary<string>;
  textDecorationLine: string | Dictionary<string>;
  textTransform: string | Dictionary<string>;
};
export type TextStyleToken = { $type: 'typography'; $value: TextStyleValue };
export type TextStyleTokens = Dictionary<TextStyleToken>;

/**
 * Define the token object which holds all of the raw design tokens.
 */
export type Tokens = {
  breakpoints: BreakpointTokens;
  colours: ColourTokens;
  gridStyles: GridVariantTokens;
  icons: IconTokens;
  radii: RadiiTokens;
  shadows: ShadowTokens;
  sizes: SizeTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  textStyles: TextStyleTokens;
};

/**
 * Define the token object which is expected by our Chakra UI exporter.
 */
export type ChakraTokens = {
  breakpoints: Dictionary<BreakpointValue>;
  colours: NestedDictionary<ColourValue>;
  gridStyles: Dictionary<{
    columns: Dictionary<GridColumnValue>;
    gutter: Dictionary<GridGutterValue>;
    margin: Dictionary<GridMarginValue>;
  }>;
  icons: Dictionary<IconValue>;
  radii: Dictionary<RadiiValue>;
  shadows: Dictionary<string>;
  sizes: Dictionary<SizeValue>;
  spacing: Dictionary<SpacingValue>;
  typography: {
    fonts: Dictionary<FontFamilyValue>;
    fontSizes: Dictionary<FontSizeValue>;
    lineHeights: Dictionary<LineHeightValue>;
    letterSpacing: Dictionary<LetterSpacingValue>;
  };
  textStyles: Dictionary<TextStyleValue>;
};

export type TailwindConfig = {
  content: string[];
  theme: {
    spacing: Spacing;
    screens: Breakpoints;
    colors: Palette;
    borderRadius: Radii;
    dropShadow: Shadows;
    fontFamily: Dictionary<string[]>;
    fontSize: Dictionary<string>;
    lineHeight: Dictionary<string>;
    letterSpacing: Dictionary<string>;
  };
  componentDefinitions: Dictionary<Dictionary<string>>;
};
