import {
  BlendMode,
  EffectType,
  LayoutConstraintHorizontal,
  LayoutConstraintVertical,
  LayoutGridPattern,
  LineHeightUnit,
  PaintType,
  StrokeAlign,
} from 'figma-api';
import merge from 'lodash.merge';
import { v4 as uuidv4 } from 'uuid';
import Color from 'colorjs.io';
import type { Node } from 'figma-api';

import type { DeepPartial } from '../types';

type DocumentNode = Node<'DOCUMENT'>;
type CanvasNode = Node<'CANVAS'>;
type ComponentNode = Node<'COMPONENT'>;
type FrameNode = Node<'FRAME'>;
type RectangleNode = Node<'RECTANGLE'>;
type TextNode = Node<'TEXT'>;

// Default properties for the Figma nodes we need to mock
// These can be overridden when we create a node

const defaultDocument: DocumentNode = {
  id: '',
  name: '',
  type: 'DOCUMENT',
  children: [],
  visible: true,
};

const defaultCanvas: CanvasNode = {
  id: '',
  name: '',
  type: 'CANVAS',
  visible: true,
  children: [],
  backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
  exportSettings: [],
};

const defaultComponent: ComponentNode = {
  id: '',
  name: '',
  type: 'COMPONENT',
  visible: true,
  children: [],
  background: [],
  effects: [],
  opacity: 1,
  blendMode: BlendMode.NORMAL,
  isMask: false,
  isMaskOutline: false,
  preserveRatio: false,
  clipsContent: false,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  constraints: {
    horizontal: LayoutConstraintHorizontal.LEFT,
    vertical: LayoutConstraintVertical.TOP,
  },
  exportSettings: [],
};

const defaultFrame: FrameNode = {
  id: '',
  name: '',
  type: 'FRAME',
  visible: true,
  effects: [],
  children: [],
  background: [],
  exportSettings: [],
  blendMode: BlendMode.NORMAL,
  opacity: 1,
  isMask: false,
  isMaskOutline: false,
  preserveRatio: false,
  clipsContent: false,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  constraints: {
    horizontal: LayoutConstraintHorizontal.LEFT,
    vertical: LayoutConstraintVertical.TOP,
  },
};

const defaultRectangle: RectangleNode = {
  id: '',
  name: '',
  type: 'RECTANGLE',
  visible: true,
  fills: [],
  strokes: [],
  strokeWeight: 0,
  strokeAlign: StrokeAlign.INSIDE,
  cornerRadius: 0,
  rectangleCornerRadii: [0, 0, 0, 0],
  blendMode: BlendMode.NORMAL,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  constraints: {
    horizontal: LayoutConstraintHorizontal.LEFT,
    vertical: LayoutConstraintVertical.TOP,
  },
  exportSettings: [],
};

const defaultText: TextNode = {
  id: '',
  name: '',
  type: 'TEXT',
  visible: true,
  fills: [],
  strokes: [],
  strokeWeight: 0,
  strokeAlign: StrokeAlign.INSIDE,
  blendMode: BlendMode.NORMAL,
  characters: '',
  style: {
    fontFamily: '',
    fontPostScriptName: '',
    italic: false,
    fontWeight: 400,
    fontSize: 16,
    textAlignHorizontal: 'LEFT',
    textAlignVertical: 'CENTER',
    letterSpacing: 0,
    fills: [],
    lineHeightPx: 0,
    lineHeightPercent: 0,
    lineHeightUnit: LineHeightUnit['INTRINSIC_%'],
  },
  characterStyleOverrides: [],
  styleOverrideTable: {},
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  constraints: {
    horizontal: LayoutConstraintHorizontal.LEFT,
    vertical: LayoutConstraintVertical.TOP,
  },
  exportSettings: [],
};

// Utility functions to mock Figma nodes
// Combine the given props with our default props above

export const createDocument = (
  props: DeepPartial<DocumentNode>
): DocumentNode => {
  return merge({}, defaultDocument, props);
};

export const createCanvas = (props: DeepPartial<CanvasNode>): CanvasNode => {
  return merge({}, defaultCanvas, props);
};

export const createFrame = (props: DeepPartial<FrameNode>): FrameNode => {
  return merge({}, defaultFrame, props);
};

export const createText = (props: DeepPartial<TextNode>): TextNode => {
  return merge({}, defaultText, props);
};

// createRectangle & createComponent allow you to pass the x/y/width/height props without nesting them

export const createRectangle = (
  props: DeepPartial<RectangleNode> &
    DeepPartial<RectangleNode['absoluteBoundingBox']>
): RectangleNode => {
  const { x, y, width, height, ...baseProps } = props;
  const boxProps = { absoluteBoundingBox: { x, y, width, height } };
  return merge({}, defaultRectangle, baseProps, boxProps);
};

export const createComponent = (
  props: DeepPartial<ComponentNode> &
    DeepPartial<ComponentNode['absoluteBoundingBox']>
): ComponentNode => {
  const { x, y, width, height, ...baseProps } = props;
  const boxProps = { absoluteBoundingBox: { x, y, width, height } };
  return merge({}, defaultComponent, baseProps, boxProps);
};

// Utility function to create a grid style and a frame node with it attached
export const createGridStyle = (
  name: string,
  gridConfig: { columns: number; margin: number; gutter: number }
) => {
  const id = uuidv4();
  const style = { name: name, styleType: 'GRID' };
  const node = createFrame({
    styles: { grid: id },
    layoutGrids: [
      {
        pattern: LayoutGridPattern.COLUMNS,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alignment: 'STRETCH' as any,
        sectionSize: 0,
        visible: true,
        color: { r: 1, g: 1, b: 1, a: 1 },
        count: gridConfig.columns,
        offset: gridConfig.margin,
        gutterSize: gridConfig.gutter,
      },
    ],
  });

  return { id, style, node };
};

// Utility function to create a text style and a text node with it attached
export const createTextStyle = (
  name: string,
  styles: DeepPartial<TextNode['style']>
) => {
  const id = uuidv4();
  const style = { name: name, styleType: 'TEXT' };
  const node = createText({ styles: { text: id }, style: styles });

  return { id, style, node };
};

// Utility function to create a shadow style and a rectangle with it attached
export const createShadow = (
  name: string,
  options: {
    color: [r: number, g: number, b: number, a: number];
    offset: [x: number, y: number];
    radius: number;
    spread?: number;
  }
) => {
  const { color, offset, radius, spread } = options;
  const [r, g, b, a] = color;
  const [x, y] = offset;

  const id = uuidv4();
  const style = { name: name, styleType: 'EFFECT' };
  const node = createRectangle({
    styles: { effect: id },
    effects: [
      {
        type: EffectType.DROP_SHADOW,
        blendMode: BlendMode.NORMAL,
        visible: true,
        color: { r, g, b, a },
        offset: { x, y },
        radius: radius,
        spread: spread,
      },
    ],
  });

  return { id, style, node };
};

// Utility function to create a colour style and a rectangle with it attached
export const createColour = (name: string, hex: string) => {
  const colour = new Color(hex);
  const [r, g, b] = colour.coords;
  const a = colour.alpha;

  const id = uuidv4();
  const style = { name: name, styleType: 'FILL' };
  const node = createRectangle({
    styles: { fill: id },
    fills: [
      {
        type: PaintType.SOLID,
        blendMode: BlendMode.NORMAL,
        color: { r, g, b, a },
      },
    ],
  });

  return { id, style, node };
};

// Utility function to turn an array of styles in to an object
export const createFileStyles = (styles: { id: string; style: unknown }[]) => {
  return styles.reduce(
    (obj, s) => ({
      ...obj,
      [s.id]: s.style,
    }),
    {}
  );
};
