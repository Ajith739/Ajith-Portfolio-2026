import { Suspense, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import Loader from "../components/Loader";
import { Sky } from "../models/Sky";
import Ocean from "../models/Ocean";
import { Beach } from "../models/beach";

// Component to dynamically set scene background color
function SceneBackground({ isNightMode }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene.background) {
      scene.background = new THREE.Color(isNightMode ? "#030510" : "#8ce0ff");
    }
  }, [scene, isNightMode]);

  useFrame((state, delta) => {
    if (scene.background) {
      const targetColor = new THREE.Color(isNightMode ? "#030510" : "#8ce0ff");
      scene.background.lerp(targetColor, delta * 2.5); // Smooth animation
    }
  });

  return null;
}

const Home = () => {
  const [isNightMode, setIsNightMode] = useState(true);

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

  useEffect(() => {
    // Initial check to match Portfolio-HTML theme
    const checkTheme = () => {
      const theme = localStorage.getItem("template.theme");
      // Default to true (dark) if not set or set to dark
      setIsNightMode(theme === "dark" || !theme);
    };
    checkTheme();

    // Listen for attribute changes on the HTML element to sync theme
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme', 'class', 'data-theme', 'color-scheme'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, overflow: "hidden" }}>
      {/* ===== 3D CANVAS ===== */}
      <Canvas
        className="home-canvas"
        camera={{ near: 0.1, far: 1000, position: [0, 2, 25], fov: 60 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <Suspense fallback={<Loader />}>
          {/* Dynamically set scene background */}
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
