import type { Lens, CameraConfig, RenderOptions } from '../types';
import { renderLensShapeSVG } from './lens';
import { MOUNT_POSITION_RATIO } from './constants';

/**
 * Calculate normalized card height based on the longest lens in the array
 * @param lenses - Array of lens configurations
 * @param lensScale - Scale factor for the lens
 * @param cardWidth - Card width in pixels
 * @returns Normalized card height in pixels
 */
export function calculateNormalizedCardHeight(
    lenses: Lens[],
    renderOptions: Required<RenderOptions>
): number {
    // Find the maximum lens length
    const maxLensLength = Math.max(...lenses.map(lens => lens.length));

    // Use lensScale as the scaling factor
    const maxLensLengthPx = maxLensLength * renderOptions.lensScale;

    // Add some margin (20%) and ensure minimum height
    const normalizedHeight = Math.max(maxLensLengthPx * 1.2, renderOptions.cardWidth);

    return Math.ceil(normalizedHeight);
}

/**
 * Calculate the lens SVG height based on lens dimensions
 * @param lens - Lens configuration
 * @param lensScale - Scaling factor for the lens
 * @returns Lens SVG height in pixels
 */
function calculateLensSvgHeight(lens: Lens, lensScale: number): number {
    const lensLengthPx = lens.length * lensScale;
    // Add margin for the lens extending upward from mount point
    return Math.ceil(lensLengthPx * 1.2);
}

/**
 * Calculate the camera SVG height
 * @param renderOptions.cardWidth - Card width
 * @returns Camera SVG height in pixels
 */
function calculateCameraSvgHeight(cardWidth: number): number {
    // Camera takes up a fixed portion of the display
    return Math.ceil(cardWidth * (1 - MOUNT_POSITION_RATIO) * 2);
}

/**
 * Create a single preview card with camera and lens rendering using separate SVGs
 * @param lens - Lens configuration
 * @param cameraConfig - Camera configuration
 * @param renderOptions - Rendering options
 * @returns The preview card element
 */
export function createPreviewCard(
    lens: Lens,
    cameraConfig: Required<CameraConfig>,
    renderOptions: Required<RenderOptions>,
): HTMLElement {
    // Create outer wrapper to enforce overflow clipping at card boundary
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'lens-preview-card-wrapper';

    const card = document.createElement('div');
    card.className = 'lens-preview-card';

    const lensScale = renderOptions.lensScale;

    /** Calculate heights for lens and camera SVGs */
    const lensSvgHeight = calculateLensSvgHeight(lens, lensScale);
    const cameraSvgHeight = calculateCameraSvgHeight(renderOptions.cardWidth);

    /** Extract camera transform values */
    const camScale = (cameraConfig.transform && cameraConfig.transform.scale) || 1;
    const camTx = (cameraConfig.transform && cameraConfig.transform.translateX) || 0;
    const camTy = (cameraConfig.transform && cameraConfig.transform.translateY) || 0;



    /** Create lens SVG */
    const lensSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lensSvg.setAttribute('width', renderOptions.cardWidth.toString());
    lensSvg.setAttribute('height', lensSvgHeight.toString());
    lensSvg.setAttribute('viewBox', `0 0 ${renderOptions.cardWidth} ${lensSvgHeight}`);

    // Apply negative translateX and translateY to lens (opposite of camera's transform)
    // so the lens moves in the opposite direction
    if (camTx !== 0 || camTy !== 0) {
        lensSvg.style.transform = `translate(${-camTx}px, ${-camTy}px)`;
    }

    const lensElement = renderLensShapeSVG(
        lens,
        lensScale,
        renderOptions.cardWidth,
        lensSvgHeight,
        lensSvgHeight,
        renderOptions.cardWidth,
        cameraConfig.mountSpec
    );

    if (lensElement) {
        lensSvg.appendChild(lensElement);
    }

    /** Create lens container */
    const lensContainer = document.createElement('div');
    lensContainer.className = 'lens-container';
    lensContainer.appendChild(lensSvg);

    /** Create camera container */
    const cameraContainer = document.createElement('div');
    cameraContainer.className = 'camera-container';

    /** Create camera as an <img> and apply CSS transform for scale/translate */
    const cameraImg = document.createElement('img');
    cameraImg.src = cameraConfig.imageUrl;
    cameraImg.style.display = 'block';
    // Preserve the image's intrinsic aspect ratio. Set width to card width
    // and let the height be automatic, but constrain it so it doesn't exceed
    // the intended camera area.
    cameraImg.style.width = `${renderOptions.cardWidth}px`;
    cameraImg.style.height = 'auto';
    cameraImg.style.maxHeight = `${cameraSvgHeight}px`;
    cameraImg.style.objectFit = 'contain';
    // Apply only scale from camera config via CSS.
    // translateX and translateY are applied to the lens container instead.
    cameraImg.style.transformOrigin = '50% 100%'; // scale around bottom center
    if (camScale !== 1) {
        cameraImg.style.transform = `scale(${camScale})`;
    }

    cameraContainer.appendChild(cameraImg);

    card.appendChild(lensContainer);
    card.appendChild(cameraContainer);

    /** Add label if provided */
    if (lens.label) {
        const labelContainer = document.createElement('div');
        labelContainer.className = 'lens-preview-label-container';
        labelContainer.style.width = `${renderOptions.cardWidth - 30}px`; // Account for card padding

        const label = document.createElement('span');
        label.className = 'lens-preview-label';
        label.textContent = lens.label;

        labelContainer.appendChild(label);
        card.appendChild(labelContainer);
    }

    cardWrapper.appendChild(card);
    return cardWrapper;
}
