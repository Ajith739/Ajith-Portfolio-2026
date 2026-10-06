/* Shared lifecycle for the static template and React hero. */
(() => {
  const immediate = new Set();
  const prepare = new Set();
  const cleanup = new Set();
  const breakpoint = width => width < 768 ? 'mobile' : width < 1280 ? 'tablet' : 'desktop';
  const read = () => ({ width: window.innerWidth, height: window.innerHeight,
    dpr: window.devicePixelRatio || 1, breakpoint: breakpoint(window.innerWidth) });
  let snapshot = read();
  let frame = 0, settleFrame = 0, timer = 0, revision = 0;
  let lenis = null;
  let sections = [], anchor = null, stableScroll = window.scrollY, resizing = false;
  const measureSections = () => [...document.querySelectorAll('.mxd-page-content > .mxd-section, .mxd-footer')].map(element => {
    const box = element.parentElement?.classList.contains('pin-spacer') ? element.parentElement : element;
    const rect = box.getBoundingClientRect();
    return { element, top: rect.top + window.scrollY, height: rect.height };
  });
  const rememberScroll = () => { if (!resizing) stableScroll = window.scrollY; };
  window.addEventListener('scroll', rememberScroll, { passive: true });
  const subscribe = (set, fn) => { set.add(fn); return () => set.delete(fn); };
  function refresh() {
    const version = revision;
    cancelAnimationFrame(settleFrame);
    // Pins carry explicit pixel widths from the last refresh. Temporarily revert
    // them before measuring responsive text/sections, then restore before paint.
    const pins = window.ScrollTrigger?.getAll().filter(trigger => trigger.pin) || [];
    pins.forEach(trigger => trigger.revert(true, true));
    try {
      const writes = [...prepare].map(fn => fn(snapshot)).filter(fn => typeof fn === 'function');
      writes.forEach(fn => fn());
    } finally {
      pins.forEach(trigger => trigger.revert(false, true));
    }
    settleFrame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => {
        if (version !== revision) return;
        lenis?.resize();
        window.ScrollTrigger?.refresh();
        // A pin refresh can change scrollHeight, so synchronize Lenis again.
        lenis?.resize();
        const nextSections = measureSections();
        if (anchor) {
          const section = nextSections.find(section => section.element === anchor.element);
          if (section) {
            const target = section.top + section.height * anchor.progress;
            if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
            else window.scrollTo(0, target);
            window.ScrollTrigger?.update();
          }
        }
        sections = nextSections; stableScroll = window.scrollY;
        anchor = null; resizing = false;
      });
    });
  }
  function scheduleRefresh() {
    revision++;
    cancelAnimationFrame(settleFrame);
    clearTimeout(timer);
    // Debounce only the expensive final pass, never canvas/model responsiveness.
    timer = setTimeout(refresh, 140);
  }
  function update() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const next = read();
      const changed = next.width !== snapshot.width || next.height !== snapshot.height || next.dpr !== snapshot.dpr;
      if (!changed) return;
      if (next.width !== snapshot.width && !resizing) {
        let section;
        for (const candidate of sections) { if (candidate.top <= stableScroll) section = candidate; }
        if (section?.height) anchor = { element: section.element, progress: Math.max(0, Math.min(1, (stableScroll - section.top) / section.height)) };
        resizing = true;
      }
      snapshot = next;
      immediate.forEach(fn => fn(snapshot));
      if (changed) scheduleRefresh();
    });
  }
  function visible() { if (!document.hidden) { update(); scheduleRefresh(); } }
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('orientationchange', update, { passive: true });
  window.visualViewport?.addEventListener('resize', update, { passive: true });
  document.addEventListener('visibilitychange', visible);
  // bfcache retains the existing instances; never reinitialize on pageshow.
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    cancelAnimationFrame(frame); cancelAnimationFrame(settleFrame); clearTimeout(timer);
    cleanup.forEach(fn => fn());
    window.removeEventListener('scroll', rememberScroll);
    window.removeEventListener('resize', update);
    window.removeEventListener('orientationchange', update);
    window.visualViewport?.removeEventListener('resize', update);
    document.removeEventListener('visibilitychange', visible);
    immediate.clear(); prepare.clear(); cleanup.clear();
  });
  window.portfolioViewport = {
    getSnapshot: () => snapshot,
    subscribe: fn => subscribe(immediate, fn),
    prepare: fn => subscribe(prepare, fn),
    cleanup: fn => subscribe(cleanup, fn),
    requestRefresh: scheduleRefresh,
    setLenis: instance => { lenis = instance; },
    scrollTo: (target, options = {}) => lenis?.scrollTo(target, {
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
      immediate: matchMedia('(prefers-reduced-motion: reduce)').matches,
      ...options,
    }),
  };
})();
