/**
 * useAdaptivePerformance.js — React Hook for Performance Engine
 *
 * Wraps the PerformanceEngine singleton and provides quality-aware
 * rendering parameters to Three.js components. Monitors FPS and
 * auto-downgrades quality on sustained performance drops.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import PerformanceEngine from "../engine/PerformanceEngine";

/**
 * Hook that exposes the PerformanceEngine config to React components.
 * Monitors FPS via useFrame integration and auto-adapts quality.
 *
 * @returns {{
 *   quality: number,
 *   dpr: [number, number],
 *   oceanSegments: number,
 *   starCount: number,
 *   cloudCount: number,
 *   shadowMapSize: number,
 *   gerstnerWaves: number,
 *   prefersReducedMotion: boolean,
 *   recordFrame: (timestamp: number) => void,
 * }}
 */
export function useAdaptivePerformance() {
  const engine = useRef(PerformanceEngine.getInstance());
  const [config, setConfig] = useState(() => engine.current.getConfig());
  const [quality, setQuality] = useState(() => engine.current.level);
  const checkInterval = useRef(null);

  // Periodic quality check (every 5 seconds)
  useEffect(() => {
    checkInterval.current = setInterval(() => {
      const changed = engine.current.checkAndAdaptQuality();
      if (changed) {
        setConfig(engine.current.getConfig());
        setQuality(engine.current.level);
      }
    }, 5000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  // Frame recording callback for useFrame integration
  const recordFrame = useCallback((timestamp) => {
    engine.current.recordFrame(timestamp);
  }, []);

  return {
    quality,
    ...config,
    prefersReducedMotion: engine.current.prefersReducedMotion,
    recordFrame,
  };
}

export default useAdaptivePerformance;
