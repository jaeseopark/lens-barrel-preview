import type { RenderOptions } from '../types';
import { DEFAULT_CARD_WIDTH } from './constants';

/**
 * Enrich render options with default values for any missing properties
 * @param renderOptions - Partial render options object
 * @returns Complete render options object with all properties populated
 */
export function enrichRenderOptions(renderOptions: Partial<RenderOptions> = {}): Required<RenderOptions> {
    return {
        cardWidth: renderOptions.cardWidth ?? DEFAULT_CARD_WIDTH,
        lensScale: renderOptions.lensScale ?? 1,
    };
}
