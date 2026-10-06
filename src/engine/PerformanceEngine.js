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

    this._lastFrameTime = 0;
    this._samples = new Float32Array(240);
    this._sampleCount = 0;
    this._sum = 0;
    this._count = 0;
    this._windowStart = 0;
    this._fastest = 1000 / 60;
    this._slowFor = 0;
    this._stableFor = 0;
    this._cooldown = 0;
    this._average = 0;
    // Quality controls geometry/waves; this separate scalar controls resolution.
    this.dprLimit = this.config.dpr[1];
  }

  _detectQuality() {
    if (typeof navigator === 'undefined') return QUALITY.MEDIUM;
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    if ((memory && memory <= 2) || (cores && cores <= 2)) return QUALITY.LOW;
    if ((memory && memory <= 4) || (cores && cores <= 4) || window.innerWidth < 1280) return QUALITY.MEDIUM;
    return QUALITY.HIGH;
  }

  resetSamples() {
    this._lastFrameTime = this._sum = this._count = this._windowStart = 0;
    this._slowFor = this._stableFor = 0;
    this._fastest = 1000 / 60; this._sampleCount = 0;
  }

  recordFrame(timestamp, renderingDpr = this.dprLimit, resolutionCeiling = 2) {
    const delta = timestamp - this._lastFrameTime;
    this._lastFrameTime = timestamp;
    // Ignore resume/loading stalls; require a full fresh sustained sample window.
    if (!this._windowStart || delta > 250 || delta <= 0) {
      this._sum = this._count = this._sampleCount = 0; this._windowStart = timestamp;
      return false;
    }
    if (delta >= 3 && this._sampleCount < this._samples.length) this._samples[this._sampleCount++] = delta;
    this._sum += delta; this._count++;
    const elapsed = timestamp - this._windowStart;
    if (elapsed < 1000) return false;
    this._average = this._sum / this._count;
    // A fast percentile rejects isolated timing outliers; sort only once per second.
    if (this._sampleCount) {
      const samples = this._samples.subarray(0, this._sampleCount);
      samples.sort();
      this._fastest = Math.min(this._fastest, samples[Math.floor(samples.length * 0.1)]);
    }
    this._sampleCount = 0;
    this._sum = this._count = 0; this._windowStart = timestamp;
    const seconds = elapsed / 1000;
    // Detect sustained missed refreshes as well as sub-55 Hz rendering.
    const budget = Math.min(1000 / 55, this._fastest * 1.6);
    const slow = this._average > budget;
    const stable = this._average < Math.min(1000 / 57, this._fastest * 1.2);
    this._slowFor = slow ? this._slowFor + seconds : 0;
    this._stableFor = stable ? this._stableFor + seconds : 0;
    this._cooldown = Math.max(0, this._cooldown - seconds);
    if (this._cooldown > 0) return false;
    if (this._slowFor >= 4) {
      if (renderingDpr > 1) this.dprLimit = Math.max(1, renderingDpr - 0.25);
      else if (this.level < QUALITY.LOW) {
        this.level++; this.config = QUALITY_CONFIGS[this.level];
      } else return false;
      this._cooldown = 5; this._slowFor = this._stableFor = 0;
      return true;
    }
    if (this._stableFor >= 25 && this.level > QUALITY.HIGH) {
      this.level--; this.config = QUALITY_CONFIGS[this.level];
      this._cooldown = 10; this._stableFor = this._slowFor = 0;
      return true;
    }
    if (this._stableFor >= 12 && this.dprLimit < Math.min(resolutionCeiling, this.config.dpr[1])) {
      this.dprLimit = Math.min(resolutionCeiling, this.config.dpr[1], this.dprLimit + 0.25);
      this._cooldown = 8; this._stableFor = this._slowFor = 0;
      return true;
    }
    return false;
  }

  getAverageFPS() { return this._average ? 1000 / this._average : 0; }

  /**
   * Get the current quality config values.
   */
  getConfig() {
    return { ...this.config, dpr: [1, Math.min(this.dprLimit, this.config.dpr[1])] };
  }
}

export { PerformanceEngine, QUALITY, QUALITY_CONFIGS };
export default PerformanceEngine;
