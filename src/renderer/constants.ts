/** Default card width in pixels */
export const DEFAULT_CARD_WIDTH = 300;

/** Mount position as fraction of canvas height (0.85 = 85% down from top) */
export const MOUNT_POSITION_RATIO = 0.85;

/**
 * Default length (in millimeters) to use for small bump transitions along the lens barrel.
 * This is converted to pixels using the current `lensScale` when rendering.
 */
export const BUMP_TRANSITION_MM = 5;

/** Default number of small bumps (visible transitions) to render along the barrel */
export const DEFAULT_BUMP_COUNT = 2;

/**
 * Default intensity for the initial bump as a fraction of full diameter (0..1).
 * E.g., 0.95 means the first visible bump will be 95% of the final diameter.
 */
export const INITIAL_STEP_INTENSITY = 0.95;

/** Fraction (0..1) of full diameter used immediately after the mount step (e.g. 0.9 = 90%) */
export const INITIAL_STEP_PERCENT = 0.9;
