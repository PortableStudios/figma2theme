import * as Figma from 'figma-api';
import SVGO from 'svgo';
import fetch from 'node-fetch';
import setWith from 'lodash.setwith';
import colorConvert from 'color-convert';
import type { GetFileResult } from 'figma-api/lib/api-types';

import { logError } from '../utils/log';
import type {
  Dictionary,
  Breakpoints,
  Icons,
  OptimisedSVG,
  Palette,
  Radii,
  Shadows,
  Sizes,
  Spacing,
  Typography,
  TextVariant,
  Tokens,
} from '../utils/types';

/**
 * Figma utility functions
 */

// Fetch a Figma file using file key
const getFile = async (api: Figma.Api, fileKey: string) => {
  let file: GetFileResult;
  try {
    file = await api.getFile(fileKey);
  } catch (e) {
    logError(
      'There was an error loading the Figma file.',
      '- Please double check the values of your FIGMA_API_KEY and FIGMA_FILE_URL environment variables.'
    );
    process.exit(1);
  }
  return file;
};

// Fetch a canvas from a Figma document by the page name
const getPageCanvasByName = (
  document: Figma.Node<'DOCUMENT'>,
  pageName: string
): Figma.Node<'CANVAS'> | undefined => {
  return (
    document.children
      // Get all the page canvases from the document
      .filter((c): c is Figma.Node<'CANVAS'> => Figma.isNodeType(c, 'CANVAS'))
      // Return the first one that has a matching name
      .find((canvas) => {
        return canvas.name.toLowerCase() === pageName.toLowerCase();
      })
  );
};

// Recursively search through a Figma canvas to return all nodes of a certain type
type FindableNode = keyof Omit<Figma.NodeTypes, 'DOCUMENT' | 'CANVAS'>;
const getAllNodesByType = <T extends FindableNode>(
  type: T,
  from: Figma.Node<'CANVAS'>
): Figma.Node<T>[] => {
  const nodes: Figma.Node<T>[] = [];

  // Iterate through the child nodes
  for (let i = 0; i < from.children.length; i += 1) {
    const child = from.children[i];
    switch (child.type) {
      // If a node matchs the given type, scoop it up
      case type:
        nodes.push(child as Figma.Node<T>);
        break;
      case 'INSTANCE':
        // Skip component instances as they may have overridden values
        break;
      default:
        // Otherwise if the node has children, recursively search it
        if ('children' in child) {
          nodes.push(...getAllNodesByType(type, child as Figma.Node<'CANVAS'>));
        }
        break;
    }
  }

  return nodes;
};
// Helper function to get all rectangle nodes from a page
const getAllRectangleNodes = (from: Figma.Node<'CANVAS'>) =>
  getAllNodesByType('RECTANGLE', from);
// Helper function to get all text nodes from a page
const getAllTextNodes = (from: Figma.Node<'CANVAS'>) =>
  getAllNodesByType('TEXT', from);
// Helper function to get all component nodes from a page
const getAllComponentNodes = (from: Figma.Node<'CANVAS'>) =>
  getAllNodesByType('COMPONENT', from);

// Convert a Figma shadow "effect style" to a CSS box-shadow value
const convertFigmaShadowToCss = (shadow: Figma.EffectShadow): string => {
  // Use 'inset' for inner shadows
  const type = shadow.type === 'INNER_SHADOW' ? 'inset ' : '';

  // Convert shadow colour to CSS value
  const r = Math.round(shadow.color.r * 255);
  const g = Math.round(shadow.color.g * 255);
  const b = Math.round(shadow.color.b * 255);
  const a = parseFloat(shadow.color.a.toFixed(2));
  const colour = `rgba(${r}, ${g}, ${b}, ${a})`;

  // Convert shadow offset and radius to px
  // TODO: Add shadow spread when value is exposed by API
  const x = shadow.offset.x === 0 ? '0' : `${shadow.offset.x}px`;
  const y = shadow.offset.y === 0 ? '0' : `${shadow.offset.y}px`;
  const radius = shadow.radius === 0 ? '0' : `${shadow.radius}px`;

  return `${type}${x} ${y} ${radius} 0 ${colour}`;
};

// The `styles` property is incorrect in the `figma-api` types
// This utility function simply casts it to the correct type
type StyleMap = {
  effect?: string;
  fill?: string;
  text?: string;
};
const getStyleMap = (
  node: Figma.Node<'TEXT'> | Figma.Node<'RECTANGLE'>
): StyleMap | undefined => {
  return node.styles as StyleMap;
};

/**
 * Design token extraction functions
 */

// Extract 'breakpoint' design tokens from a canvas
const getBreakpoints = (canvas: Figma.Node<'CANVAS'>): Breakpoints => {
  const prefix = 'breakpoint-';
  const breakpoints = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'breakpoint-'
    .filter((r) => r.name.startsWith(prefix))
    // Get the name and pixel width of the rectangles
    .map((r) => ({
      name: r.name.replace(prefix, ''),
      width: r.absoluteBoundingBox.width,
    }))
    // Sort the widths in ascending order
    .sort((a, b) => a.width - b.width)
    // Convert pixels to rem
    .map((r) => ({
      name: r.name,
      width: `${r.width / 16}rem`,
    }));

  // Convert array to object
  return breakpoints.reduce(
    (obj, r) => ({
      ...obj,
      [r.name]: r.width,
    }),
    {}
  );
};

// Extract 'colour' design tokens from colour styles and a canvas, using name prefix
const getColours = (
  canvas: Figma.Node<'CANVAS'>,
  styles: Dictionary<Figma.Style>,
  prefix: string
): Palette => {
  // Get all the colour styles with the provided prefix in their name
  const colourStyles: Dictionary<string> = {};
  Object.keys(styles).forEach((key) => {
    const effect = styles[key];
    if (effect.name.startsWith(prefix)) {
      colourStyles[key] = effect.name.replace(prefix, '');
    }
  });

  // Get all the rectangles that are using one of the colour styles
  const rectangles = getAllRectangleNodes(canvas).filter((r) => {
    const fillKey = getStyleMap(r)?.fill;
    if (fillKey === undefined) {
      return false;
    }

    return Object.keys(colourStyles).includes(fillKey);
  });

  const palette: Palette = {};
  rectangles.forEach((r) => {
    const colour = r.fills[0].color;
    const fillKey = getStyleMap(r)?.fill;
    if (fillKey === undefined || colour === undefined) {
      return;
    }

    // Convert each colour from RGB to HEX
    const red = Math.round(colour.r * 255);
    const green = Math.round(colour.g * 255);
    const blue = Math.round(colour.b * 255);
    const hex = colorConvert.rgb.hex([red, green, blue]);
    const key = colourStyles[fillKey].replace(/\//g, '.');
    setWith(palette, key, `#${hex}`, Object);
  });

  return palette;
};

// Extract 'border radius' design tokens from a canvas
const getRadii = (canvas: Figma.Node<'CANVAS'>): Radii => {
  const prefix = 'radii-';
  const radii = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'radii-'
    .filter((r) => r.name.startsWith(prefix))
    // Get the name and border radius of the rectangles
    .map((r) => ({ name: r.name, cornerRadius: r.cornerRadius }))
    // Sort them in ascending order of radius
    .sort((a, b) => a.cornerRadius - b.cornerRadius)
    // Remove prefix from name and convert radius from px to rem
    .map((r) => ({
      name: r.name.replace(prefix, ''),
      cornerRadius: r.cornerRadius ? `${r.cornerRadius / 16}rem` : '0',
    }));

  // Convert array to object
  return radii.reduce(
    (obj, r) => ({
      ...obj,
      [r.name]: r.cornerRadius,
    }),
    {}
  );
};

// Extract 'box shadow' design tokens from a canvas
const getShadows = (
  canvas: Figma.Node<'CANVAS'>,
  styles: Dictionary<Figma.Style>
): Shadows => {
  // Get all the effect styles with a name prefixed 'shadow-'
  const prefix = 'shadow-';
  const shadowStyles: Dictionary<string> = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    if (style.name.startsWith(prefix)) {
      shadowStyles[key] = style.name.replace(prefix, '');
    }
  });

  // Get all the rectangles from the canvas that are using one of these effect styles
  const rectangles = getAllRectangleNodes(canvas).filter((r) => {
    const effectKey = getStyleMap(r)?.effect;
    if (effectKey === undefined) {
      return false;
    }

    return Object.keys(shadowStyles).includes(effectKey);
  });

  const shadows: Dictionary<string> = {};
  rectangles.forEach((r) => {
    const effects = r.effects;
    const effectKey = getStyleMap(r)?.effect;
    if (effects === undefined || effectKey === undefined) {
      return;
    }

    // Convert each shadow to a CSS `box-shadow` value, then join them
    shadows[shadowStyles[effectKey]] = effects
      .map((e) => convertFigmaShadowToCss(e as Figma.EffectShadow))
      .reverse()
      .join(', ');
  });

  return shadows;
};

// Extract 'sizes' design tokens from a canvas
const getSizes = (canvas: Figma.Node<'CANVAS'>): Sizes => {
  const prefix = 'size-';
  const sizes = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'size-'
    .filter((r) => r.name.startsWith(prefix))
    // Get the name and pixel size of the rectangles
    .map((r) => ({ name: r.name, size: r.absoluteBoundingBox.width }))
    // Sort them in ascending order of size
    .sort((a, b) => a.size - b.size)
    // Remove prefix from name and convert size from px to rem
    .map((r) => ({
      name: r.name.replace(prefix, ''),
      size: r.size > 1 ? `${r.size / 16}rem` : `${r.size}px`,
    }));

  // Convert array to object
  return sizes.reduce(
    (obj, s) => ({
      ...obj,
      [s.name]: s.size,
    }),
    {}
  );
};

// Extract 'spacing' design tokens from a canvas
const getSpacing = (canvas: Figma.Node<'CANVAS'>): Spacing => {
  const prefix = 'space-';
  const spacing = getAllComponentNodes(canvas)
    // Get all the components with a name prefixed 'space-'
    .filter((r) => r.name.startsWith(prefix))
    // Get the name and pixel size of the rectangles
    .map((r) => ({ name: r.name, size: r.absoluteBoundingBox.width }))
    // Sort them in ascending order of size
    .sort((a, b) => a.size - b.size)
    // Remove prefix from name and convert size from px to rem
    .map((r) => ({
      name: r.name.replace(prefix, ''),
      size: r.size > 1 ? `${r.size / 16}rem` : `${r.size}px`,
    }));

  // Convert array to object
  return spacing.reduce(
    (obj, s) => ({
      ...obj,
      [s.name]: s.size,
    }),
    {}
  );
};

// Extract 'font families' design tokens from a canvas
const getFontFamilies = (canvas: Figma.Node<'CANVAS'>): Typography['fonts'] => {
  const textElements = getAllTextNodes(canvas);

  // Get the text element named "font-heading", log an error and exit if it's missing
  const headingFontName = 'font-heading';
  const headingFont = textElements.find((e) => e.name === headingFontName);
  if (headingFont === undefined) {
    logError(
      'Heading font not found in "Typography" page',
      `- Please add a text element named "${headingFontName}".`
    );
    process.exit(1);
  }

  // Get the text element named "font-body", log an error and exit if it's missing
  const bodyFontName = 'font-body';
  const bodyFont = textElements.find((e) => e.name === bodyFontName);
  if (bodyFont === undefined) {
    logError(
      'Body font not found in "Typography" page',
      `- Please add a text element named "${bodyFontName}".`
    );
    process.exit(1);
  }

  return {
    heading: headingFont.style.fontFamily,
    body: bodyFont.style.fontFamily,
  };
};

// Extract 'font sizes' design tokens from a canvas
const getFontSizes = (
  canvas: Figma.Node<'CANVAS'>
): Typography['fontSizes'] => {
  const prefix = 'fontSize-';
  const fontSizes = getAllTextNodes(canvas)
    // Get all the text element with a name prefixed 'fontSize-'
    .filter((e) => e.name.startsWith(prefix))
    // Get the name and font size of the elements
    .map((e) => ({ name: e.name, size: e.style.fontSize }))
    // Sort them in ascending order of font size
    .sort((a, b) => a.size - b.size)
    // Remove prefix from name and convert font size from px to rem
    .map((s) => ({
      name: s.name.replace(prefix, ''),
      size: `${s.size / 16}rem`,
    }));

  // Convert array to object
  return fontSizes.reduce(
    (obj, s) => ({
      ...obj,
      [s.name]: s.size,
    }),
    {}
  );
};

const getLineHeightValue = (t: Figma.Node<'TEXT'>): string => {
  switch (t.style.lineHeightUnit) {
    case 'PIXELS':
      // If the line height is defined in pixels, convert to rem
      return `${t.style.lineHeightPx / 16}rem`;
    case 'FONT_SIZE_%':
      // If the line height is defined in percentage, convert to a decimal
      return `${(t.style.lineHeightPercentFontSize ?? 0) / 100}`;
    case 'INTRINSIC_%':
      // Otherwise the line height is equivalent to "normal" in CSS
      return 'normal';
    default:
      return '';
  }
};

// Extract 'line heights' design tokens from a canvas
const getLineHeights = (
  canvas: Figma.Node<'CANVAS'>
): Typography['lineHeights'] => {
  const prefix = 'lineHeight-';
  const lineHeights = getAllTextNodes(canvas)
    // Get all the text elements with a name prefixed 'lineHeight-'
    .filter((e) => e.name.startsWith(prefix))
    // Get the name and line height of the elements (removing the name prefix)
    .map((e) => ({
      name: e.name.replace(prefix, ''),
      lineHeight: getLineHeightValue(e),
    }));

  // Convert array to object
  return lineHeights.reduce(
    (obj, s) => ({
      ...obj,
      [s.name]: s.lineHeight,
    }),
    {}
  );
};

// Extract 'letter spacing' design tokens from a canvas
const getLetterSpacing = (
  canvas: Figma.Node<'CANVAS'>
): Typography['letterSpacing'] => {
  const prefix = 'letterSpacing-';
  const letterSpacing = getAllTextNodes(canvas)
    // Get all the text element with a name prefixed 'letterSpacing-'
    .filter((e) => e.name.startsWith(prefix))
    // Get the name and calculate the letter spacing %
    .map((e) => ({
      name: e.name,
      letterSpacing: e.style.letterSpacing / e.style.fontSize,
    }))
    // Sort them in ascending order of letter spacing
    .sort((a, b) => a.letterSpacing - b.letterSpacing)
    // Remove prefix from name and convert letter spacing to em
    .map((l) => {
      const ls = parseFloat(l.letterSpacing.toFixed(3));
      return {
        name: l.name.replace(prefix, ''),
        letterSpacing: ls === 0 ? '0' : `${ls}em`,
      };
    });

  // Convert array to object
  return letterSpacing.reduce(
    (obj, s) => ({
      ...obj,
      [s.name]: s.letterSpacing,
    }),
    {}
  );
};

const getTextDecorationValue = (t: Figma.Node<'TEXT'>): string => {
  switch (t.style.textDecoration) {
    case 'UNDERLINE':
      return 'underline';
    case 'STRIKETHROUGH':
      return 'line-through';
    case 'NONE':
    default:
      return 'none';
  }
};

const getTextTransformValue = (t: Figma.Node<'TEXT'>): string => {
  switch (t.style.textCase) {
    case 'UPPER':
      return 'uppercase';
    case 'LOWER':
      return 'lowercase';
    case 'TITLE':
      return 'capitalize';
    case 'ORIGINAL':
    default:
      return 'none';
  }
};

// Get the style values from a text element (i.e. font family, font size, etc.)
const getTextStyleValues = (t: Figma.Node<'TEXT'>): TextVariant => {
  const fontFamily = t.style.fontFamily;
  const fontSize = `${t.style.fontSize / 16}rem`;
  const fontStyle = t.style.italic ? 'italic' : 'normal';
  const fontWeight = `${t.style.fontWeight}`;
  const letterSpacing = `${parseFloat(
    (t.style.letterSpacing / t.style.fontSize).toFixed(3)
  )}em`;
  const lineHeight = getLineHeightValue(t);
  const textDecorationLine = getTextDecorationValue(t);
  const textTransform = getTextTransformValue(t);

  return {
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    letterSpacing,
    lineHeight,
    textDecorationLine,
    textTransform,
  };
};

const getTextStyles = (
  canvas: Figma.Node<'CANVAS'>,
  styles: Dictionary<Figma.Style>
): { [key: string]: TextVariant } => {
  // Get all the text styles
  const textStyles: Dictionary<string> = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    // `figma-api` defines incorrect `style_type` key for style type, get around this with type casting
    const styleType = ((style as unknown) as { styleType: string }).styleType;
    if (styleType === 'TEXT') {
      textStyles[key] = style.name;
    }
  });

  // Get all the text elements that are using one of the styles
  const textElements = getAllTextNodes(canvas).filter((t) => {
    const styleKey = getStyleMap(t)?.text;
    if (styleKey === undefined) {
      return false;
    }

    return Object.keys(textStyles).includes(styleKey);
  });

  // Extract the styles from each text element
  const variants: { [key: string]: TextVariant } = {};
  textElements.forEach((t) => {
    const styleKey = getStyleMap(t)?.text;
    if (styleKey === undefined) {
      return;
    }

    // Get the style values (i.e. font family, font size, etc.)
    const values = getTextStyleValues(t);
    // Get the style name and extract the breakpoint name if it exists (e.g. "sm" from "body/sm")
    let name = textStyles[styleKey];
    const bp = name.split('/')?.[1];

    if (bp) {
      // If the style does correspond to a breakpoint, add the values under that key
      name = name.replace(`/${bp}`, '');
      setWith(variants, `${name}.fontFamily.${bp}`, values.fontFamily);
      setWith(variants, `${name}.fontSize.${bp}]`, values.fontSize);
      setWith(variants, `${name}.fontStyle.${bp}]`, values.fontStyle);
      setWith(variants, `${name}.fontWeight.${bp}]`, values.fontWeight);
      setWith(variants, `${name}.letterSpacing.${bp}]`, values.letterSpacing);
      setWith(variants, `${name}.lineHeight.${bp}]`, values.lineHeight);
      setWith(
        variants,
        `${name}.textDecorationLine.${bp}]`,
        values.textDecorationLine
      );
      setWith(variants, `${name}.textTransform.${bp}]`, values.textTransform);
      return;
    }

    // Otherwise just assign the style object as normal
    variants[name] = values;
  });

  // Iterate over the styles and flatten any unnecessary responsive values
  // e.g. change `fontSize: { base: '1rem', sm: '1rem', md: '1rem' }` to just `fontSize: '1rem'`
  const flatten = (value: string | string[]) => {
    const objValues =
      typeof value === 'object' ? Object.values(value) : undefined;
    return objValues?.every((v) => v === objValues[0]) ? objValues[0] : value;
  };
  Object.keys(variants).forEach((k) => {
    const v = variants[k];
    variants[k] = {
      fontFamily: flatten(v.fontFamily),
      fontSize: flatten(v.fontSize),
      fontStyle: flatten(v.fontStyle),
      fontWeight: flatten(v.fontWeight),
      letterSpacing: flatten(v.letterSpacing),
      lineHeight: flatten(v.lineHeight),
      textDecorationLine: flatten(v.textDecorationLine),
      textTransform: flatten(v.textTransform),
    };
  });

  return variants;
};

type ProcessedIcon = {
  name: string;
  svg: OptimisedSVG;
};

// Extract SVG icons from a canvas
const getIcons = async (
  api: Figma.Api,
  fileKey: string,
  canvas: Figma.Node<'CANVAS'>
): Promise<Icons> => {
  const prefix = 'icon/custom/';
  const icons = getAllComponentNodes(canvas)
    // Get all the components with a name prefixed 'icon/custom/'
    .filter((r) => r.name.startsWith(prefix))
    // Get the name and node ID of the icon components
    .map((r) => ({
      name: r.name.replace(prefix, ''),
      id: r.id,
    }));

  if (icons.length === 0) {
    return {};
  }

  // Use the API to convert the icons to SVG images and get the image URLs back
  const iconIds = icons.map((i) => i.id);
  const response = await api.getImage(fileKey, {
    ids: iconIds.join(','),
    scale: 1,
    format: 'svg',
  });
  const imageUrls = response.images;

  // Take an image URL, fetch it and optimise it using SVGO
  const svgo = new SVGO();
  const processIcon = async (imageUrl: string): Promise<OptimisedSVG> => {
    const image = await fetch(imageUrl);
    const svg = await image.text();
    return svgo.optimize(svg);
  };

  // Process all the image URLs asynchronously using promises
  const processedIcons: (ProcessedIcon | undefined)[] = await Promise.all(
    Object.keys(imageUrls).map(async (id) => {
      const imageUrl = imageUrls[id] as string;
      const name = icons.find((i) => i.id === id)?.name?.trim() ?? '';
      if (name === '') {
        logError(
          'Found a custom icon with an invalid name, skipping...',
          `- Please find any components in the Figma file named "${prefix}" and give them a proper name (e.g. "${prefix}close-button")`
        );
        return undefined;
      }
      return {
        name: name,
        svg: await processIcon(imageUrl),
      };
    })
  );

  // Filter out the skipped icons then convert the array to an object with the names as keys
  return processedIcons
    .filter((x): x is ProcessedIcon => x !== undefined)
    .reduce(
      (obj, r) => ({
        ...obj,
        [r.name]: r.svg,
      }),
      {}
    );
};

/**
 * Script
 */

// The names of the pages we want to extract from the Figma file
const pageNames = {
  breakpoints: 'Breakpoints',
  colours: 'Colours',
  icons: 'Icons',
  radii: 'Radii',
  shadows: 'Shadows',
  sizes: 'Sizes',
  spacing: 'Spacing',
  typography: 'Typography',
};

export default async function importTokensFromFigma(
  apiKey: string,
  fileKey: string
): Promise<Tokens> {
  // Fetch the Figma file based on the API and file keys
  const api = new Figma.Api({ personalAccessToken: apiKey });
  const file = await getFile(api, fileKey);

  // Find all the page canvases we need to extract tokens from, log an error and exit if any are missing
  let missingPage = false;
  const canvases: Dictionary<Figma.Node<'CANVAS'>> = {};
  Object.keys(pageNames).forEach((k) => {
    const key = k as keyof typeof pageNames;
    const canvas = getPageCanvasByName(file.document, pageNames[key]);
    if (canvas === undefined) {
      logError(
        `Unable to find a page with the name "${pageNames[key]}" in the file.`,
        '- Please check that this page exists in the Figma file.'
      );
      missingPage = true;
      return;
    }
    canvases[key] = canvas;
  });
  if (missingPage) {
    process.exit(1);
  }

  // Extract the design tokens from the file and return them in a Tokens object
  return {
    breakpoints: getBreakpoints(canvases.breakpoints),
    colours: getColours(canvases.colours, file.styles, 'custom/'),
    icons: await getIcons(api, fileKey, canvases.icons),
    radii: getRadii(canvases.radii),
    shadows: getShadows(canvases.shadows, file.styles),
    sizes: getSizes(canvases.sizes),
    spacing: getSpacing(canvases.spacing),
    typography: {
      fonts: getFontFamilies(canvases.typography),
      fontSizes: getFontSizes(canvases.typography),
      lineHeights: getLineHeights(canvases.typography),
      letterSpacing: getLetterSpacing(canvases.typography),
    },
    textStyles: getTextStyles(canvases.typography, file.styles),
  };
}
