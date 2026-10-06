import assert from 'node:assert/strict';
import { PerformanceEngine, QUALITY } from '../src/engine/PerformanceEngine.js';

globalThis.window = { innerWidth: 1440 };
function feed(engine, fps, seconds, start = 100) {
  let time = start;
  for (let i = 0; i < fps * seconds; i++) engine.recordFrame(time += 1000 / fps);
  return time;
}
for (const fps of [60, 90, 120, 144, 165]) {
  const engine = new PerformanceEngine();
  feed(engine, fps, 90);
  assert.equal(engine.level, QUALITY.HIGH, `Stable ${fps} Hz must recover high quality`);
  assert(Math.abs(engine.getAverageFPS() - fps) < 0.01);
}
const engine = new PerformanceEngine();
let time = feed(engine, 30, 60);
assert.equal(engine.level, QUALITY.LOW, 'Sustained slow rendering must reduce quality');
time = feed(engine, 165, 150, time);
assert.equal(engine.level, QUALITY.HIGH, 'Sustained smooth rendering must recover quality');
engine.resetSamples();
feed(engine, 60, 15, time);
assert.equal(engine.level, QUALITY.HIGH, 'Moving to a slower display must reset the refresh estimate');
const isolatedStall = new PerformanceEngine();
time = feed(isolatedStall, 120, 2);
isolatedStall.recordFrame(time += 5000);
feed(isolatedStall, 120, 2, time);
assert.notEqual(isolatedStall.level, QUALITY.LOW, 'A hidden-tab stall must not trigger a quality collapse');
console.log('Adaptive quality checks passed at 60/90/120/144/165 Hz, degradation, recovery, and resume.');
