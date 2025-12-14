import { mmToPixels } from './utils';
import type { Lens, CameraConfig, Point } from './types';

/**
 * Render a lens shape as SVG element
 * @param lens - Lens configuration
 * @param cameraConfig - Camera configuration
 * @param svgWidth - SVG width
 * @param svgHeight - SVG height
 * @returns SVG group element containing lens shape and center line
 */
export function renderLensShapeSVG(
  lens: Lens,
  cameraConfig: CameraConfig,
  svgWidth: number,
  svgHeight: number
): SVGGElement {
  const { diameter, length } = lens;
  const { mountSpec } = cameraConfig;

  // Use default camera width for scaling calculations
  const cameraWidth = 128.9;

  /** Calculate lens polygon points */
  const polygon = calculateLensPolygon(
    diameter,
    length,
    mountSpec,
    cameraWidth,
    svgWidth,
    svgHeight
  );

  /** Create SVG group element */
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  /** Create SVG path element for lens shape */
  const lensPath = createLensPath(polygon);
  group.appendChild(lensPath);

  /** Add dotted center line */
  const centerLine = createCenterLine(svgWidth, svgHeight, polygon);
  group.appendChild(centerLine);

  return group;
}

/**
 * Calculate the 2D polygon points for the lens
 * @param diameter - Lens diameter in mm
 * @param length - Lens length in mm
 * @param mountSpec - Mount specifications
 * @param cameraWidthMm - Camera width in mm
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of polygon points
 */
function calculateLensPolygon(
  diameter: number,
  length: number,
  mountSpec: { stepDistance: number; stepLength: number; mountOuterDiameter: number },
  cameraWidthMm: number,
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  const centerX = canvasWidth / 2;
  // Position lenses to "grow up" from a fixed mount point near the bottom
  const mountY = canvasHeight * 0.85; // Fixed mount position at 85% down the canvas

  const pixelsPerMm = canvasWidth / cameraWidthMm;
  const diameterPx = mmToPixels(diameter, pixelsPerMm);
  const lengthPx = mmToPixels(length, pixelsPerMm);

  const radius = diameterPx / 2;

  // Create a simple rectangular lens shape that grows upward from the mount point
  const points: Point[] = [];

  // Define the lens as a rectangle extending upward from the mount
  const backY = mountY; // Mount end (fixed position)
  const frontY = mountY - lengthPx; // Front end (extends upward)

  // Start from back left, go clockwise
  points.push({ x: centerX - radius, y: backY });     // Back left (mount)
  points.push({ x: centerX + radius, y: backY });     // Back right (mount)
  points.push({ x: centerX + radius, y: frontY });    // Front right
  points.push({ x: centerX - radius, y: frontY });    // Front left

  return points;
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
  path.setAttribute('fill', 'rgba(50, 50, 50, 0.7)');
  path.setAttribute('stroke', '#333');
  path.setAttribute('stroke-width', '2');

  return path;
}

/**
 * Create dotted center line for lens barrel
 * @param svgWidth - SVG width
 * @param svgHeight - SVG height
 * @param polygon - Lens polygon points
 * @returns SVG line element
 */
function createCenterLine(svgWidth: number, svgHeight: number, polygon: Point[]): SVGLineElement {
  const centerX = svgWidth / 2;
  const backY = polygon[0].y; // Mount end (back of lens)
  const frontY = polygon[2].y; // Front end of lens

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', centerX.toString());
  line.setAttribute('y1', backY.toString());
  line.setAttribute('x2', centerX.toString());
  line.setAttribute('y2', frontY.toString());
  line.setAttribute('stroke', '#666');
  line.setAttribute('stroke-width', '1');
  line.setAttribute('stroke-dasharray', '2,2');
  line.setAttribute('opacity', '0.3');

  return line;
}
