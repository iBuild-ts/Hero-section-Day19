import { useEffect, useRef } from "react";

interface CoffeeCanisterProps {
  scrollProgress: number; // Tightly controlled progress from parent
  isDark: boolean;
  activeRoastColor?: string; // Customizable neon accent depending on roast
  activeRoastName?: string;
}

export default function CoffeeCanister({
  scrollProgress,
  isDark,
  activeRoastColor = "#ff5500", // Default Neon Orange
}: CoffeeCanisterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(scrollProgress);
  const isDarkRef = useRef(isDark);
  const roastColorRef = useRef(activeRoastColor);

  // Sync refs to avoid re-renders of the high-performance animation loop
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    roastColorRef.current = activeRoastColor;
  }, [activeRoastColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Smooth state interpolation (inertial damping)
    let currentProgress = 0;
    let currentRotation = 0;
    let currentTilt = 0.05;
    let currentYOffset = 300;
    let currentScale = 0.8;
    let currentOpacity = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation Render Loop
    const render = () => {
      // Direct interpolation for buttery smoothing
      const targetProgress = progressRef.current;
      
      // Interpolate progress towards target for inertia
      currentProgress += (targetProgress - currentProgress) * 0.1;

      // Ensure canvas is clear
      ctx.clearRect(0, 0, width, height);

      // Define visual behavior map based on interpolated progress
      // 1. Opacity: Fades in from 0% to 15% scroll
      const targetOpacity = currentProgress < 0.05 ? 0 : Math.min(1, (currentProgress - 0.05) * 8);
      currentOpacity += (targetOpacity - currentOpacity) * 0.15;

      if (currentOpacity < 0.01) {
        animationId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.globalAlpha = currentOpacity;

      // 2. Vertical position (Y-Offset): Slides up into center
      // Starts low and settles in center (0) around 35% scroll
      const targetYOffset = currentProgress < 0.35 
        ? 200 * Math.pow(1 - (currentProgress / 0.35), 2)
        : 0;
      currentYOffset += (targetYOffset - currentYOffset) * 0.1;

      // 3. Scale: Zooms slightly in as it settles
      const targetScale = currentProgress < 0.35 
        ? 0.75 + 0.15 * (currentProgress / 0.35)
        : 0.9 + 0.1 * Math.sin((currentProgress - 0.35) * Math.PI * 0.2); // subtle organic zoom
      currentScale += (targetScale - currentScale) * 0.1;

      // 4. Rotation (Yaw): Spins rapidly from 15% to 75% scroll, then decelerates to face forward
      // We do a full 2.5 spins (5 * PI radians)
      let targetRotation = 0;
      if (currentProgress > 0.1) {
        if (currentProgress < 0.75) {
          // Linear/curved mapping for rapid rotation
          const norm = (currentProgress - 0.1) / 0.65;
          targetRotation = norm * Math.PI * 5.5;
        } else {
          // Lock to final face angle (facing slightly to the side or front-facing)
          // Let's settle at 2 * PI + 0.4 (almost front facing, slightly tilted)
          targetRotation = Math.PI * 5.5 + (currentProgress - 0.75) * 1.5;
        }
      }
      currentRotation += (targetRotation - currentRotation) * 0.08;

      // 5. Tilt (Pitch): Starts flat, tilts back from 65% to 90% scroll
      // This tilt exposes the bottom of the cap/underbrim
      const targetTilt = currentProgress > 0.6
        ? 0.05 + 0.38 * Math.min(1, (currentProgress - 0.6) / 0.25)
        : 0.05;
      currentTilt += (targetTilt - currentTilt) * 0.08;

      // Render calculations
      const cx = width / 2;
      const cy = height / 2 + currentYOffset - 10;
      const r = 90 * currentScale; // Cylinder radius
      const h = 260 * currentScale; // Cylinder height

      // Colors based on theme
      const darkTheme = isDarkRef.current;
      const neonColor = roastColorRef.current;

      // Draw shadow at bottom
      ctx.beginPath();
      const shadowGrad = ctx.createRadialGradient(cx, cy + h / 2 + 20, 10, cx, cy + h / 2 + 20, r * 1.8);
      shadowGrad.addColorStop(0, darkTheme ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.ellipse(cx, cy + h / 2 + 20, r * 1.6, 25 * currentScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Canister Body
      // We render back-to-front for proper depth simulation
      
      // Body metallic gradient
      const bodyGrad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      if (darkTheme) {
        bodyGrad.addColorStop(0, "#0a0a0a"); // dark edge
        bodyGrad.addColorStop(0.15, "#161616"); // ambient highlight
        bodyGrad.addColorStop(0.35, "#303030"); // specular highlight
        bodyGrad.addColorStop(0.42, "#1a1a1a"); // diffuse
        bodyGrad.addColorStop(0.7, "#0c0c0c"); // base
        bodyGrad.addColorStop(0.9, "#080808"); // soft ambient reflection
        bodyGrad.addColorStop(1, "#020202"); // dark right edge
      } else {
        bodyGrad.addColorStop(0, "#c0c0c0");
        bodyGrad.addColorStop(0.18, "#d9d9d9");
        bodyGrad.addColorStop(0.35, "#ffffff"); // crisp white highlight
        bodyGrad.addColorStop(0.42, "#e6e6e6");
        bodyGrad.addColorStop(0.7, "#d2d2d2");
        bodyGrad.addColorStop(0.9, "#c8c8c8");
        bodyGrad.addColorStop(1, "#acacac");
      }

      // 1. Draw Lower body cylinder
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      // Left side down, bottom ellipse arc, right side up, top ellipse arc
      ctx.moveTo(cx - r, cy - h / 2);
      ctx.lineTo(cx - r, cy + h / 2);
      ctx.ellipse(cx, cy + h / 2, r, r * currentTilt, 0, 0, Math.PI, false);
      ctx.lineTo(cx + r, cy - h / 2);
      ctx.ellipse(cx, cy - h / 2, r, r * currentTilt, 0, Math.PI, 0, true);
      ctx.fill();

      // Subtle bottom outline highlight
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + h / 2, r, r * currentTilt, 0, 0, Math.PI, false);
      ctx.stroke();

      // 2. Draw 3D Text wrap around cylinder surface!
      // This technique mimics mapping text onto a cylinder by scaling individual letters.
      const drawWrappedText = (text: string, angleOffset: number, yPos: number, fontSize: number, fontWeight: string, textStyle: string) => {
        ctx.save();
        ctx.font = `${fontWeight} ${fontSize}px var(--font-sans)`;
        ctx.fillStyle = textStyle;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw each letter
        const charSpacing = 16 * currentScale; // spacing in degrees
        const totalW = text.length * charSpacing;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          // Calculate angle for this character
          const charAngle = (angleOffset + (i - (text.length - 1) / 2) * (charSpacing / r)) + currentRotation;
          
          // Normalized angle to check if on front side (-PI/2 to PI/2)
          const wrappedAngle = ((charAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
          
          if (Math.abs(wrappedAngle) < Math.PI / 2) {
            // Visible front face
            const charX = cx + r * Math.sin(wrappedAngle) * 0.97; // push slightly inside for curvature
            const charY = cy + yPos * currentScale + r * Math.sin(wrappedAngle) * currentTilt * 0.1; // adjust height slightly for perspective
            
            // Calculate scale based on cylinder profile (foreshortening at sides)
            const horizScale = Math.cos(wrappedAngle);
            const skew = -Math.sin(wrappedAngle) * currentTilt; // tilt perspective skew
            
            ctx.save();
            ctx.translate(charX, charY);
            ctx.transform(horizScale, skew, 0, 1, 0, 0);
            
            // Faint shadow behind text
            ctx.shadowColor = darkTheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
            ctx.shadowBlur = 2;
            
            ctx.fillText(char, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      };

      // Draw primary branding "BRIM" (spaced out) on front side
      drawWrappedText(
        "BRIM", 
        0, 
        -40, 
        38 * currentScale, 
        "600", 
        darkTheme ? "rgba(255,255,255,0.92)" : "rgba(10,10,10,0.95)"
      );

      // Draw technical specifications on opposite side of cylinder (so they show during spin)
      drawWrappedText(
        "500ML VACUUM SEAL", 
        Math.PI, 
        -55, 
        10 * currentScale, 
        "500", 
        neonColor
      );
      drawWrappedText(
        "KŌHI TECH LABS", 
        Math.PI, 
        -35, 
        10 * currentScale, 
        "500", 
        darkTheme ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.5)"
      );

      // Draw dynamic specs text underneath branding
      drawWrappedText(
        "TITANIUM DOUBLE-WALL", 
        0, 
        20, 
        9 * currentScale, 
        "400", 
        darkTheme ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)"
      );

      // Draw fine technical code lines (like premium aerospace marking)
      drawWrappedText(
        "BRM-C05 // LOT-2026", 
        0, 
        35, 
        7 * currentScale, 
        "400", 
        darkTheme ? "rgba(255,255,255,0.25)" : "rgba(10,10,10,0.3)"
      );

      // 3. Draw The Cap Assembly
      // The Cap has a base collar, the glowing underbrim, the metallic ribbed gripper, and a glass-like top.
      const capY = cy - h / 2;
      const capH = 45 * currentScale;

      // A. The NEON ORANGE UNDERBRIM reveal!
      // This is represented as an overlapping glowing ring beneath the cap that expands/reveals itself when tilted.
      if (currentTilt > 0.08) {
        ctx.save();
        
        // Intensity of the glow depends on scroll climax progress (65% to 100%)
        const glowAlpha = Math.min(1, (currentProgress - 0.6) / 0.3);
        
        // Underbrim container path
        ctx.beginPath();
        // The underbrim thickness increases as tilt increases
        const brimHeight = 16 * currentScale * (currentTilt * 2.2);
        
        // Set glow shadow
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = (20 + 15 * Math.sin(Date.now() / 150)) * currentScale; // pulsing glow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * currentScale;

        // Draw neon ellipse
        ctx.fillStyle = neonColor;
        ctx.globalAlpha = currentOpacity * glowAlpha;
        
        ctx.ellipse(cx, capY, r * 0.98, r * 0.98 * currentTilt + brimHeight * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner seal shadow for physical depth
        ctx.shadowBlur = 0;
        ctx.globalAlpha = currentOpacity * glowAlpha * 0.4;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(cx, capY, r * 0.85, r * 0.85 * currentTilt, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // B. Cap Collar (silver/dark rim that sits above underbrim)
      const collarH = 8 * currentScale;
      const collarGrad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      if (darkTheme) {
        collarGrad.addColorStop(0, "#1f1f1f");
        collarGrad.addColorStop(0.3, "#4f4f4f");
        collarGrad.addColorStop(0.4, "#8c8c8c"); // high specular reflection
        collarGrad.addColorStop(0.5, "#3d3d3d");
        collarGrad.addColorStop(1, "#121212");
      } else {
        collarGrad.addColorStop(0, "#9c9c9c");
        collarGrad.addColorStop(0.3, "#d9d9d9");
        collarGrad.addColorStop(0.4, "#ffffff");
        collarGrad.addColorStop(0.5, "#eaeaea");
        collarGrad.addColorStop(1, "#8e8e8e");
      }

      ctx.fillStyle = collarGrad;
      ctx.beginPath();
      ctx.moveTo(cx - r, capY - collarH);
      ctx.lineTo(cx - r, capY);
      ctx.ellipse(cx, capY, r, r * currentTilt, 0, 0, Math.PI, false);
      ctx.lineTo(cx + r, capY - collarH);
      ctx.ellipse(cx, capY - collarH, r, r * currentTilt, 0, Math.PI, 0, true);
      ctx.fill();

      // C. The main Cap body (ribbed vacuum cap)
      const mainCapY = capY - collarH;
      const mainCapH = 32 * currentScale;
      const capGrad = ctx.createLinearGradient(cx - r * 0.96, 0, cx + r * 0.96, 0);
      if (darkTheme) {
        capGrad.addColorStop(0, "#080808");
        capGrad.addColorStop(0.2, "#181818");
        capGrad.addColorStop(0.35, "#3a3a3a");
        capGrad.addColorStop(0.42, "#202020");
        capGrad.addColorStop(0.7, "#0c0c0c");
        capGrad.addColorStop(1, "#030303");
      } else {
        capGrad.addColorStop(0, "#afafaf");
        capGrad.addColorStop(0.2, "#dadada");
        capGrad.addColorStop(0.35, "#fdfdfd");
        capGrad.addColorStop(0.42, "#e5e5e5");
        capGrad.addColorStop(0.7, "#cfcfcf");
        capGrad.addColorStop(1, "#9e9e9e");
      }

      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.96, mainCapY - mainCapH);
      ctx.lineTo(cx - r * 0.96, mainCapY);
      ctx.ellipse(cx, mainCapY, r * 0.96, r * 0.96 * currentTilt, 0, 0, Math.PI, false);
      ctx.lineTo(cx + r * 0.96, mainCapY - mainCapH);
      ctx.ellipse(cx, mainCapY - mainCapH, r * 0.96, r * 0.96 * currentTilt, 0, Math.PI, 0, true);
      ctx.fill();

      // D. Draw vertical rib lines on the cap to simulate a knurled or high-grip mechanical rim
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1 * currentScale;
      const numRibs = 36;
      for (let i = 0; i < numRibs; i++) {
        // Rib angle rotating around cap
        const ribAngle = (i / numRibs) * Math.PI * 2 + currentRotation * 0.3; // rotates slower or in sync
        const wrappedAngle = ((ribAngle + Math.PI) % (Math.PI * 2)) - Math.PI;

        if (Math.abs(wrappedAngle) < Math.PI / 2) {
          const rx = cx + r * 0.96 * Math.sin(wrappedAngle);
          const ryTop = mainCapY - mainCapH + r * 0.96 * Math.sin(wrappedAngle) * currentTilt;
          const ryBot = mainCapY + r * 0.96 * Math.sin(wrappedAngle) * currentTilt;
          
          // Draw a fine vertical line
          ctx.beginPath();
          ctx.moveTo(rx, ryTop);
          ctx.lineTo(rx, ryBot);
          ctx.stroke();
        }
      }

      // E. Cap Top Seal Rim (Sleek bevel top)
      const topCapY = mainCapY - mainCapH;
      const topBevelH = 3 * currentScale;
      ctx.fillStyle = darkTheme ? "#1c1c1c" : "#eaeaea";
      ctx.beginPath();
      ctx.ellipse(cx, topCapY, r * 0.96, r * 0.96 * currentTilt, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top Glass Insert/Logo Center
      const glassGrad = ctx.createRadialGradient(cx, topCapY, r * 0.1, cx, topCapY, r * 0.9);
      if (darkTheme) {
        glassGrad.addColorStop(0, "#2a2a2a");
        glassGrad.addColorStop(0.5, "#151515");
        glassGrad.addColorStop(1, "#0a0a0a");
      } else {
        glassGrad.addColorStop(0, "#ffffff");
        glassGrad.addColorStop(0.5, "#f0f0f0");
        glassGrad.addColorStop(1, "#d5d5d5");
      }
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.ellipse(cx, topCapY, r * 0.88, r * 0.88 * currentTilt, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic light glint across glass top
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, topCapY, r * 0.88, r * 0.88 * currentTilt, 0, 0, Math.PI * 2);
      ctx.clip();
      
      const glintGrad = ctx.createLinearGradient(cx - r, topCapY - r * currentTilt, cx + r, topCapY + r * currentTilt);
      glintGrad.addColorStop(0, "rgba(255,255,255,0)");
      glintGrad.addColorStop(0.4, "rgba(255,255,255,0)");
      glintGrad.addColorStop(0.5, darkTheme ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.5)");
      glintGrad.addColorStop(0.55, darkTheme ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.6)");
      glintGrad.addColorStop(0.65, "rgba(255,255,255,0)");
      ctx.fillStyle = glintGrad;
      
      ctx.beginPath();
      // Draw a rotating glint banner
      const glintPos = ((currentProgress * 2.5) % 1) * r * 4 - r * 2;
      ctx.rect(cx - r + glintPos, topCapY - 50, r, 100);
      ctx.fill();
      ctx.restore();

      // Top concentric gold ring/accent (The luxurious core)
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 1.5 * currentScale;
      ctx.globalAlpha = currentOpacity * (0.3 + 0.7 * Math.min(1, currentProgress * 2));
      ctx.beginPath();
      ctx.ellipse(cx, topCapY, r * 0.4, r * 0.4 * currentTilt, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mini brand icon in core of lid
      ctx.fillStyle = darkTheme ? "#ffffff" : "#000000";
      ctx.font = `600 ${10 * currentScale}px var(--font-sans)`;
      ctx.fillText("B", cx, topCapY);

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div id="canister-viewport" className="relative w-full h-[400px] md:h-[550px] flex items-center justify-center select-none">
      {/* Background glow beneath canister (matching active roast color) */}
      <div 
        className="absolute inset-0 m-auto w-[250px] h-[250px] rounded-full filter blur-[100px] transition-all duration-1000 opacity-20 pointer-events-none"
        style={{
          backgroundColor: roastColorRef.current,
          opacity: isDark ? scrollProgress * 0.25 : scrollProgress * 0.12,
        }}
      />
      <canvas
        ref={canvasRef}
        id="canister-canvas"
        className="w-full h-full max-w-[500px]"
        style={{ display: "block" }}
      />
    </div>
  );
}
