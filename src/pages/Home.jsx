import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import Loader from "../components/Loader";
import { Sky } from "../models/Sky";
import Ocean from "../models/Ocean";
import { Beach } from "../models/beach";

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

const Home = () => {
  const [isNightMode, setIsNightMode] = useState(() => getCurrentTheme());

  const [beachConfig, setBeachConfig] = useState({
    scale: [1.5, 1.5, 1.5],
    position: [0, -10, -80],
    rotation: [0, Math.PI * 0.85, 0],
  });

  const adjustModelsForScreenSize = useCallback(() => {
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
  }, []);

  useEffect(() => {
    adjustModelsForScreenSize();
    window.addEventListener("resize", adjustModelsForScreenSize);
    return () => window.removeEventListener("resize", adjustModelsForScreenSize);
  }, [adjustModelsForScreenSize]);

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
    <div className="home-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden" }}>
      <Canvas
        className="home-canvas"
        camera={{ near: 0.1, far: 1000, position: [0, 2, 25], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
        }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <Suspense fallback={<Loader />}>
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

          <Sky isNightMode={isNightMode} />
          <Beach
            scale={beachConfig.scale}
            position={beachConfig.position}
            rotation={beachConfig.rotation}
          />
          <Ocean isNightMode={isNightMode} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Home;
