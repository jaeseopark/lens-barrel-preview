# Lens Barrel Preview - Implementation Guide

This document outlines the remaining implementation tasks and technical details for completing the lens-barrel-preview library.

## Project Overview

The library renders top-down preview images of camera bodies with lenses attached, displaying them in a responsive grid. Each preview shows the relative scale of the lens compared to the camera body.

## Current Status

### ✅ Completed

- **Project Structure**: Package.json, Rollup configuration, folder structure
- **Core Modules**:
  - `src/index.ts` - Main API with `preview()` function
  - `src/camera.ts` - Camera configuration and mount specifications
  - `src/lens-renderer.ts` - Lens polygon calculation and SVG rendering
  - `src/grid.ts` - Grid layout and styling
  - `src/svg.ts` - SVG-based rendering implementation
- **Build Configuration**: Rollup setup for UMD and ES module builds with TypeScript
- **Example**: HTML example demonstrating SVG-based library usage
- **TypeScript**: Full type definitions and type-safe API
- **Asset Optimization**: Simplified SVG camera images bundled as base64 data URIs (7.2KB minified bundle)
- **SVG Rendering**: Complete conversion from Canvas to SVG with auto-scaling and DOM integration
- **API Simplification**: Removed renderer selection, now SVG-only with cleaner API

### 🔨 Remaining Implementation Tasks

## 2. Lens Stepping Logic Validation

**File**: `src/lens-renderer.ts` (function `calculateLensPolygon`)

**Current Implementation**: Basic stepping logic implemented with SVG rendering

**Needs Testing**:
- Verify stepping occurs at correct distance from mount
- Confirm visual accuracy with real lens photos
- Test edge cases:
  - Very large lenses (e.g., 150-600mm supertelephoto)
  - Very small lenses (e.g., pancake lenses)
  - Lenses exactly at threshold diameter

**Improvements Needed**:
1. **Rounded corners**: Current SVG implementation creates sharp rectangles
   ```javascript
   // Add rounded corners to SVG path
   function createRoundedPath(points: Point[], radius: number): string {
     // Implementation using SVG arc commands
   }
   ```

2. **More realistic shapes**:
   - Some lenses have tapered designs
   - Add optional taper angle to Lens type
   - Implement gradual diameter changes

3. **Visual details**:
  - Focus/zoom rings (subtle SVG circles/lines)
  - Lens hood representation (optional extension)
  - Filter thread indication

## 3. Scaling and Proportions

**Current Issue**: Need to ensure camera and lens are properly scaled relative to each other

**Calculation Requirements**:
1. Camera image dimensions (pixels) must map to known physical dimensions (mm)
2. Mount center point must be accurately positioned in camera image
3. Lens dimensions must use same scale as camera

**Implementation Checklist**:
- [ ] Measure actual pixel dimensions of camera image
- [ ] Calculate pixels-per-mm ratio
- [ ] Verify `mmToPixels` function accuracy
- [ ] Test with known lens/camera combinations
- [ ] Add visual grid/ruler overlay for debugging (optional dev tool)

## 4. Additional Mount Types

**Future Enhancement**: Support more camera mounts

**Potential Additions**:
- Canon RF mount
- Canon EF mount
- Nikon F mount
- Micro Four Thirds
- Fujifilm X mount
- Leica L mount

**Implementation Pattern** (per mount):
```javascript
'canon-rf': {
  innerDiameter: 54,
  stepDistance: 5,
  maxDiameterBeforeStep: 75
}
```

## 5. Testing

**Unit Tests** (recommended: Jest or Vitest):
```javascript
// tests/utils.test.ts
import { mmToPixels } from '../src/utils.ts';

test('mmToPixels conversion', () => {
  expect(mmToPixels(128.9, 128.9, 1000)).toBe(1000);
  expect(mmToPixels(64.45, 128.9, 1000)).toBe(500);
});

// tests/camera.test.ts
import { DEFAULT_CAMERA_CONFIG } from '../src/camera.ts';

test('default camera configuration', () => {
  expect(DEFAULT_CAMERA_CONFIG.imageUrl).toBeDefined();
  expect(DEFAULT_CAMERA_CONFIG.mountSpec).toBeDefined();
});
```

**Visual Tests**:
- Create test page with known lens dimensions
- Compare rendered output with actual photos
- Verify proportions are accurate

## 6. Build and Distribution

**Completed**:
- ✅ Build configuration working
- ✅ Library builds successfully
- ✅ UMD and ES module bundles generated

**Remaining Tasks**:

1. **Test the built files**:
   - Open `examples/index.html` in browser
   - Verify UMD build works
   - Test ES module import

2. **NPM Publishing**:
   ```bash
   npm login
   npm publish
   ```

3. **CDN Distribution**:
   - Push to GitHub
   - jsDelivr will automatically pick it up:
     `https://cdn.jsdelivr.net/npm/lens-barrel-preview@latest/dist/lens-barrel-preview.min.js`

## 9. Documentation Improvements

**README.md Additions**:
- [ ] Add screenshots of rendered output
- [ ] Document camera image requirements
- [ ] Add troubleshooting section
- [ ] Include more examples (custom mounts, styling)

**JSDoc Comments**:
- [x] Type definitions added
- [ ] Add @example tags to main functions
- [ ] Generate TypeScript definitions (optional)

## 10. Optional Enhancements

### A. Interactive Features
- Click to enlarge preview
- Comparison mode (overlay multiple lenses)
- Export as image (download rendered canvas)

### B. Animation
- Smooth transitions when switching lenses
- Loading animations
- Hover effects (already basic version implemented)

### C. Customization
```javascript
renderOptions: {
  cardWidth: 300,
  backgroundColor: '#f5f5f5',
  lensColor: 'rgba(50, 50, 50, 0.7)',
  showMountCircle: true,  // Draw mount diameter
  showDimensions: true,    // Overlay dimensions text
  theme: 'light' | 'dark'
}
```

### D. Accessibility
- Add ARIA labels
- Keyboard navigation for grid
- High contrast mode
- Screen reader descriptions

### E. Performance
- Lazy load camera images
- Canvas pooling for large grids
- Virtual scrolling for 100+ lenses
- Web Worker for calculations

## Technical Considerations

### Browser Compatibility
- **Target**: Modern browsers (ES6+)
- **SVG API**: Widely supported
- **Consider**: Polyfills for older browsers if needed

### Bundle Size
- Current size: 7.2KB minified (16KB uncompressed)
- Camera images bundled as base64 data URIs
- SVG optimization achieved ~90% size reduction

### Error Handling
- Add validation for lens dimensions (positive numbers)
- Handle missing images gracefully
- Provide helpful error messages
- Add optional debug mode

## Getting Started with Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development**:
   ```bash
   npm run dev
   ```
   This watches for file changes and rebuilds automatically.

3. **Test locally**:
   - Build the library: `npm run build`
   - Open `examples/index.html` in a browser
   - Or use a local server: `npx http-server .`

4. **Priority Order**:
   1. ✅ SVG rendering implementation (completed)
   2. ✅ Camera image rendering (completed)
   3. ✅ Default camera images (completed)
   4. 🔄 Refine mount specifications
   5. 🔄 Visual improvements (rounding, details)
   6. 🔄 Testing suite
   7. 🔄 Documentation polish
   8. 🔄 Publish to NPM

## Questions to Resolve

1. **Camera Images**: ✅ **RESOLVED** - Using SVG representations for scalability and small bundle size

2. **Lens Database**: Should the library include a database of common lenses?
   - Pro: Easier for users
   - Con: Increases bundle size
   - Solution: Separate optional package?

3. **Styling**: How much styling customization should be exposed?
   - Keep simple with current approach?
   - Add theme system?
   - Allow CSS class overrides?

4. **TypeScript**: Should we add TypeScript definitions?
   - JSDoc provides some type info
   - Could generate .d.ts files
   - Or rewrite in TypeScript

## Resources

- **Sony E-mount specs**: [Wikipedia](https://en.wikipedia.org/wiki/Sony_E-mount)
- **Nikon Z-mount specs**: [Wikipedia](https://en.wikipedia.org/wiki/Nikon_Z-mount)
- **Canvas API**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- **Rollup documentation**: [rollupjs.org](https://rollupjs.org/)

---

## Quick Start Checklist

- [ ] Implement async image loading in `renderCameraBody()`
- [ ] Source/create Sony A7R IV top-down image
- [ ] Update default camera `imageUrl` with actual image URL
- [ ] Test with actual lens dimensions
- [ ] Measure/research accurate mount stepping specifications
- [ ] Build library: `npm run build`
- [ ] Test example page
- [ ] Add visual tests with screenshots
- [ ] Publish to NPM
- [ ] Update README with live examples

---

**Last Updated**: December 14, 2025
