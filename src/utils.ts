import { CameraConfig } from "./types";

/**
 * Convert millimeters to pixels using a simple scaling factor
 * The scale factor determines how many pixels per mm
 * @param mm - Measurement in millimeters
 * @param pixelsPerMm - Pixels per millimeter scaling factor
 * @returns Pixels
 */
export function mmToPixels(mm: number, pixelsPerMm: number): number {
    return mm * pixelsPerMm;
}

export const enrichCameraConfig = ({
    transform,
    ...rest
}: CameraConfig): Required<CameraConfig> => {
    const { scale = 1, translateX = 0, translateY = 0 } = transform || {};
    return {
        ...rest,
        transform: {
            scale,
            translateX,
            translateY,
        },
    };
}
