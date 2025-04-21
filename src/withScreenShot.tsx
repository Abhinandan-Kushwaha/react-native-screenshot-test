import {ReactElement} from 'react';

export const defaultConfig = {
  path: 'ss-test',
  serverUrl: 'http://127.0.0.1:8080',
  batchSize: 10,
  maxWidth: 500,
  backgroundColor: 'transparent',
  showDiffInGrayScale: false,
  quality: 0.9,
};

export interface ScreenshotConfig {
  path?: string;
  serverUrl?: string;
  port?: string;
  batchSize?: number;
  maxWidth?: number;
  backgroundColor?: string;
  showDiffInGrayScale?: boolean;
  quality?: number;
}

export interface Components {
  component: (props?: any) => ReactElement;
  title: string;
  id: string;
  description?: string;
  showDiffInGrayScale?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
  quality?: number;
}

export const withScreenShot = (
  components: Components[],
  isHeadless: boolean = true,
  screenshotConfig?: ScreenshotConfig,
) => {
  let withShot;
  if (isHeadless) {
    withShot = require('./withShotHeadless').default;
  } else {
    withShot = require('./withShot').default;
  }

  return withShot(components, screenshotConfig);
};
