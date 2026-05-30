/**
 * MaterialCache.js — Global Material Registry
 * Adapted from folio-2025's Materials.js engine.
 *
 * Prevents duplicate shader compilations by caching materials
 * in a global Map keyed by name. Components call getOrCreate()
 * to reuse existing materials rather than creating new ones.
 */

class MaterialCache {
  static _instance = null;

  static getInstance() {
    if (!MaterialCache._instance) {
      MaterialCache._instance = new MaterialCache();
    }
    return MaterialCache._instance;
  }

  constructor() {
    if (MaterialCache._instance) {
      return MaterialCache._instance;
    }

    /** @type {Map<string, THREE.Material>} */
    this._cache = new Map();
  }

  /**
   * Get a cached material or create + cache it using the factory function.
   * This prevents duplicate shader compilations across components.
   *
   * @param {string} name — Unique material identifier
   * @param {() => THREE.Material} factoryFn — Creates the material if not cached
   * @returns {THREE.Material}
   */
  getOrCreate(name, factoryFn) {
    if (this._cache.has(name)) {
      return this._cache.get(name);
    }

    const material = factoryFn();
    this._cache.set(name, material);
    return material;
  }

  /**
   * Get a cached material by name.
   * @param {string} name
   * @returns {THREE.Material | undefined}
   */
  get(name) {
    return this._cache.get(name);
  }

  /**
   * Check if a material is cached.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._cache.has(name);
  }

  /**
   * Update a uniform value on a cached ShaderMaterial.
   * No-op if the material doesn't exist or doesn't have the uniform.
   *
   * @param {string} name — Material name
   * @param {string} uniformName — Uniform key
   * @param {*} value — New value
   */
  updateUniform(name, uniformName, value) {
    const mat = this._cache.get(name);
    if (mat && mat.uniforms && mat.uniforms[uniformName]) {
      mat.uniforms[uniformName].value = value;
    }
  }

  /**
   * Dispose all cached materials and clear the registry.
   * Call on app unmount to prevent GPU memory leaks.
   */
  disposeAll() {
    this._cache.forEach((material) => {
      if (material.dispose) material.dispose();
    });
    this._cache.clear();
  }

  /**
   * Dispose and remove a single cached material.
   * @param {string} name
   */
  dispose(name) {
    const mat = this._cache.get(name);
    if (mat) {
      if (mat.dispose) mat.dispose();
      this._cache.delete(name);
    }
  }

  /**
   * Get the number of cached materials (useful for debugging).
   * @returns {number}
   */
  get size() {
    return this._cache.size;
  }
}

export { MaterialCache };
export default MaterialCache;
