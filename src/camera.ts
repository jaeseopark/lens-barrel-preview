import type { CameraConfig } from './types';

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  imageUrl: '/dist/assets/a7r4-raster.png',
  transform: {
    scale: 0.3,
    translateX: 20,
    translateY: -45,
  },
  mountSpec: {
    stepDistance: 5,
    stepLength: 10,
    mountOuterDiameter: 70
  }
};
