import { createPreviewCard, calculateNormalizedCardHeight, createGrid, enrichRenderOptions } from './renderer';
import type { PreviewArguments } from './types';
import { enrichCameraConfig } from './utils';

export type { PreviewArguments, Lens, RenderOptions, Transform } from './types';

/**
 * Main function to render lens preview grid
 * @param args - Preview configuration
 */
export function preview({ elementId, camera = {
  imageUrl: 'https://cdn.jsdelivr.net/npm/lens-barrel-preview/dist/assets/a7r4-raster.png',
  transform: {
    scale: 2.25,
    translateX: 13.5,
    translateY: 24,
  },
  mountSpec: {
    stepDistance: 10,
    stepLength: 15,
    mountOuterDiameter: 62
  }
}, lenses, renderOptions = {} }: PreviewArguments): void {

  /** Validate arguments */
  if (!elementId) {
    throw new Error('elementId is required');
  }

  if (!lenses || !Array.isArray(lenses) || lenses.length === 0) {
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
  const normalizedCardHeight = calculateNormalizedCardHeight(lenses, enrichedRenderOptions);

  /** Create preview cards for each lens with normalized height */
  const cards = lenses.map(lens => {
    return createPreviewCard(lens, enrichedCameraConfig, enrichedRenderOptions);
  });

  /** Render grid */
  createGrid(container, cards, enrichedRenderOptions, normalizedCardHeight);
}

/** Export for UMD build */
export default { preview };
