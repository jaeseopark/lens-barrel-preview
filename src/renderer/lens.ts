import type { Lens, Point } from '../types';
import { BUMP_TRANSITION_MM, DEFAULT_BUMP_COUNT, INITIAL_STEP_INTENSITY, INITIAL_STEP_PERCENT } from './constants';

const bumpCount: number = DEFAULT_BUMP_COUNT;

/**
 * Calculate the 2D polygon points for the lens
 * @param diameter - Lens diameter in mm
 * @param length - Lens length in mm
 * @param mountSpec - Mount specifications
 * @param lensScale - Scaling factor for the lens
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of polygon points
 */
export function calculateLensPolygon(
  diameter: number,
  length: number,
  mountSpec: { stepDistance: number; stepLength: number; mountOuterDiameter: number },
  lensScale: number,
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  const centerX = canvasWidth / 2;
  // Position lens mount at the bottom of its SVG
  const mountY = canvasHeight;

  const diameterPx = diameter * lensScale;
  const lengthPx = length * lensScale;
  const stepDistancePx = mountSpec.stepDistance * lensScale;
  const stepLengthPx = mountSpec.stepLength * lensScale;
  const minDiameterPx = mountSpec.mountOuterDiameter * lensScale;

  const fullRadius = diameterPx / 2;
  const minRadius = minDiameterPx / 2;

  const points: Point[] = [];

  // Define key Y positions (measured upward from mount)
  const backY = mountY; // Mount end (bottom of SVG)
  const frontY = mountY - lengthPx; // Front end (extends upward)
  const stepStartY = mountY - stepDistancePx; // Where step transition begins
  const stepEndY = mountY - stepDistancePx - stepLengthPx; // Where step transition ends

  // Only apply stepping if lens diameter exceeds minimum
  const needsStepping = diameter > mountSpec.mountOuterDiameter;

  // If the lens is smaller than (or equal to) the mount outer diameter, skip all stepping/bump logic.
  // Also skip if the initial stepped diameter would be smaller than the mount (e.g., INITIAL_STEP_PERCENT * diameter <= mountOuterDiameter).
  const initialStepDiameter = INITIAL_STEP_PERCENT * diameter; // in mm
  const shouldApplyStepping = needsStepping && initialStepDiameter > mountSpec.mountOuterDiameter && (stepDistancePx + stepLengthPx < lengthPx);

  if (shouldApplyStepping) {
    // Build polygon with multiple stepping transitions for more realistic profile
    // Start at back left (mount), go counter-clockwise
    points.push({ x: centerX - minRadius, y: backY });

    // Initial step: mount diameter to INITIAL_STEP_PERCENT of lens diameter
    const initialStepRadius = (INITIAL_STEP_PERCENT * diameterPx) / 2;
    points.push({ x: centerX - minRadius, y: stepStartY });

    // Build a flexible bump profile: N bumps evenly spaced over the remaining length
    const remainingLength = lengthPx - (stepDistancePx + stepLengthPx);
    let profile: { radius: number; y: number }[] = [];
    if (remainingLength > 0) {
      const effectiveBumpCount = Math.max(1, Math.floor(bumpCount || DEFAULT_BUMP_COUNT));
      const segmentLength = remainingLength / (effectiveBumpCount + 1);
      const desiredTransitionPx = BUMP_TRANSITION_MM * lensScale;
      const bumpTransitionLength = Math.min(desiredTransitionPx, segmentLength * INITIAL_STEP_PERCENT);

      // Build profile points for left side from bottom (stepEndY) to top (frontY)
      profile = [];
      // start at initial step radius
      profile.push({ radius: initialStepRadius, y: stepEndY });

      let prevRadius = initialStepRadius;
      // initial bump intensity (fraction of full diameter) - configurable constant in renderer/constants
      const initialBumpIntensity = INITIAL_STEP_INTENSITY;

      for (let i = 1; i <= effectiveBumpCount; i++) {
        const transitionEndY = stepEndY - segmentLength * i;
        const transitionStartY = transitionEndY + bumpTransitionLength;

        // maintain previous radius up to transitionStartY
        profile.push({ radius: prevRadius, y: transitionStartY });

        // compute new radius for this bump
        // Interpolate from the initial bump intensity up toward full diameter
        const targetPercent = initialBumpIntensity + (i / effectiveBumpCount) * (1 - initialBumpIntensity);
        const newRadius = (targetPercent * diameterPx) / 2;

        // transition to new radius at transitionEndY
        profile.push({ radius: newRadius, y: transitionEndY });

        prevRadius = newRadius;
      }

      // final to full radius at front
      profile.push({ radius: fullRadius, y: frontY });

      // append profile points to left side
      for (const p of profile) {
        points.push({ x: centerX - p.radius, y: p.y });
      }
    } else {
      // Fallback if no remaining length
      points.push({ x: centerX - fullRadius, y: frontY });
    }

    // Front
    points.push({ x: centerX + fullRadius, y: frontY });

    // Right side going down (mirror the left side)
    if (profile.length > 0) {
      for (let i = profile.length - 1; i >= 0; i--) {
        const p = profile[i];
        points.push({ x: centerX + p.radius, y: p.y });
      }
    }

    points.push({ x: centerX + initialStepRadius, y: stepEndY });
    points.push({ x: centerX + minRadius, y: stepStartY });
    points.push({ x: centerX + minRadius, y: backY });
  } else {
    // Simple rectangle (no stepping needed or not enough length)
    const radius = needsStepping ? minRadius : fullRadius;
    points.push({ x: centerX - radius, y: backY });
    points.push({ x: centerX - radius, y: frontY });
    points.push({ x: centerX + radius, y: frontY });
    points.push({ x: centerX + radius, y: backY });
  }

  return points;
}

/**
 * Render a lens shape as SVG element
 * @param lens - Lens configuration
 * @param lensScale - Scaling factor for the lens
 * @param svgWidth - SVG width (viewBox coordinates)
 * @param svgHeight - SVG height (viewBox coordinates)
 * @param cardHeight - Actual rendered card height in pixels
 * @param displaySize - Actual rendered card width in pixels
 * @param mountSpec - Mount specifications
 * @returns SVG group element containing lens shape and center line
 */
export function renderLensShapeSVG(
  lens: Lens,
  lensScale: number,
  svgWidth: number,
  svgHeight: number,
  cardHeight: number | undefined,
  displaySize: number | undefined,
  mountSpec: { stepDistance: number; stepLength: number; mountOuterDiameter: number }
): SVGGElement {
  const { diameter, length } = lens;

  /** Calculate lens polygon points */
  const polygon = calculateLensPolygon(
    diameter,
    length,
    mountSpec,
    lensScale,
    svgWidth,
    svgHeight,
  );

  /** Create SVG group element */
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  /** Create SVG path element for lens shape */
  const lensPath = createLensPath(polygon);
  group.appendChild(lensPath);

  // center line removed (visual cleanup)

  /** Add subtle sheen streaks for slight 3D effect */
  const sheenGroup = createSheen(svgWidth, svgHeight, polygon);
  if (sheenGroup) group.appendChild(sheenGroup);

  return group;
}

/**
 * Create SVG path element for lens polygon
 * @param points - Polygon points
 * @returns SVG path element
 */
function createLensPath(points: Point[]): SVGPathElement {
  if (points.length === 0) return document.createElementNS('http://www.w3.org/2000/svg', 'path');

  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  pathData += ' Z';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  // Set lens fill to requested RGB color and use same color for stroke
  const lensColor = 'rgb(46,46,46)';
  path.setAttribute('fill', lensColor);
  path.setAttribute('stroke', lensColor);
  path.setAttribute('stroke-width', '1.5');

  return path;
}

// center line removed; no helper needed



// Replace the previous simple line-based sheen with a gradient rect + blur approach
function createSheen(svgWidth: number, svgHeight: number, polygon: Point[]): SVGGElement {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (!polygon || polygon.length < 2) return group;

  const ys = polygon.map(p => p.y);
  const frontY = Math.min(...ys);
  const backY = Math.max(...ys);

  // Unique IDs to avoid collisions when multiple cards are rendered
  const uid = 'sheen_' + Math.floor(Math.random() * 1e9);
  const gradId = uid + '_grad';
  const filterId = uid + '_blur';

  // defs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  // linear gradient for a wide right->left sheen (bright on the right, fades to left)
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', gradId);
  // gradient runs from right (100%) to left (0%)
  grad.setAttribute('x1', '100%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '0%');
  grad.setAttribute('y2', '0%');

  const stopBright = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopBright.setAttribute('offset', '0%');
  stopBright.setAttribute('stop-color', '#fff');
  stopBright.setAttribute('stop-opacity', '0.28');

  const stopMid = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopMid.setAttribute('offset', '30%');
  stopMid.setAttribute('stop-color', '#fff');
  stopMid.setAttribute('stop-opacity', '0.08');

  const stopFade = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopFade.setAttribute('offset', '100%');
  stopFade.setAttribute('stop-color', '#fff');
  stopFade.setAttribute('stop-opacity', '0');

  grad.appendChild(stopBright);
  grad.appendChild(stopMid);
  grad.appendChild(stopFade);

  // blur filter
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', filterId);
  const fe = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  fe.setAttribute('in', 'SourceGraphic');
  fe.setAttribute('stdDeviation', String(Math.max(2, svgWidth * 0.05)));
  filter.appendChild(fe);

  defs.appendChild(grad);
  defs.appendChild(filter);
  group.appendChild(defs);

  // create a single wide rect that spans the lens horizontally
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', String(frontY));
  rect.setAttribute('width', String(svgWidth));
  rect.setAttribute('height', String(Math.max(0, backY - frontY)));
  rect.setAttribute('fill', `url(#${gradId})`);
  rect.setAttribute('filter', `url(#${filterId})`);
  rect.setAttribute('opacity', '0.9');

  group.appendChild(rect);

  return group;
}
