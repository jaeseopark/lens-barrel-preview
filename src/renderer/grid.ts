import type { RenderOptions } from '../types';
import { DEFAULT_CARD_WIDTH } from './constants';

/**
 * Create and render a grid of preview cards
 * @param container - Container element
 * @param cards - Array of preview card elements
 * @param renderOptions - Rendering options
 * @param cardHeight - Height for all cards in the grid
 */
export function createGrid(
  container: HTMLElement,
  cards: HTMLElement[],
  renderOptions: Required<RenderOptions>,
  cardHeight: number
): void {
  /** Clear existing content */
  container.innerHTML = '';

  /** Create grid wrapper */
  const grid = document.createElement('div');
  grid.className = 'lens-preview-grid';

  /** Apply grid styles */
  applyGridStyles(grid, renderOptions);

  /** Append all cards */
  cards.forEach(card => {
    applyCardStyles(card, renderOptions, cardHeight);
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
function applyCardStyles(card: HTMLElement, renderOptions: RenderOptions, cardHeight: number): void {
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.alignItems = 'center';
  card.style.padding = '15px';
  card.style.backgroundColor = '#f5f5f5';
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
    .lens-preview-grid {
      width: 100%;
      box-sizing: border-box;
    }

    .lens-preview-card {
      box-sizing: border-box;
    }

    .lens-preview-label {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      text-align: center;
    }
  `;

  document.head.appendChild(style);
}
