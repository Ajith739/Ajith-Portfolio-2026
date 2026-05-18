// components/Loader.jsx - Ocean Themed Loader (no Tailwind)
import { Html } from "@react-three/drei";

const Loader = () => {
  return (
    <Html center>
      <div className="loader-container">
        
        {/* Main Ocean Loader */}
        <div className="loader-ring-outer">
          
          {/* Outer rotating ring */}
          <div className="loader-ring-1" />
          
          {/* Middle ring - opposite rotation */}
          <div className="loader-ring-2" />
          
          {/* Inner ocean circle */}
          <div className="loader-ocean-circle">
            {/* Water surface waves */}
            <div className="loader-wave-surface" />
            
            {/* Rising bubbles */}
            <div className="loader-bubble loader-bubble--1" />
            <div className="loader-bubble loader-bubble--2" />
            <div className="loader-bubble loader-bubble--3" />
            
            {/* Small fish */}
            <div className="loader-fish">🐠</div>
          </div>
          
          {/* Center anchor icon */}
          <div className="loader-anchor">⚓</div>
          
          {/* Sparkle effects */}
          <div className="loader-sparkle loader-sparkle--1" />
          <div className="loader-sparkle loader-sparkle--2" />
        </div>
        
        {/* Loading Text */}
        <div className="loader-text-area">
          <p className="loader-text">DIVING IN</p>
          
          {/* Animated dots */}
          <div className="loader-dots">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="loader-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        
        {/* Wave decoration at bottom */}
        <div className="loader-wave-deco">
          <svg viewBox="0 0 120 20">
            <path
              d="M0,10 Q15,5 30,10 T60,10 T90,10 T120,10"
              fill="none"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="2"
              style={{ animation: "loader-wavePath 2s ease-in-out infinite" }}
            />
            <path
              d="M0,15 Q15,10 30,15 T60,15 T90,15 T120,15"
              fill="none"
              stroke="rgba(0, 119, 190, 0.3)"
              strokeWidth="1.5"
              style={{ animation: "loader-wavePath 2.5s ease-in-out infinite reverse" }}
            />
          </svg>
        </div>
      </div>
    </Html>
  );
};

export default Loader;