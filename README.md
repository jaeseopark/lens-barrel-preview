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
        { label: '50mm f/1.8', diameter: 62, length: 70 },
        { label: '24-70mm f/2.8', diameter: 88, length: 136 },
        { label: '70-200mm f/2.8', diameter: 88, length: 193 }
      ]
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
- `lenses` (array, required): Array of lens objects
  - `label` (string, optional): Display label for the lens
  - `diameter` (number, required): Lens diameter in mm
  - `length` (number, required): Lens length in mm
- `renderOptions` (object, optional): Rendering options
  - `cardWidth` (number): Width of each preview card in pixels

## License

MIT
