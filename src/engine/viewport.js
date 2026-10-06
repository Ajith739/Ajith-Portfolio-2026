// The classic template loads this coordinator before React's module entry.
export const viewport = window.portfolioViewport;
const CONFIGS = {
  mobile: { scale: [1.2, 1.2, 1.2], position: [0, -10, -65], rotation: [0, Math.PI * 0.85, 0] },
  tablet: { scale: [1.4, 1.4, 1.4], position: [0, -10, -75], rotation: [0, Math.PI * 0.85, 0] },
  desktop: { scale: [1.5, 1.5, 1.5], position: [0, -10, -80], rotation: [0, Math.PI * 0.85, 0] },
};
export const modelConfig = breakpoint => CONFIGS[breakpoint];
