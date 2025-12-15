import type { RenderOptions } from '../types';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_CARD_WIDTH } from './constants';

/**
 * Enrich render options with default values for any missing properties
 * @param renderOptions - Partial render options object
 * @returns Complete render options object with all properties populated
 */
export function enrichRenderOptions(renderOptions: Partial<RenderOptions> = {}): Required<RenderOptions> {
    const rawMapping = renderOptions.backgroundColorMapping ?? {};
    const backgroundColorMapping: Record<string, string> = {};
    // Normalize all keys to lowercase to make tag lookups case-insensitive
    for (const [key, value] of Object.entries(rawMapping)) {
        backgroundColorMapping[key.toLowerCase()] = value;
    }

    return {
        cardWidth: renderOptions.cardWidth ?? DEFAULT_CARD_WIDTH,
        lensScale: renderOptions.lensScale ?? 1,
        backgroundColorMapping,
    };
}

export const getBackgroundColor = (renderOptions: Required<RenderOptions>, tags: string[]) => {
    if (tags) {
        for (const tag of tags) {
            const key = tag.toLowerCase();
            if (renderOptions.backgroundColorMapping[key]) {
                return renderOptions.backgroundColorMapping[key];
            }
        }
    }

    return DEFAULT_BACKGROUND_COLOR;
};
