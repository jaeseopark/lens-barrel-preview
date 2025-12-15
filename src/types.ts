export interface Transform {
  scale?: number;
  translateX?: number;
  translateY?: number;
}

export interface CameraConfig {
  imageUrl: string;
  mountSpec: MountSpec;
  transform?: Transform;
}

export interface Lens {
  diameter: number;
  length: number;
  label?: string;
  tags?: string[];
}

export interface RenderOptions {
  cardWidth: number;
  lensScale: number;
  backgroundColorMapping?: Record<string, string>;
}

export interface PreviewArguments {
  elementId: string;
  lenses: Lens[] | (() => Lens[]);
  camera?: CameraConfig;
  renderOptions?: Partial<RenderOptions>;
}

export interface MountSpec {
  /** Distance from mount flange where stepping begins (mm) */
  stepDistance: number;
  /** Length over which stepping transition occurs gradually (mm) */
  stepLength: number;
  /** Minimum diameter before requiring stepping (mm) */
  mountOuterDiameter: number;
}

export interface Point {
  x: number;
  y: number;
}
