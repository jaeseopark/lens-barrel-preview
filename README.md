# Lens Barrel Preview

A JavaScript library for rendering top-down camera and lens preview images in the browser using SVG.

![demo](docs/demo.jpg)

## Installation

### Via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/lens-barrel-preview/dist/lens-barrel-preview.min.js"></script>
```

### Via npm

```bash
npm install lens-barrel-preview
```

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/lens-barrel-preview/dist/lens-barrel-preview.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    LensBarrelPreview.preview({
      elementId: 'lens-preview',
      lenses: [
        { label: '50mm f/1.8', diameter: 62, length: 70, tags: ["bad"] },
        { label: '24-70mm f/2.8', diameter: 88, length: 136: tags: ["okay"] },
        { label: '70-200mm f/2.8', diameter: 88, length: 193: tags: ["good"] }
      ],
      renderOptions: {
        backgroundColorMapping: {
          "bad": "#f8d7da",
          "okay": "#fff3cd",
          "good": "#d1e7dd"
        }
      }
    });
  });
</script>

...

<div id="lens-preview"></div>
```

## API

### `preview(options)`

Renders a grid of lens preview images.

#### Options

- `elementId` (string, required): ID of the div element where the preview will be rendered
- `camera` (object, optional): Camera configuration
  - `imageUrl` (string, required): URL to custom camera body image
  - `transform` (object): Transform options for camera image
    - `scale` (number): Scale factor
    - `translateX` (number): Horizontal translation in pixels
    - `translateY` (number): Vertical translation in pixels
  - `mountSpec` (object, required): Mount specifications for lens stepping
    - `stepDistance` (number): Distance from mount flange where stepping begins (mm)
    - `stepLength` (number): Length over which stepping transition occurs gradually (mm)
    - `mountOuterDiameter` (number): Minimum diameter before requiring stepping (mm)
- `lenses` (array or function, required): Array of lens objects or function that returns such an array.
  - `label` (string, optional): Display label for the lens
  - `tags` (string[], optional): Optional list of tags for the lens (e.g. `['owned']`, `['shortlisted']`). Tags are used to look up colors from `renderOptions.backgroundColorMapping` so cards can be color-coded based on tag membership.
  - `diameter` (number, required): Lens diameter in mm
  - `length` (number, required): Lens length in mm
- `renderOptions` (object, optional): Rendering options
  - `cardWidth` (number): Width of each preview card in pixels
  - `lensScale` (number): Scale factor for lens rendering
  - `backgroundColorMapping` (object, optional): A mapping from tag name to CSS color string. If provided, the card background color will be chosen from the first tag present on a lens that exists in this mapping.

## License

MIT
