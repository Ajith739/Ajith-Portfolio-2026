import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Loader from "../components/Loader";
import { Sky } from "../models/Sky";
import Ocean from "../models/Ocean";
import { Beach } from "../models/beach";
import useAdaptivePerformance from "../hooks/useAdaptivePerformance";

// ─── Read the template's current theme state ───
function getCurrentTheme() {
  // 1. color-scheme attribute on <html> (set by mxdColorSwitcher)
  const cs = document.documentElement.getAttribute("color-scheme");
  if (cs === "light") return false;
  if (cs === "dark") return true;

  // 2. localStorage (persisted by template)
  try {
    const stored = localStorage.getItem("template.theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
  } catch (e) {}

  // 3. System preference
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  return true;
}

// ─── Scene background with fast transition ───
function SceneBackground({ isNightMode }) {
  const { scene } = useThree();

  // Day: vibrant sky blue matching the ocean sky | Night: deep dark blue
  const dayColor = "#87ceeb";
  const nightColor = "#030510";

  const targetColor = useRef(new THREE.Color(isNightMode ? nightColor : dayColor));

  useEffect(() => {
    targetColor.current.set(isNightMode ? nightColor : dayColor);
  }, [isNightMode]);

  useEffect(() => {
    scene.background = new THREE.Color(isNightMode ? nightColor : dayColor);
  }, [scene, isNightMode]);

  useFrame((_, delta) => {
    if (scene.background) {
      // Fast transition — nearly instant to match the template CSS
      scene.background.lerp(targetColor.current, Math.min(delta * 8.0, 1.0));
    }
  });

  return null;
}

// ─── FPS Recorder — minimal component to feed the performance engine ───
function FPSRecorder({ recordFrame }) {
  useFrame((state) => {
    recordFrame(state.clock.elapsedTime * 1000);
  });
  return null;
}

const Home = () => {
  const [isNightMode, setIsNightMode] = useState(() => getCurrentTheme());
  const [isVisible, setIsVisible] = useState(true);
  // Delay 3D rendering start until GSAP ScrollTrigger has finished
  // initializing and measuring pin positions. Without this delay,
  // the heavy 3D scene competes for GPU time during page load,
  // causing "My Approach" and "My Expertise" to miscalculate pins.
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);

  // Adaptive performance from engine
  const {
    dpr,
    oceanSegments,
    starCount,
    cloudCount,
    prefersReducedMotion,
    recordFrame,
  } = useAdaptivePerformance();

  // Adaptive DPR state — drei PerformanceMonitor can further adjust this
  const [adaptiveDpr, setAdaptiveDpr] = useState(dpr[1]);

  const [beachConfig, setBeachConfig] = useState({
    scale: [1.5, 1.5, 1.5],
    position: [0, -10, -80],
    rotation: [0, Math.PI * 0.85, 0],
  });

  // Debounced resize handler — prevents layout thrashing
  const resizeTimeout = useRef(null);
  const adjustModelsForScreenSize = useCallback(() => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      let bScale, bPosition, bRotation;

      if (window.innerWidth < 768) {
        bScale = [1.2, 1.2, 1.2];
        bPosition = [0, -10, -65];
        bRotation = [0, Math.PI * 0.85, 0];
      } else if (window.innerWidth < 1280) {
        bScale = [1.4, 1.4, 1.4];
        bPosition = [0, -10, -75];
        bRotation = [0, Math.PI * 0.85, 0];
      } else {
        bScale = [1.5, 1.5, 1.5];
        bPosition = [0, -10, -80];
        bRotation = [0, Math.PI * 0.85, 0];
      }

      setBeachConfig({ scale: bScale, position: bPosition, rotation: bRotation });
    }, 150);
  }, []);

  useEffect(() => {
    adjustModelsForScreenSize();
    window.addEventListener("resize", adjustModelsForScreenSize);
    return () => {
      window.removeEventListener("resize", adjustModelsForScreenSize);
      clearTimeout(resizeTimeout.current);
    };
  }, [adjustModelsForScreenSize]);

  // ─── Intersection Observer: pause rendering when hero is scrolled out ───
  // Uses multiple thresholds so the callback fires at meaningful visibility points.
  // Pauses the 3D frame loop once less than ~8% of the hero section is visible,
  // freeing the GPU/CPU for GSAP ScrollTrigger animations below the fold.
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio > 0.08);
      },
      { threshold: [0, 0.08, 0.25, 0.5, 1.0] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ─── Delayed startup: let GSAP ScrollTrigger initialize first ───
  // The template's app.min.js sets up ScrollTrigger pins during/after
  // the loader animation (~1.5s). If the 3D canvas is rendering during
  // this time, it steals GPU time and causes pin miscalculations.
  // Also pause briefly on resize so ScrollTrigger.refresh() can work.
  useEffect(() => {
    const startupTimer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    // Pause canvas briefly during resize so ScrollTrigger can refresh
    const handleResize = () => {
      setIsReady(false);
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        setIsReady(true);
      }, 400);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(startupTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ─── Theme sync ───
  useEffect(() => {
    const syncTheme = () => {
      setIsNightMode(getCurrentTheme());
    };

    // Initial sync
    syncTheme();

    // 1. Watch the color-scheme attribute on <html> — this is what
    //    mxdColorSwitcher() sets when the user clicks the toggle
    const observer = new MutationObserver(() => {
      syncTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["color-scheme"],
    });

    // 2. Direct click listener on the toggle button
    //    The template's mxdColorSwitcher sets localStorage then setAttribute
    //    both synchronously in the click handler, so by the time our
    //    requestAnimationFrame fires, the attribute is already updated
    const btn = document.getElementById("color-switcher");
    const onBtnClick = () => {
      requestAnimationFrame(syncTheme);
      setTimeout(syncTheme, 50);
    };
    if (btn) btn.addEventListener("click", onBtnClick);

    // 3. Cross-tab sync
    const onStorage = (e) => {
      if (e.key === "template.theme") syncTheme();
    };
    window.addEventListener("storage", onStorage);

    // 4. System preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncTheme);

    // 5. The template's mxdColorSwitcher() runs on DOMContentLoaded.
    //    Our React module script may execute before DOMContentLoaded fires,
    //    so the color-scheme attribute may not be set yet.
    //    Re-sync after DOMContentLoaded and a bit after.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(syncTheme, 50);
      });
    } else {
      // DOMContentLoaded already fired, but template might not have
      // finished its initialization yet
      setTimeout(syncTheme, 100);
      setTimeout(syncTheme, 500);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", syncTheme);
      if (btn) btn.removeEventListener("click", onBtnClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="home-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      <Canvas
        className="home-canvas"
        camera={{ near: 0.1, far: 1000, position: [0, 2, 25], fov: 60 }}
        dpr={adaptiveDpr}
        frameloop={isReady && isVisible ? "always" : "never"}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Auto-regress DPR when FPS drops below 30 */}
        <PerformanceMonitor
          ms={250}
          iterations={4}
          threshold={0.65}
          onDecline={() =>
            setAdaptiveDpr((prev) => Math.max(prev - 0.25, dpr[0]))
          }
          onIncline={() =>
            setAdaptiveDpr((prev) => Math.min(prev + 0.25, dpr[1]))
          }
        />

        <Suspense fallback={<Loader />}>
          {/* FPS tracking for the adaptive performance engine */}
          <FPSRecorder recordFrame={recordFrame} />

          <SceneBackground isNightMode={isNightMode} />

          <ambientLight intensity={isNightMode ? 0.35 : 0.7} />
          <directionalLight
            position={[1, 10, 1]}
            intensity={isNightMode ? 1.2 : 2.5}
          />
          <hemisphereLight
            skyColor={isNightMode ? "#1a3a6e" : "#b1e1ff"}
            groundColor={isNightMode ? "#002244" : "#006994"}
            intensity={isNightMode ? 0.5 : 1}
          />

          <Sky
            isNightMode={isNightMode}
            maxStars={starCount}
            maxClouds={cloudCount}
          />
          <Beach
            scale={beachConfig.scale}
            position={beachConfig.position}
            rotation={beachConfig.rotation}
          />
          <Ocean
            isNightMode={isNightMode}
            segments={oceanSegments}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Home;
