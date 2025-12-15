import { createPreviewCard, calculateNormalizedCardHeight, createGrid, enrichRenderOptions } from './renderer';
import type { PreviewArguments } from './types';
import { enrichCameraConfig, getLensesFromFirstQualifyingTable } from './utils';

export type { PreviewArguments, Lens, RenderOptions, Transform } from './types';

export const DEFAULT_CAMERA_CONFIG = {
  imageUrl: 'https://cdn.jsdelivr.net/npm/lens-barrel-preview/dist/assets/a7r4-raster.png',
  transform: {
    scale: 1.85,
    translateX: 13.5,
    translateY: 15,
  },
  mountSpec: {
    stepDistance: 10,
    stepLength: 15,
    mountOuterDiameter: 62
  }
};

/**
 * Main function to render lens preview grid
 * @param args - Preview configuration
 */
export function preview({ elementId, camera = DEFAULT_CAMERA_CONFIG, lenses, renderOptions = {} }: PreviewArguments): void {
  /** Validate arguments */
  if (!elementId) {
    throw new Error('elementId is required');
  }

  /** Resolve lenses - call function if provided, otherwise use array directly */
  const resolvedLenses = typeof lenses === 'function' ? lenses() : lenses;

  if (!resolvedLenses || !Array.isArray(resolvedLenses) || resolvedLenses.length === 0) {
    throw new Error('lenses array is required and must not be empty');
  }

  /** Get the target element */
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  /** Enrich render options with defaults */
  const enrichedCameraConfig = enrichCameraConfig(camera)
  const enrichedRenderOptions = enrichRenderOptions(renderOptions);

  /** Calculate normalized card height based on longest lens */
  const normalizedCardHeight = calculateNormalizedCardHeight(resolvedLenses, enrichedRenderOptions);

  /** Create preview cards for each lens with normalized height */
  const cards = resolvedLenses.map(lens => {
    return createPreviewCard(lens, enrichedCameraConfig, enrichedRenderOptions);
  });

  /** Render grid */
  createGrid(container, cards, enrichedRenderOptions, normalizedCardHeight);
}

/**
 * Renders lens previews by extracting data from the first qualifying HTML table in the document.
 *
 * Automatically detects and parses lens data from a table that meets these requirements:
 * - Must contain columns with headers starting with "diameter" and "length" (case insensitive)
 * - May include an optional third column for lens labels (headers like "model", "name", etc.)
 * - Column order is flexible - the function identifies columns by their headers
 *
 * Table structure example:
 * | Diameter (mm) | Length (mm) | Model          |
 * |---------------|-------------|----------------|
 * | 62           | 70         | 50mm f/1.8    |
 * | 88           | 136        | 24-70mm f/2.8 |
 *
 * @param args - Preview configuration excluding the lenses property (automatically extracted from table)
 */
const previewWithTableData = (args: Omit<PreviewArguments, 'lenses'>) => {
  preview({
    ...args,
    lenses: getLensesFromFirstQualifyingTable,
  });
};

/** Export for UMD build */
export default { preview, previewWithTableData };
