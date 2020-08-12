import * as Figma from 'figma-api';
import setWith from 'lodash.setwith';
import colorConvert from 'color-convert';
import type { GetFileResult } from 'figma-api/lib/api-types';

import { logError } from './utils';
import type {
  Dictionary,
  Breakpoints,
  Palette,
  Radii,
  Shadows,
  Sizes,
  Spacing,
  Typography,
  Tokens,
} from './types';

/**
 * Figma utility functions
 */

// Fetch a Figma file using API and file keys
const getFile = async (apiKey: string, fileKey: string) => {
  let file: GetFileResult;
  try {
    const api = new Figma.Api({ personalAccessToken: apiKey });
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

/**
 * Design token extraction functions
 */

// Extract 'breakpoint' design tokens from a canvas
const getBreakpoints = (canvas: Figma.Node<'CANVAS'>): Breakpoints => {
  return (
    getAllRectangleNodes(canvas)
      // Get all the rectangles named 'breakpoint'
      .filter((r) => r.name === 'breakpoint')
      // Get the pixel width of the rectangles
      .map((r) => r.absoluteBoundingBox.width)
      // Sort the widths in ascending order
      .sort((a, b) => a - b)
      // Convert pixels to rem
      .map((px) => `${px / 16}rem`)
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

  const getFillKey = (r: Figma.Node<'RECTANGLE'>): string | undefined => {
    // The `styles` property is incorrect in the `figma-api` types
    const styleMap = r.styles as { fill?: string };
    return styleMap.fill;
  };

  // Get all the rectangles that are using one of the colour styles
  const rectangles = getAllRectangleNodes(canvas).filter((r) => {
    const fillKey = getFillKey(r);
    if (fillKey === undefined) {
      return false;
    }

    return Object.keys(colourStyles).includes(fillKey);
  });

  const palette: Palette = {};
  rectangles.forEach((r) => {
    const colour = r.fills[0].color;
    const fillKey = getFillKey(r);
    if (fillKey === undefined || colour === undefined) {
      return;
    }

    // Convert each colour from RGB to HEX
    const red = Math.round(colour.r * 255);
    const green = Math.round(colour.g * 255);
    const blue = Math.round(colour.b * 255);
    const hex = colorConvert.rgb.hex([red, green, blue]);
    setWith(palette, colourStyles[fillKey], `#${hex}`, Object);
  });

  return palette;
};

// Extract 'border radius' design tokens from a canvas
const getRadii = (canvas: Figma.Node<'CANVAS'>): Radii => {
  const radii = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'radii_'
    .filter((r) => r.name.startsWith('radii_'))
    // Get the name and border radius of the rectangles
    .map((r) => ({ name: r.name, cornerRadius: r.cornerRadius }))
    // Sort them in ascending order of radius
    .sort((a, b) => a.cornerRadius - b.cornerRadius)
    // Remove "radii_" prefix from name and convert radius from px to rem
    .map((r) => ({
      name: r.name.replace('radii_', ''),
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
  // Get all the effect styles with a name prefixed 'shadow_'
  const shadowStyles: Dictionary<string> = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    if (style.name.startsWith('shadow_')) {
      shadowStyles[key] = style.name.replace('shadow_', '');
    }
  });

  const getEffectKey = (r: Figma.Node<'RECTANGLE'>): string | undefined => {
    // The `styles` property is incorrect in the `figma-api` types
    const styleMap = r.styles as { effect?: string };
    return styleMap.effect;
  };

  // Get all the rectangles from the canvas that are using one of these effect styles
  const rectangles = getAllRectangleNodes(canvas).filter((r) => {
    const effectKey = getEffectKey(r);
    if (effectKey === undefined) {
      return false;
    }

    return Object.keys(shadowStyles).includes(effectKey);
  });

  const shadows: Dictionary<string> = {};
  rectangles.forEach((r) => {
    const effects = r.effects;
    const effectKey = getEffectKey(r);
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
  const sizes = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'size_'
    .filter((r) => r.name.startsWith('size_'))
    // Get the name and pixel size of the rectangles
    .map((r) => ({ name: r.name, size: r.absoluteBoundingBox.width }))
    // Sort them in ascending order of size
    .sort((a, b) => a.size - b.size)
    // Remove "size_" prefix from name and convert size from px to rem
    .map((r) => ({
      name: r.name.replace('size_', ''),
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
  const spacing = getAllRectangleNodes(canvas)
    // Get all the rectangles with a name prefixed 'space_'
    .filter((r) => r.name.startsWith('space_'))
    // Get the name and pixel size of the rectangles
    .map((r) => ({ name: r.name, size: r.absoluteBoundingBox.width }))
    // Sort them in ascending order of size
    .sort((a, b) => a.size - b.size)
    // Remove "space_" prefix from name and convert size from px to rem
    .map((r) => ({
      name: r.name.replace('space_', ''),
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

  // Get the text element named "font_heading", log an error and exit if it's missing
  const headingFont = textElements.find((e) => e.name === 'font_heading');
  if (headingFont === undefined) {
    logError(
      'Heading font not found in "Typography" page',
      '- Please add a text element named "font_heading".'
    );
    process.exit(1);
  }

  // Get the text element named "font_body", log an error and exit if it's missing
  const bodyFont = textElements.find((e) => e.name === 'font_body');
  if (bodyFont === undefined) {
    logError(
      'Body font not found in "Typography" page',
      '- Please add a text element named "font_body".'
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
  const fontSizes = getAllTextNodes(canvas)
    // Get all the text element with a name prefixed 'fontSize_'
    .filter((e) => e.name.startsWith('fontSize_'))
    // Get the name and font size of the elements
    .map((e) => ({ name: e.name, size: e.style.fontSize }))
    // Sort them in ascending order of font size
    .sort((a, b) => a.size - b.size)
    // Remove "fontSize_" prefix from name and convert font size from px to rem
    .map((s) => ({
      name: s.name.replace('fontSize_', ''),
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

// Extract 'line heights' design tokens from a canvas
const getLineHeights = (
  canvas: Figma.Node<'CANVAS'>
): Typography['lineHeights'] => {
  const lineHeights = getAllTextNodes(canvas)
    // Get all the text elements with a name prefixed 'lineHeight_'
    .filter((e) => e.name.startsWith('lineHeight_'))
    // Get the name and font size of the elements
    .map((e) => ({
      name: e.name,
      lineHeight: e.style.lineHeightPercentFontSize,
    }))
    // Sort them in ascending order of line height (undefined means 'auto' value)
    .sort((a, b) => {
      if (a.lineHeight === undefined) {
        return -1;
      }
      if (b.lineHeight === undefined) {
        return 1;
      }
      return a.lineHeight - b.lineHeight;
    })
    // Remove "lineHeight_" prefix from name and convert from % to decimal
    .map((s) => ({
      name: s.name.replace('lineHeight_', ''),
      lineHeight:
        s.lineHeight !== undefined ? `${s.lineHeight / 100}` : 'normal',
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
  const letterSpacing = getAllTextNodes(canvas)
    // Get all the text element with a name prefixed 'letterSpacing_'
    .filter((e) => e.name.startsWith('letterSpacing_'))
    // Get the name and calculate the letter spacing %
    .map((e) => ({
      name: e.name,
      letterSpacing: e.style.letterSpacing / e.style.fontSize,
    }))
    // Sort them in ascending order of letter spacing
    .sort((a, b) => a.letterSpacing - b.letterSpacing)
    // Remove "letterSpacing_" prefix from name and convert letter spacing to em
    .map((l) => {
      const ls = parseFloat(l.letterSpacing.toFixed(3));
      return {
        name: l.name.replace('letterSpacing_', ''),
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

/**
 * Script
 */

// The names of the pages we want to extract from the Figma file
const pageNames = {
  breakpoints: 'Breakpoints',
  colours: 'Colours',
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
  const file = await getFile(apiKey, fileKey);

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
    colours: {
      portable: getColours(canvases.colours, file.styles, 'portable.'),
      brand: getColours(canvases.colours, file.styles, 'brand.'),
    },
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
  };
}
