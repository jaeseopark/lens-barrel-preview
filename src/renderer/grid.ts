import type { RenderOptions, Lens, CameraConfig } from '../types';
import { createPreviewCard, calculateNormalizedCardHeight } from './card';
import { enrichRenderOptions } from './utils';
// Camera config enrichment is expected to be handled by the caller (upstream).
import { DEFAULT_CARD_WIDTH } from './constants';
import { getBackgroundColor } from './utils';

/**
 * Create and render a grid of preview cards
 * @param container - Container element
 * @param cards - Array of preview card elements
 * @param renderOptions - Rendering options
 * @param cardHeight - Height for all cards in the grid
 */
export function createGrid(
  container: HTMLElement,
  lenses: Lens[],
  /** Enriched camera config (see `enrichCameraConfig`) */
  camera: Required<CameraConfig>,
  renderOptions: Partial<RenderOptions> = {}
): void {
  // Camera must already be enriched by the caller so we don't mutate or
  // duplicate enrichment here. Render options are still enriched locally.
  const enrichedRenderOptions = enrichRenderOptions(renderOptions);
  const cardHeight = calculateNormalizedCardHeight(lenses, enrichedRenderOptions);
  /** Clear existing content */
  container.innerHTML = '';

  /** Create grid wrapper */
  const grid = document.createElement('div');
  grid.className = 'lens-preview-grid';

  /** Apply grid styles */
  applyGridStyles(grid, enrichedRenderOptions);

  /** Create and append cards for each lens so we can access lens data here */
  lenses.forEach(lens => {
    const card = createPreviewCard(lens, camera, enrichedRenderOptions);
    applyCardStyles(card, enrichedRenderOptions, cardHeight, lens.tags);
    grid.appendChild(card);
  });

  /** Add styles to page if not already present */
  injectStyles();

  container.appendChild(grid);
}

/**
 * Apply styles to the grid container
 * @param grid - Grid element
 * @param renderOptions - Rendering options
 */
function applyGridStyles(grid: HTMLElement, renderOptions: RenderOptions): void {
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${renderOptions.cardWidth || DEFAULT_CARD_WIDTH}px, 1fr))`;
  grid.style.gap = '20px';
  grid.style.padding = '20px';
}

/**
 * Apply styles to individual cards
 * @param card - Card element
 * @param renderOptions - Rendering options
 * @param cardHeight - Height for the card
 */
function applyCardStyles(card: HTMLElement, renderOptions: Required<RenderOptions>, cardHeight: number, tags?: string[]): void {
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.alignItems = 'center';
  card.style.padding = '15px';
  card.style.backgroundColor = getBackgroundColor(renderOptions, tags ?? []);
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';

  // Set minimum height to ensure consistent card heights
  card.style.minHeight = `${cardHeight + 60}px`; // Add padding for label
}

/**
 * Inject CSS styles into the page
 */
function injectStyles(): void {
  /** Check if styles already injected */
  if (document.getElementById('lens-preview-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'lens-preview-styles';
  style.textContent = `
    .lens-preview-card-wrapper {
      overflow: hidden;
      height: 100%;
    }

    .lens-preview-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: visible;
      box-sizing: border-box;
    }

    .lens-container {
      flex: 1 1 0%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      z-index: 2;
    }

    .camera-container {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: visible;
      position: relative;
      z-index: 1;
    }

    /* Allow the actual <svg> elements to overflow their containers vertically
       so camera graphics can extend beyond the container bounds if needed. */
    .lens-container svg,
    .camera-container svg {
      overflow: visible;
      display: block;
    }

    .lens-preview-label {
      height: 20px;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-top: 10px;
    }

    .lens-preview-grid {
      width: 100%;
      box-sizing: border-box;
    }
  `;

  document.head.appendChild(style);
}
