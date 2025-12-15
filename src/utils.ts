import { CameraConfig, Lens } from "./types";

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

/**
 * Extracts lens data from the first qualifying HTML table in the document.
 *
 * Automatically detects and parses lens data from a table that meets these requirements:
 * - Must contain columns with headers starting with "diameter" and "length" (case insensitive)
 * - May include an optional third column for lens labels (headers like "model", "name", etc.)
 * - Column order is flexible - the function identifies columns by their headers
 *
 * @returns Array of lens objects extracted from the first qualifying table
 * @throws Error if no qualifying table is found or if data is invalid
 */
export function getLensesFromFirstQualifyingTable(): Lens[] {
    const allTables = Array.from(document.querySelectorAll('table'));
    let qualifyingTable: HTMLTableElement | null = null;
    let diameterIndex = -1;
    let lengthIndex = -1;
    let labelIndex = -1;

    // Find the first qualifying table
    for (const table of allTables) {
        const headerRow = table.querySelector('thead tr');
        if (!headerRow) continue;

        const headers = Array.from(headerRow.querySelectorAll('th')).map((th: Element) =>
            (th as HTMLTableHeaderCellElement).textContent?.trim().toLowerCase() || ''
        );

        const foundDiameterIndex = headers.findIndex(h => h.startsWith('diameter'));
        const foundLengthIndex = headers.findIndex(h => h.startsWith('length'));
        const foundLabelIndex = headers.findIndex(h =>
            h.startsWith('model') || h.startsWith('name') || h.startsWith('label')
        );

        if (foundDiameterIndex !== -1 && foundLengthIndex !== -1) {
            qualifyingTable = table;
            diameterIndex = foundDiameterIndex;
            lengthIndex = foundLengthIndex;
            labelIndex = foundLabelIndex;
            break;
        }
    }

    if (!qualifyingTable) {
        throw new Error('No qualifying table found. Table must have columns with headers starting with "diameter" and "length".');
    }

    const lenses = Array.from(qualifyingTable.querySelectorAll('tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        const diameter = parseFloat(cells[diameterIndex]?.textContent?.trim() || '0');
        const length = parseFloat(cells[lengthIndex]?.textContent?.trim() || '0');
        const label = labelIndex !== -1 ? cells[labelIndex]?.textContent?.trim() || undefined : undefined;

        if (isNaN(diameter) || isNaN(length)) {
            throw new Error('Invalid lens data in table. Diameter and length must be valid numbers.');
        }

        return { diameter, length, label };
    });

    return lenses;
}
