import { em, rem } from 'polished';
import { TextCase, TextDecoration, LineHeightUnit } from 'figma-api';

import {
  getBreakpoints,
  getColours,
  getFontFamilies,
  getFontSizes,
  getGridStyles,
  getLetterSpacing,
  getLineHeights,
  getPageCanvasByName,
  getRadii,
  getShadows,
  getSizes,
  getSpacing,
  getTextStyles,
} from './import-figma';
import {
  createCanvas,
  createColour,
  createComponent,
  createDocument,
  createFileStyles,
  createGridStyle,
  createRectangle,
  createShadow,
  createText,
  createTextStyle,
} from '../utils/testing/figma';

describe('Figma utility functions', () => {
  describe('getPageCanvasByName', () => {
    const test = (opts: {
      name: string;
      search: string;
      shouldMatch: boolean;
    }) => {
      const canvas = createCanvas({ name: opts.name });
      const document = createDocument({ children: [canvas] });
      const match = getPageCanvasByName(document, [opts.search]);
      if (opts.shouldMatch) {
        expect(match).toEqual(canvas);
      } else {
        expect(match).not.toEqual(canvas);
      }
    };

    it('returns a page with the exact matching name', () => {
      test({ name: 'Breakpoints', search: 'Breakpoints', shouldMatch: true });
    });

    it('returns a page with the matching name even if the case is different', () => {
      test({ name: 'BREAKPOINTS', search: 'Breakpoints', shouldMatch: true });
    });

    it('returns a page with the matching name even if the name contains emojis', () => {
      test({
        name: '📐📐📐 Breakpoints 📐📐📐',
        search: 'Breakpoints',
        shouldMatch: true,
      });
    });

    it("doesn't return a duplicate of the page (e.g Breakpoints 2)", () => {
      test({
        name: 'Breakpoints 2',
        search: 'Breakpoints',
        shouldMatch: false,
      });
    });
  });
});

describe('Importing tokens from Figma', () => {
  describe('Breakpoints', () => {
    const getName = (n: string) => `breakpoint-${n}`;

    it('generates a list of breakpoints from the widths of properly named rectangles on a canvas', () => {
      // Create rectangles to represent the "sm", "md", "lg" and "xl" breakpoints
      const sm = createRectangle({ name: getName('sm'), width: 480 });
      const md = createRectangle({ name: getName('md'), width: 640 });
      const lg = createRectangle({ name: getName('lg'), width: 992 });
      const xl = createRectangle({ name: getName('xl'), width: 1280 });
      // Create a rectangle with an invalid name to ensure it's skipped
      const fake = createRectangle({ name: 'bp-xxl', width: 1660 });

      // Add all the rectangles to a canvas and pass it to the breakpoints function
      const canvas = createCanvas({ children: [lg, xl, md, fake, sm] });
      const breakpoints = getBreakpoints(canvas);

      // Expect the breakpoints to be rem-based and use the correct names
      expect(breakpoints).toEqual({
        sm: {
          $type: 'dimension',
          $value: em('480px'),
        },
        md: {
          $type: 'dimension',
          $value: em('640px'),
        },
        lg: {
          $type: 'dimension',
          $value: em('992px'),
        },
        xl: {
          $type: 'dimension',
          $value: em('1280px'),
        },
      });
    });
  });

  describe('Colours', () => {
    const getName = (n: string) => `custom/${n}`;

    it('generates a list of colours from properly named colour styles and filled rectangles on a canvas', () => {
      // Create some colour styles (with a coloured rectangle for each one)
      const black = createColour(getName('black'), '#000000');
      const white = createColour(getName('white'), '#ffffff');
      const red = createColour(getName('red'), '#e53e3e');
      const styles = [black, white, red];

      // Add the rectangles to a canvas, pass the canvas and the file styles to the colour function
      const canvas = createCanvas({ children: styles.map((s) => s.node) });
      const fileStyles = createFileStyles(styles);
      const colours = getColours(canvas, fileStyles);

      // Expect the colours to be extracted correctly
      expect(colours).toEqual({
        custom: {
          black: {
            $type: 'color',
            $value: '#000',
          },
          red: {
            $type: 'color',
            $value: '#e53e3e',
          },
          white: {
            $type: 'color',
            $value: '#fff',
          },
        },
      });
    });

    it('allows colour values to be nested for creating colour scales', () => {
      // Create a colour scale
      const palette = [
        createColour(getName('grey/50'), '#fffafa'),
        createColour(getName('grey/100'), '#eAe5e5'),
        createColour(getName('grey/200'), '#d5d0d0'),
        createColour(getName('grey/300'), '#a8a3a3'),
        createColour(getName('grey/400'), '#7f7a7a'),
        createColour(getName('grey/500'), '#5e5959'),
        createColour(getName('grey/600'), '#464241'),
        createColour(getName('grey/700'), '#363231'),
        createColour(getName('grey/800'), '#2c2727'),
        createColour(getName('grey/900'), '#262121'),
      ];

      // Add the rectangles to a canvas, pass the canvas and the file styles to the colour function
      const canvas = createCanvas({ children: palette.map((s) => s.node) });
      const fileStyles = createFileStyles(palette);
      const colours = getColours(canvas, fileStyles);

      // Expect the colours to be nested correctly
      expect(colours).toEqual({
        custom: {
          grey: {
            '50': {
              $type: 'color',
              $value: '#fffafa',
            },
            '100': {
              $type: 'color',
              $value: '#eae5e5',
            },
            '200': {
              $type: 'color',
              $value: '#d5d0d0',
            },
            '300': {
              $type: 'color',
              $value: '#a8a3a3',
            },
            '400': {
              $type: 'color',
              $value: '#7f7a7a',
            },
            '500': {
              $type: 'color',
              $value: '#5e5959',
            },
            '600': {
              $type: 'color',
              $value: '#464241',
            },
            '700': {
              $type: 'color',
              $value: '#363231',
            },
            '800': {
              $type: 'color',
              $value: '#2c2727',
            },
            '900': {
              $type: 'color',
              $value: '#262121',
            },
          },
        },
      });
    });
  });

  describe('Grid', () => {
    it('generates grid config objects from properly named grid styles and rectangles on a canvas', () => {
      // Create "page/base", "page/md" and "page/lg" grid styles
      const base = createGridStyle('page/base', {
        columns: 4,
        gutter: 8,
        margin: 16,
      });
      const md = createGridStyle('page/md', {
        columns: 8,
        gutter: 16,
        margin: 32,
      });
      const lg = createGridStyle('page/lg', {
        columns: 12,
        gutter: 24,
        margin: 96,
      });
      const styles = [base, md, lg];

      // Add the frame nodes to a canvas, pass the canvas and the file styles to the grid styles function
      const canvas = createCanvas({ children: styles.map((s) => s.node) });
      const fileStyles = createFileStyles(styles);
      const gridStyles = getGridStyles(canvas, fileStyles);

      // Expect the generated grid config to have the correct values
      expect(gridStyles).toEqual({
        page: {
          columns: {
            base: {
              $type: 'number',
              $value: 4,
            },
            md: {
              $type: 'number',
              $value: 8,
            },
            lg: {
              $type: 'number',
              $value: 12,
            },
          },
          gutter: {
            base: {
              $type: 'dimension',
              $value: rem('8px'),
            },
            md: {
              $type: 'dimension',
              $value: rem('16px'),
            },
            lg: {
              $type: 'dimension',
              $value: rem('24px'),
            },
          },
          margin: {
            base: {
              $type: 'dimension',
              $value: rem('16px'),
            },
            md: {
              $type: 'dimension',
              $value: rem('32px'),
            },
            lg: {
              $type: 'dimension',
              $value: rem('96px'),
            },
          },
        },
      });
    });
  });

  // TODO: Add tests for importing icons
  describe('Icons', () => {});

  describe('Radii', () => {
    const getName = (n: string) => `radii-${n}`;

    it('generates a list of border radius values from properly named rectangles on a canvas', () => {
      // Create rectangles to represent the "sm", "md" and "lg" border radius values
      const sm = createRectangle({ name: getName('sm'), cornerRadius: 2 });
      const md = createRectangle({ name: getName('md'), cornerRadius: 4 });
      const lg = createRectangle({ name: getName('lg'), cornerRadius: 8 });
      // Create a rectangle with an invalid name to ensure it's skipped
      const fake = createRectangle({ name: 'radius-xl', cornerRadius: 16 });

      // Add all the rectangles to a canvas and pass it to the radii function
      const canvas = createCanvas({ children: [lg, sm, fake, md] });
      const radii = getRadii(canvas);

      // Expect the radii to be rem-based and use the correct names
      expect(radii).toEqual({
        sm: {
          $type: 'dimension',
          $value: rem('2px'),
        },
        md: {
          $type: 'dimension',
          $value: rem('4px'),
        },
        lg: {
          $type: 'dimension',
          $value: rem('8px'),
        },
      });
    });
  });

  describe('Shadows', () => {
    const getName = (n: string) => `shadow-${n}`;

    it('generates a list of shadows from properly named styles and rectangles on a canvas', () => {
      // Create "sm", "md" and "lg" shadow styles (with a rectangle for each one)
      const styles = [
        createShadow(getName('sm'), {
          color: [0, 0, 0, 0.1],
          offset: [0, 1],
          radius: 2,
          spread: 0,
        }),
        createShadow(getName('md'), {
          color: [0.1, 0.1, 0.1, 0.2],
          offset: [1, 2],
          radius: 3,
          spread: 1,
        }),
        createShadow(getName('lg'), {
          color: [0.1, 0.2, 0.3, 0.3],
          offset: [2, 3],
          radius: 4,
          spread: 3,
        }),
      ];

      // Add the rectangles to a canvas, pass the canvas and the file styles to the shadows function
      const canvas = createCanvas({ children: styles.map((s) => s.node) });
      const fileStyles = createFileStyles(styles);
      const shadows = getShadows(canvas, fileStyles);

      // Expect the CSS shadows to have the correct values
      expect(shadows).toEqual({
        lg: {
          $type: 'shadow',
          $value: [
            {
              blur: '4px',
              color: '#1a334d4d',
              inset: false,
              offsetX: '2px',
              offsetY: '3px',
              spread: '3px',
            },
          ],
        },
        md: {
          $type: 'shadow',
          $value: [
            {
              blur: '3px',
              color: '#1a1a1a33',
              inset: false,
              offsetX: '1px',
              offsetY: '2px',
              spread: '1px',
            },
          ],
        },
        sm: {
          $type: 'shadow',
          $value: [
            {
              blur: '2px',
              color: '#0000001a',
              inset: false,
              offsetX: '0px',
              offsetY: '1px',
              spread: '0px',
            },
          ],
        },
      });
    });
  });

  describe('Sizes', () => {
    const getName = (n: string) => `size-${n}`;

    it('generates a list of sizes from the widths of properly named rectangles on a canvas', () => {
      // Create rectangles to represent the "sm", "md" and "lg" sizes
      const sm = createRectangle({ name: getName('sm'), width: 64 });
      const md = createRectangle({ name: getName('md'), width: 128 });
      const lg = createRectangle({ name: getName('lg'), width: 256 });
      // Create a rectangle with an invalid name to ensure it's skipped
      const fake = createRectangle({ name: 'sizing-xl', width: 512 });

      // Add all the rectangles to a canvas and pass it to the sizes function
      const canvas = createCanvas({ children: [lg, sm, fake, md] });
      const sizes = getSizes(canvas);

      // Expect the sizes to be rem-based and use the correct names
      expect(sizes).toEqual({
        lg: {
          $type: 'dimension',
          $value: rem('256px'),
        },
        md: {
          $type: 'dimension',
          $value: rem('128px'),
        },
        sm: {
          $type: 'dimension',
          $value: rem('64px'),
        },
      });
    });
  });

  describe('Spacing', () => {
    const getName = (n: string) => `space-${n}`;

    it('generates a list of spaces from the heights of properly named components on a canvas', () => {
      // Create components to represent the "1", "2", "3" and "4" spacing values
      const s1 = createComponent({ name: getName('1'), height: 4 });
      const s2 = createComponent({ name: getName('2'), height: 8 });
      const s3 = createComponent({ name: getName('3'), height: 12 });
      const s4 = createComponent({ name: getName('4'), height: 16 });
      // Create a rectangle with an invalid name to ensure it's skipped
      const fake = createRectangle({ name: 'spacing-5', width: 20 });

      // Add all the rectangles to a canvas and pass it to the spacing function
      const canvas = createCanvas({ children: [s1, s3, fake, s4, s2] });
      const spacing = getSpacing(canvas);

      // Expect the spacing scale to be rem-based and use the correct names
      expect(spacing).toEqual({
        '1': {
          $type: 'dimension',
          $value: rem('4px'),
        },
        '2': {
          $type: 'dimension',
          $value: rem('8px'),
        },
        '3': {
          $type: 'dimension',
          $value: rem('12px'),
        },
        '4': {
          $type: 'dimension',
          $value: rem('16px'),
        },
      });
    });
  });

  describe('Typography', () => {
    describe('Fonts', () => {
      const getName = (n: string) => `font-${n}`;

      it('generates a list of font families from properly named text nodes on a canvas', () => {
        // Create text nodes to represent "heading" and "body" fonts
        const heading = createText({
          name: getName('heading'),
          style: { fontFamily: 'Georgia' },
        });
        const body = createText({
          name: getName('body'),
          style: { fontFamily: 'Helvetica' },
        });
        const logo = createText({
          name: getName('logo'),
          style: { fontFamily: 'Montserrat' },
        });

        // Add the text nodes to a canvas and pass it to the font family function
        const canvas = createCanvas({ children: [heading, body, logo] });
        const fonts = getFontFamilies(canvas);

        // Expect the fonts to be extracted correctly
        expect(fonts).toEqual({
          body: {
            $type: 'fontFamily',
            $value: "'Helvetica'",
          },
          heading: {
            $type: 'fontFamily',
            $value: "'Georgia'",
          },
          logo: {
            $type: 'fontFamily',
            $value: "'Montserrat'",
          },
        });
      });

      it('throws an error if the heading or body font is missing', () => {
        // Mock console.error and console.warn to prevent the errors appearing in the test results
        const mocks = [
          jest.spyOn(console, 'error').mockImplementation(() => {}),
          jest.spyOn(console, 'warn').mockImplementation(() => {}),
        ];

        // Create text nodes to represent "heading" and "body" fonts
        const heading = createText({
          name: getName('heading'),
          style: { fontFamily: 'Georgia' },
        });
        const body = createText({
          name: getName('body'),
          style: { fontFamily: 'Helvetica' },
        });

        // Pass a canvas with just the "heading" text node, expect an error
        expect(() => {
          getFontFamilies(createCanvas({ children: [heading] }));
        }).toThrowError();

        // Pass a canvas with just the "body" text node, expect an error
        expect(() => {
          getFontFamilies(createCanvas({ children: [body] }));
        }).toThrowError();

        // Restore console functionality
        mocks.forEach((mock) => mock.mockRestore());
      });
    });

    describe('Font Sizes', () => {
      const getName = (n: string) => `fontSize-${n}`;

      it('generates a list of font sizes from properly named text nodes on a canvas', () => {
        // Create text nodes to represent "sm", "md" and "lg" font sizes
        const sm = createText({
          name: getName('sm'),
          style: { fontSize: 12 },
        });
        const md = createText({
          name: getName('md'),
          style: { fontSize: 16 },
        });
        const lg = createText({
          name: getName('lg'),
          style: { fontSize: 24 },
        });

        // Add the text nodes to a canvas and pass it to the font sizes function
        const canvas = createCanvas({ children: [lg, sm, md] });
        const fonts = getFontSizes(canvas);

        // Expect the font sizes to be rem-based and use the correct names
        expect(fonts).toEqual({
          lg: {
            $type: 'dimension',
            $value: rem('24px'),
          },
          md: {
            $type: 'dimension',
            $value: rem('16px'),
          },
          sm: {
            $type: 'dimension',
            $value: rem('12px'),
          },
        });
      });
    });

    describe('Line Heights', () => {
      const getName = (n: string) => `lineHeight-${n}`;

      describe('generates a list of line heights from properly named text nodes on a canvas', () => {
        it('supports percentage-based values', () => {
          // Create a text node using a percentage-based line height
          const node = createText({
            name: getName('tall'),
            style: {
              lineHeightPercentFontSize: 175,
              lineHeightUnit: LineHeightUnit['FONT_SIZE_%'],
            },
          });

          // Add the text node to a canvas and pass it to the line heights function
          const canvas = createCanvas({ children: [node] });
          const lineHeights = getLineHeights(canvas);

          // Expect the name and value to be correct
          expect(lineHeights).toEqual({
            tall: {
              $type: 'string',
              $value: '1.75',
            },
          });
        });

        it('supports pixel-based values', () => {
          // Create some text nodes using pixel-based line heights
          const short = createText({
            name: getName('short'),
            style: {
              lineHeightPx: 12,
              lineHeightUnit: LineHeightUnit.PIXELS,
            },
          });
          const base = createText({
            name: getName('base'),
            style: {
              lineHeightPx: 16,
              lineHeightUnit: LineHeightUnit.PIXELS,
            },
          });
          const tall = createText({
            name: getName('tall'),
            style: {
              lineHeightPx: 20,
              lineHeightUnit: LineHeightUnit.PIXELS,
            },
          });

          // Add the text nodes to a canvas and pass it to the line heights function
          const canvas = createCanvas({ children: [base, tall, short] });
          const lineHeights = getLineHeights(canvas);

          // Expect the values to be rem-based and using the correct names
          expect(lineHeights).toEqual({
            base: {
              $type: 'string',
              $value: rem('16px'),
            },
            short: {
              $type: 'string',
              $value: rem('12px'),
            },
            tall: {
              $type: 'string',
              $value: rem('20px'),
            },
          });
        });

        it('supports intrinsic value', () => {
          // Create a text node using an intrinsic line height
          const node = createText({
            name: getName('normal'),
            style: {
              lineHeightUnit: LineHeightUnit['INTRINSIC_%'],
            },
          });

          // Add the text node to a canvas and pass it to the line heights function
          const canvas = createCanvas({ children: [node] });
          const lineHeights = getLineHeights(canvas);

          // Expect the name to be correct and the value to be "normal"
          expect(lineHeights).toEqual({
            normal: {
              $type: 'string',
              $value: 'normal',
            },
          });
        });
      });
    });

    describe('Letter Spacings', () => {
      const getName = (n: string) => `letterSpacing-${n}`;
      // Utility function to create a letter spacing style from a font size and a percentage
      const getLetterSpacingStyle = (decimal: number, fontSize = 16) => {
        return { fontSize, letterSpacing: fontSize * decimal };
      };

      it('generates a list of letter spacings from properly named text nodes on a canvas', () => {
        // Create text nodes to represent "tight", "normal" and "wide" letter spacings
        const tight = createText({
          name: getName('tight'),
          style: getLetterSpacingStyle(-0.025),
        });
        const normal = createText({
          name: getName('normal'),
          style: getLetterSpacingStyle(0),
        });
        const wide = createText({
          name: getName('wide'),
          style: getLetterSpacingStyle(0.025),
        });

        // Add the text nodes to a canvas and pass it to the letter spacing function
        const canvas = createCanvas({ children: [normal, wide, tight] });
        const letterSpacings = getLetterSpacing(canvas);

        // Expect the values to be em-based and using the correct names
        expect(letterSpacings).toEqual({
          normal: {
            $type: 'dimension',
            $value: '0',
          },
          tight: {
            $type: 'dimension',
            $value: '-0.025em',
          },
          wide: {
            $type: 'dimension',
            $value: '0.025em',
          },
        });
      });
    });
  });

  describe('Text Styles', () => {
    // Basic text properties for a Figma text node
    const baseInput = {
      fontFamily: 'Helvetica',
      fontSize: 16,
      italic: false,
      fontWeight: 400,
      letterSpacing: 0,
      lineHeightUnit: LineHeightUnit['INTRINSIC_%'],
      textDecoration: TextDecoration.NONE,
      textCase: TextCase.ORIGINAL,
    };
    // Expected CSS output of the above properties
    const baseOutput = {
      fontFamily: "'Helvetica'",
      fontSize: rem('16px'),
      fontStyle: 'normal',
      fontWeight: '400',
      letterSpacing: '0em',
      lineHeight: 'normal',
      textDecorationLine: 'none',
      textTransform: 'none',
    };

    it('generates a text style from properly named styles and text nodes on a canvas', () => {
      // Create a text style named "body" and a text node with the style attached
      const style = createTextStyle('body', baseInput);

      // Add the text node to a canvas, pass the canvas and the file styles to the text styles function
      const canvas = createCanvas({ children: [style.node] });
      const fileStyles = createFileStyles([style]);
      const textStyles = getTextStyles(canvas, fileStyles);

      // Expect the generated CSS props to match
      expect(textStyles).toEqual({
        body: {
          $type: 'typography',
          $value: baseOutput,
        },
      });
    });

    it('generates a responsive text style if multiple styles use the same name', () => {
      // Create "h1/base", "h1/tablet" and "h1/desktop" text styles with increasing font sizes
      const base = createTextStyle('h1/base', { ...baseInput, fontSize: 16 });
      const md = createTextStyle('h1/tablet', { ...baseInput, fontSize: 32 });
      const lg = createTextStyle('h1/desktop', { ...baseInput, fontSize: 64 });
      const styles = [base, md, lg];

      // Add the text nodes to a canvas, pass the canvas and the file styles to the text styles function
      const canvas = createCanvas({ children: styles.map((s) => s.node) });
      const fileStyles = createFileStyles(styles);
      const textStyles = getTextStyles(canvas, fileStyles);

      // Expect the generated CSS props to have a responsive font-size value
      expect(textStyles).toEqual({
        h1: {
          $type: 'typography',
          $value: {
            ...baseOutput,
            fontSize: {
              base: rem('16px'),
              tablet: rem('32px'),
              desktop: rem('64px'),
            },
          },
        },
      });
    });

    describe('supports additional properties', () => {
      // Utility function to test how changing the properties of a text node affect the generated CSS
      const testProperty = (test: {
        input: Record<string, unknown>;
        output: Record<string, unknown>;
      }) => {
        // Create a text style by merging the default properties with the given input property(s)
        const style = createTextStyle('body', { ...baseInput, ...test.input });
        const canvas = createCanvas({ children: [style.node] });
        const textStyles = getTextStyles(canvas, createFileStyles([style]));
        // Expect the generated CSS props to have the given output property(s)
        expect(textStyles).toEqual({
          body: {
            $type: 'typography',
            $value: {
              ...baseOutput,
              ...test.output,
            },
          },
        });
      };

      it('italics', () => {
        testProperty({
          input: { italic: true },
          output: { fontStyle: 'italic' },
        });
      });

      it('underline decoration', () => {
        testProperty({
          input: { textDecoration: TextDecoration.UNDERLINE },
          output: { textDecorationLine: 'underline' },
        });
      });

      it('strikethrough decoration', () => {
        testProperty({
          input: { textDecoration: TextDecoration.STRIKETHROUGH },
          output: { textDecorationLine: 'line-through' },
        });
      });

      it('uppercase transform', () => {
        testProperty({
          input: { textCase: TextCase.UPPER },
          output: { textTransform: 'uppercase' },
        });
      });

      it('lowercase transform', () => {
        testProperty({
          input: { textCase: TextCase.LOWER },
          output: { textTransform: 'lowercase' },
        });
      });

      it('title transform', () => {
        testProperty({
          input: { textCase: TextCase.TITLE },
          output: { textTransform: 'capitalize' },
        });
      });
    });
  });
});
