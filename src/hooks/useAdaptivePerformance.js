import { useState, useEffect, useCallback, useRef } from "react";
import PerformanceEngine from "../engine/PerformanceEngine";
import { viewport } from "../engine/viewport";

export default function useAdaptivePerformance() {
  const engine = useRef(PerformanceEngine.getInstance());
  const [config, setConfig] = useState(() => engine.current.getConfig());
  const [prefersReducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    const reset = () => engine.current.resetSamples();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', reset);
    const unsubscribe = viewport.subscribe(reset);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', reset); unsubscribe(); };
  }, []);
  const recordFrame = useCallback((timestamp, renderingDpr, resolutionCeiling) => {
    if (engine.current.recordFrame(timestamp, renderingDpr, resolutionCeiling)) setConfig(engine.current.getConfig());
  }, []);
  return { ...config, quality: engine.current.level, prefersReducedMotion, recordFrame };
}
