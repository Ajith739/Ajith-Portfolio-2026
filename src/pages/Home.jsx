import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { viewport, modelConfig } from "../engine/viewport";
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
function FPSRecorder({ recordFrame, resolutionCeiling }) {
  useFrame((state) => {
    recordFrame(state.clock.elapsedTime * 1000, state.gl.getPixelRatio(), resolutionCeiling);
  });
  return null;
}

function SceneLifecycle({ responsive, isNightMode }) {
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [invalidate, responsive, isNightMode]);
  useEffect(() => { viewport.requestRefresh(); }, []);
  return null;
}

const Home = () => {
  const [isNightMode, setIsNightMode] = useState(() => getCurrentTheme());
  const [isVisible, setIsVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
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


  const [responsive, setResponsive] = useState(viewport.getSnapshot);
  const beachConfig = modelConfig(responsive.breakpoint);
  const resolutionCeiling = Math.min(responsive.dpr, responsive.breakpoint === 'mobile' ? 1.5 : 2);
  const adaptiveDpr = Math.min(resolutionCeiling, dpr[1]);
  useEffect(() => viewport.subscribe(setResponsive), []);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

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

    // 3. Cross-tab sync
    const onStorage = (e) => {
      if (e.key === "template.theme") syncTheme();
    };
    window.addEventListener("storage", onStorage);

    // 4. System preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncTheme);

    const onReady = () => syncTheme();
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", syncTheme);
      document.removeEventListener("DOMContentLoaded", onReady);
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
        resize={{ scroll: false, debounce: 0 }}
        camera={{ near: 0.1, far: 1000, position: [0, 2, 25], fov: 60 }}
        dpr={adaptiveDpr}
        frameloop={isVisible && pageVisible && !prefersReducedMotion ? "always" : "demand"}
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
        <SceneLifecycle responsive={responsive} isNightMode={isNightMode} />
        <Suspense fallback={<Loader />}>
          {/* FPS tracking for the adaptive performance engine */}
          <FPSRecorder recordFrame={recordFrame} resolutionCeiling={resolutionCeiling} />

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
            reducedMotion={prefersReducedMotion}
          />
          <Beach
            reducedMotion={prefersReducedMotion}
            scale={beachConfig.scale}
            position={beachConfig.position}
            rotation={beachConfig.rotation}
          />
          <Ocean
            isNightMode={isNightMode}
            segments={oceanSegments}
            reducedMotion={prefersReducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Home;
