/**
 * PerformanceEngine.js — Adaptive Quality Manager
 * Adapted from folio-2025's Game.js quality system.
 *
 * Singleton that detects device capabilities and provides
 * quality-tier-based rendering parameters to all 3D components.
 */

// Quality levels: 0 = high, 1 = medium, 2 = low
const QUALITY = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

// Configuration per quality level
const QUALITY_CONFIGS = {
  [QUALITY.HIGH]: {
    dpr: [1, 2],
    oceanSegments: 128,
    starCount: 400,
    cloudCount: 11,
    shadowMapSize: 2048,
    gerstnerWaves: 6,
    enablePostProcessing: true,
  },
  [QUALITY.MEDIUM]: {
    dpr: [1, 1.5],
    oceanSegments: 80,
    starCount: 250,
    cloudCount: 8,
    shadowMapSize: 1024,
    gerstnerWaves: 4,
    enablePostProcessing: false,
  },
  [QUALITY.LOW]: {
    dpr: [1, 1],
    oceanSegments: 48,
    starCount: 150,
    cloudCount: 5,
    shadowMapSize: 512,
    gerstnerWaves: 3,
    enablePostProcessing: false,
  },
};

class PerformanceEngine {
  static _instance = null;

  static getInstance() {
    if (!PerformanceEngine._instance) {
      PerformanceEngine._instance = new PerformanceEngine();
    }
    return PerformanceEngine._instance;
  }

  constructor() {
    if (PerformanceEngine._instance) {
      return PerformanceEngine._instance;
    }

    this.level = this._detectQuality();
    this.config = QUALITY_CONFIGS[this.level];

    // FPS tracking for adaptive quality
    this._fpsHistory = [];
    this._fpsHistoryMax = 60; // Track last 60 samples
    this._lastFrameTime = 0;
    this._degraded = false;

    // Reduced motion preference
    this.prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Detect device quality tier based on hardware signals.
   * Mirrors folio's quality detection logic.
   */
  _detectQuality() {
    if (typeof window === "undefined") return QUALITY.MEDIUM;

    const w = window.innerWidth;
    const memory = navigator.deviceMemory || 4; // GB
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Check for WebGL renderer info
    let gpuTier = "unknown";
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpuTier = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        // Clean up the context
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
    } catch (_) {
      // Silent fail
    }

    // Low-end detection
    const isLowEnd =
      isMobile ||
      w < 768 ||
      memory <= 2 ||
      cores <= 2 ||
      /Mali|Adreno\s[0-4]/i.test(gpuTier);

    if (isLowEnd) return QUALITY.LOW;

    // Medium detection
    const isMedium =
      w < 1280 ||
      memory <= 4 ||
      cores <= 4 ||
      /Intel|Adreno\s5/i.test(gpuTier);

    if (isMedium) return QUALITY.MEDIUM;

    return QUALITY.HIGH;
  }

  /**
   * Record a frame timestamp for FPS tracking.
   * Call this from the main useFrame loop.
   */
  recordFrame(timestamp) {
    if (this._lastFrameTime > 0) {
      const delta = timestamp - this._lastFrameTime;
      const fps = 1000 / delta;
      this._fpsHistory.push(fps);

      if (this._fpsHistory.length > this._fpsHistoryMax) {
        this._fpsHistory.shift();
      }
    }
    this._lastFrameTime = timestamp;
  }

  /**
   * Get the average FPS over the tracked history.
   */
  getAverageFPS() {
    if (this._fpsHistory.length === 0) return 60;
    const sum = this._fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this._fpsHistory.length;
  }

  /**
   * Auto-degrade quality if FPS is consistently low.
   * Returns true if quality was changed.
   */
  checkAndAdaptQuality() {
    if (this._fpsHistory.length < 30) return false; // Need enough samples

    const avgFps = this.getAverageFPS();

    // If FPS drops below 24 for sustained period, downgrade
    if (avgFps < 24 && this.level < QUALITY.LOW && !this._degraded) {
      this.level = Math.min(this.level + 1, QUALITY.LOW);
      this.config = QUALITY_CONFIGS[this.level];
      this._degraded = true;
      this._fpsHistory = []; // Reset tracking
      console.info(
        `[PerformanceEngine] Quality degraded to level ${this.level} (avg FPS: ${avgFps.toFixed(1)})`
      );
      return true;
    }

    return false;
  }

  /**
   * Get the current quality config values.
   */
  getConfig() {
    return { ...this.config };
  }
}

export { PerformanceEngine, QUALITY, QUALITY_CONFIGS };
export default PerformanceEngine;
