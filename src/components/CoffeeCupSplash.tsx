import { useEffect, useRef } from "react";

interface CoffeeCupSplashProps {
  scrollProgress: number; // 0 to 1 overall progress from parent
  isDark: boolean;
  accentColor: string;
}

export default function CoffeeCupSplash({
  scrollProgress,
  isDark,
  accentColor,
}: CoffeeCupSplashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(scrollProgress);
  const isDarkRef = useRef(isDark);
  const accentRef = useRef(accentColor);

  // Sync refs to ensure high performance
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    accentRef.current = accentColor;
  }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Smooth state variables for high fidelity
    let currentProgress = 0;
    let steamParticles: Array<{ x: number; y: number; size: number; speedY: number; opacity: number; age: number; maxAge: number }> = [];
    let splashParticles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number; grav: number }> = [];

    // Static structures for luxury elements (beans and ice cubes)
    // Their positions/rotations will update dynamically based on currentProgress
    const beans = [
      { baseX: -160, baseY: -120, size: 26, angle: 0.8, speedX: 15, speedY: -50, rotateSpeed: 2.5 },
      { baseX: 180, baseY: -80, size: 22, angle: -0.4, speedX: -20, speedY: -30, rotateSpeed: -1.8 },
      { baseX: -190, baseY: 100, size: 24, angle: 1.5, speedX: 30, speedY: -60, rotateSpeed: 3.2 },
      { baseX: 150, baseY: 140, size: 20, angle: -1.1, speedX: -25, speedY: -45, rotateSpeed: -2.2 },
      { baseX: -80, baseY: -210, size: 18, angle: 0.3, speedX: 10, speedY: -70, rotateSpeed: 1.2 },
      { baseX: 90, baseY: 220, size: 25, angle: 2.1, speedX: -15, speedY: -35, rotateSpeed: -2.8 },
    ];

    const iceCubes = [
      { baseX: -120, baseY: -40, size: 32, angle: 0.5, speedX: 25, speedY: -40, rotateSpeed: 1.4 },
      { baseX: 140, baseY: -140, size: 36, angle: -0.8, speedX: -15, speedY: -60, rotateSpeed: -1.9 },
      { baseX: -110, baseY: 180, size: 28, angle: 1.2, speedX: 20, speedY: -30, rotateSpeed: 2.1 },
      { baseX: 160, baseY: 60, size: 34, angle: -0.3, speedX: -30, speedY: -50, rotateSpeed: -1.1 },
    ];

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

    // Initialize splash particles once
    const initSplash = (cx: number, cy: number) => {
      splashParticles = [];
      const colors = ["#4a2c11", "#613a1a", "#e07d38", "#ffffff", "#cca080"];
      for (let i = 0; i < 95; i++) {
        const angle = -Math.PI / 4 - Math.random() * (Math.PI * 2/3); // spray upwards/outwards
        const speed = 4 + Math.random() * 9;
        splashParticles.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: cy + 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 4.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.85 + Math.random() * 0.15,
          grav: 0.18,
        });
      }
    };

    // Helper: Draw 3D-looking Coffee Bean
    const drawCoffeeBean = (x: number, y: number, size: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Radial gradient for 3D sphere look
      const beanGrad = ctx.createRadialGradient(-size / 4, -size / 4, 1, 0, 0, size);
      beanGrad.addColorStop(0, "#734320"); // warm highlight
      beanGrad.addColorStop(0.6, "#4a250d"); // rich brown
      beanGrad.addColorStop(1, "#1c0d02"); // dark shadow

      ctx.fillStyle = beanGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center crease line (curved crease)
      ctx.strokeStyle = "#120600";
      ctx.lineWidth = size * 0.12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-size * 0.85, 0);
      ctx.bezierCurveTo(-size * 0.3, -size * 0.25, size * 0.3, size * 0.25, size * 0.85, 0);
      ctx.stroke();

      // Highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = size * 0.05;
      ctx.beginPath();
      ctx.moveTo(-size * 0.75, -size * 0.1);
      ctx.bezierCurveTo(-size * 0.3, -size * 0.28, size * 0.3, size * 0.12, size * 0.75, -size * 0.1);
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Draw 3D Glassy Translucent Ice Cube
    const drawIceCube = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const drawFace = (p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number], color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.lineTo(p4[0], p4[1]);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      const h = size / 2;
      const d = size * 0.38; // isometric depth

      const t1: [number, number] = [0, -h];
      const t2: [number, number] = [size * 0.8, -h + d];
      const t3: [number, number] = [0, -h + 2 * d];
      const t4: [number, number] = [-size * 0.8, -h + d];

      const b1: [number, number] = [0, h];
      const b2: [number, number] = [size * 0.8, h + d];
      const b3: [number, number] = [0, h + 2 * d];
      const b4: [number, number] = [-size * 0.8, h + d];

      // Draw three faces (isometric cube)
      drawFace(t1, t2, t3, t4, "rgba(245, 252, 255, 0.22)"); // Top
      drawFace(t4, t3, b3, b4, "rgba(220, 240, 255, 0.12)"); // Left
      drawFace(t3, t2, b2, b3, "rgba(195, 230, 255, 0.08)"); // Right

      // Specular glare line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(t4[0], t4[1]);
      ctx.lineTo(t3[0], t3[1]);
      ctx.lineTo(b3[0], b3[1]);
      ctx.stroke();

      // Tiny inner oxygen bubbles for high realism
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(-size * 0.2, -size * 0.1, 1.8, 0, Math.PI * 2);
      ctx.arc(size * 0.3, size * 0.15, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw Latte Art Crema Pattern inside the liquid ellipse
    const drawLatteArt = (cx: number, cy: number, rx: number, ry: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Crema base ring
      ctx.fillStyle = "#e07d38";
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer concentric heart pattern
      const drawSwirlHeart = (scaleX: number, scaleY: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.04) {
          const x = 16 * Math.sin(t) ** 3 * (rx / 20) * scaleX;
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * (ry / 16) * scaleY;
          if (t === 0) ctx.moveTo(x, y - ry * 0.08);
          else ctx.lineTo(x, y - ry * 0.08);
        }
        ctx.closePath();
        ctx.fill();
      };

      // Stacked heart layers for professional barista latte art
      drawSwirlHeart(0.85, 0.85, "#cca080");
      drawSwirlHeart(0.72, 0.72, "#e0bd9b");
      drawSwirlHeart(0.58, 0.58, "#f3dcbf");
      drawSwirlHeart(0.42, 0.42, "#ffffff");
      drawSwirlHeart(0.20, 0.20, "#e0bd9b");

      ctx.restore();
    };

    // Helper: Draw elegant fluid coffee splash swirl arcs
    const drawCoffeeSplashSwirl = (cx: number, cy: number, cupWidth: number, progress: number) => {
      const swirlProgress = Math.max(0, Math.min(1, (progress - 0.4) * 2.5));
      if (swirlProgress <= 0) return;

      ctx.save();
      ctx.globalAlpha = swirlProgress;

      const splashGrad = ctx.createLinearGradient(cx - 160, cy, cx + 160, cy + 80);
      splashGrad.addColorStop(0, "rgba(74, 44, 17, 0.9)");
      splashGrad.addColorStop(0.5, "rgba(224, 125, 56, 0.95)"); // gorgeous caramel gold
      splashGrad.addColorStop(1, "rgba(28, 13, 2, 0.9)");

      ctx.fillStyle = splashGrad;
      ctx.strokeStyle = "rgba(255, 235, 215, 0.4)";
      ctx.lineWidth = 1;

      // Left swirling splash ribbon wrapping around cup base
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 50);
      ctx.bezierCurveTo(
        cx - 100 - (swirlProgress * 65), cy + 70 + (swirlProgress * 25),
        cx - 150 - (swirlProgress * 85), cy - 20 - (swirlProgress * 55),
        cx - 90 - (swirlProgress * 110), cy - 70 - (swirlProgress * 95)
      );
      // Splashing droplet head
      ctx.quadraticCurveTo(
        cx - 105 - (swirlProgress * 115), cy - 90 - (swirlProgress * 110),
        cx - 80 - (swirlProgress * 95), cy - 60 - (swirlProgress * 80)
      );
      ctx.bezierCurveTo(
        cx - 120 - (swirlProgress * 50), cy + 10 - (swirlProgress * 15),
        cx - 90 - (swirlProgress * 20), cy + 50,
        cx - 10, cy + 60
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right swirling splash ribbon
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 50);
      ctx.bezierCurveTo(
        cx + 100 + (swirlProgress * 75), cy + 60 + (swirlProgress * 30),
        cx + 160 + (swirlProgress * 95), cy - 10 - (swirlProgress * 45),
        cx + 100 + (swirlProgress * 120), cy - 60 - (swirlProgress * 100)
      );
      // Splashing droplet head
      ctx.quadraticCurveTo(
        cx + 115 + (swirlProgress * 125), cy - 80 - (swirlProgress * 115),
        cx + 90 + (swirlProgress * 105), cy - 50 - (swirlProgress * 85)
      );
      ctx.bezierCurveTo(
        cx + 125 + (swirlProgress * 60), cy + 10,
        cx + 95 + (swirlProgress * 25), cy + 45,
        cx + 10, cy + 60
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    let hasSplashed = false;

    // Animation Loop
    const render = () => {
      const targetProgress = progressRef.current;
      currentProgress += (targetProgress - currentProgress) * 0.08; // smooth spring lag

      ctx.clearRect(0, 0, width, height);

      // Target Coordinates
      const cx = width / 2;
      const cy = height / 2 + 30;
      const cupWidth = 140;
      const cupHeight = 160;
      const darkTheme = isDarkRef.current;
      const neonColor = accentRef.current;

      // Trigger high-fidelity fluid splash at scroll climax (above 0.78)
      if (currentProgress > 0.78 && !hasSplashed) {
        initSplash(cx, cy);
        hasSplashed = true;
      } else if (currentProgress < 0.72) {
        hasSplashed = false;
      }

      ctx.save();

      // 1. Draw glowing background warm light
      const auraGrad = ctx.createRadialGradient(cx, cy - 20, 5, cx, cy - 20, 240);
      auraGrad.addColorStop(0, darkTheme ? "rgba(92, 51, 23, 0.25)" : "rgba(224, 180, 140, 0.18)");
      auraGrad.addColorStop(0.5, "rgba(255, 120, 50, 0.03)");
      auraGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 260, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Coffee Swirling Splashes (Z-index: behind the cup)
      drawCoffeeSplashSwirl(cx, cy, cupWidth, currentProgress);

      // 3. Draw Coffee Cup (Double walled premium insulated design)
      // Overall fade in based on scroll progress (starting to show at 0.3, full at 0.6)
      const cupOpacity = Math.max(0, Math.min(1, (currentProgress - 0.25) * 3.5));
      ctx.globalAlpha = cupOpacity;

      // Base shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + cupHeight / 2 + 15, 75, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = darkTheme ? "rgba(0,0,0,0.6)" : "rgba(80,60,50,0.18)";
      ctx.fill();

      // Glass gradient
      const glassGrad = ctx.createLinearGradient(cx - cupWidth / 2, 0, cx + cupWidth / 2, 0);
      if (darkTheme) {
        glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
        glassGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.06)");
        glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
        glassGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.08)");
        glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.22)");
      } else {
        glassGrad.addColorStop(0, "rgba(60, 40, 30, 0.28)");
        glassGrad.addColorStop(0.2, "rgba(60, 40, 30, 0.08)");
        glassGrad.addColorStop(0.5, "rgba(60, 40, 30, 0.02)");
        glassGrad.addColorStop(0.8, "rgba(60, 40, 30, 0.14)");
        glassGrad.addColorStop(1, "rgba(60, 40, 30, 0.32)");
      }

      // Outer glass vessel cylinder
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.3)" : "rgba(60,40,30,0.22)";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.moveTo(cx - cupWidth / 2, cy - cupHeight / 2);
      ctx.lineTo(cx - cupWidth / 2 + 12, cy + cupHeight / 2 - 22);
      ctx.quadraticCurveTo(cx - cupWidth / 2 + 18, cy + cupHeight / 2, cx, cy + cupHeight / 2);
      ctx.quadraticCurveTo(cx + cupWidth / 2 - 18, cy + cupHeight / 2, cx + cupWidth / 2 - 12, cy + cupHeight / 2 - 22);
      ctx.lineTo(cx + cupWidth / 2, cy - cupHeight / 2);
      ctx.stroke();
      ctx.fill();

      // Handle (elegant double loop)
      ctx.beginPath();
      ctx.ellipse(cx + cupWidth / 2 + 15, cy, 25, 38, 0, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.25)" : "rgba(60,40,30,0.2)";
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx + cupWidth / 2 + 15, cy, 25, 38, 0, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner wall of double glass vacuum insulation
      ctx.strokeStyle = darkTheme ? "rgba(255,255,255,0.14)" : "rgba(60,40,30,0.11)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - cupWidth / 2 + 9, cy - cupHeight / 2 + 6);
      ctx.lineTo(cx - cupWidth / 2 + 18, cy + cupHeight / 2 - 25);
      ctx.quadraticCurveTo(cx - cupWidth / 2 + 22, cy + cupHeight / 2 - 10, cx, cy + cupHeight / 2 - 10);
      ctx.quadraticCurveTo(cx + cupWidth / 2 - 22, cy + cupHeight / 2 - 10, cx + cupWidth / 2 - 18, cy + cupHeight / 2 - 25);
      ctx.lineTo(cx + cupWidth / 2 - 9, cy - cupHeight / 2 + 6);
      ctx.stroke();

      // 4. Fill Coffee Liquid with Latte Art (Fills up smoothly during scroll 0.4 to 0.75)
      const fillPercent = Math.max(0, Math.min(0.76, (currentProgress - 0.35) * 2.5));
      const liquidHeight = cupHeight * fillPercent;
      const liquidY = cy + cupHeight / 2 - liquidHeight;

      if (liquidHeight > 10) {
        ctx.save();
        
        // Clip to inner wall shape
        ctx.beginPath();
        ctx.moveTo(cx - cupWidth / 2 + 17, cy - cupHeight / 2 + 6);
        ctx.lineTo(cx - cupWidth / 2 + 19, cy + cupHeight / 2 - 24);
        ctx.quadraticCurveTo(cx - cupWidth / 2 + 23, cy + cupHeight / 2 - 11, cx, cy + cupHeight / 2 - 11);
        ctx.quadraticCurveTo(cx + cupWidth / 2 - 23, cy + cupHeight / 2 - 11, cx + cupWidth / 2 - 19, cy + cupHeight / 2 - 24);
        ctx.lineTo(cx + cupWidth / 2 - 17, cy - cupHeight / 2 + 6);
        ctx.closePath();
        ctx.clip();

        // Liquid body gradient (Espresso core)
        const liquidGrad = ctx.createLinearGradient(0, liquidY, 0, cy + cupHeight / 2);
        liquidGrad.addColorStop(0, "#e07d38"); // crema
        liquidGrad.addColorStop(0.15, "#6b3710"); // rich amber
        liquidGrad.addColorStop(0.4, "#301804"); // espresso
        liquidGrad.addColorStop(1, "#140700"); // dark roast bottom

        ctx.fillStyle = liquidGrad;
        ctx.beginPath();
        ctx.rect(cx - cupWidth, liquidY, cupWidth * 2, cupHeight + 30);
        ctx.fill();

        // Latte art on top surface!
        drawLatteArt(cx, liquidY, cupWidth / 2 - 11 + (fillPercent * 5), 7);

        // Highlight sheen gloss on liquid surface
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.ellipse(cx - 18, liquidY - 1, cupWidth / 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Glass specular reflection highlights (making it look like a real gloss mug)
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.ellipse(cx - cupWidth / 2 + 12, cy - 20, 6, cupHeight / 2.5, 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.ellipse(cx + cupWidth / 2 - 12, cy - 10, 3, cupHeight / 3, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // 5. Steam Particles
      if (Math.random() < 0.12 && currentProgress > 0.45) {
        steamParticles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy - cupHeight / 2 - 15,
          size: 7 + Math.random() * 12,
          speedY: 0.5 + Math.random() * 0.7,
          opacity: 0.22 + Math.random() * 0.28,
          age: 0,
          maxAge: 90 + Math.random() * 60,
        });
      }

      ctx.fillStyle = darkTheme ? "rgba(255, 245, 235, 0.12)" : "rgba(100, 80, 70, 0.07)";
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.age++;
        p.y -= p.speedY;
        p.x += Math.sin(p.age / 12) * 0.6; // elegant swaying
        const lifeRatio = p.age / p.maxAge;
        const currentOpacity = p.opacity * (1 - lifeRatio);

        ctx.save();
        ctx.globalAlpha = currentOpacity * cupOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + lifeRatio * 1.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.age >= p.maxAge) {
          steamParticles.splice(i, 1);
        }
      }

      // 6. Splashing droplets on high progress
      for (let i = splashParticles.length - 1; i >= 0; i--) {
        const p = splashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.grav;
        p.alpha -= 0.013;

        if (p.alpha <= 0) {
          splashParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * cupOpacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        const angle = Math.atan2(p.vy, p.vx);
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const stretch = Math.min(2.4, 1 + speed * 0.11);
        ctx.ellipse(p.x, p.y, p.radius * stretch, p.radius, angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Render Orbing / Floating Coffee Beans (With inertia based on scroll)
      beans.forEach((b) => {
        // dynamic offset based on scroll progress (making them float elegantly down/up and rotate)
        const scrollOffsetScaleX = b.speedX * currentProgress;
        const scrollOffsetScaleY = b.speedY * currentProgress;
        const x = cx + b.baseX + scrollOffsetScaleX;
        const y = cy + b.baseY + scrollOffsetScaleY;
        const currentAngle = b.angle + (currentProgress * b.rotateSpeed);
        // fade bean slightly if not scrolled in yet
        ctx.save();
        ctx.globalAlpha = cupOpacity;
        drawCoffeeBean(x, y, b.size, currentAngle);
        ctx.restore();
      });

      // 8. Render Floating Translucent Ice Cubes (With inertia based on scroll)
      iceCubes.forEach((cube) => {
        const scrollOffsetScaleX = cube.speedX * currentProgress;
        const scrollOffsetScaleY = cube.speedY * currentProgress;
        const x = cx + cube.baseX + scrollOffsetScaleX;
        const y = cy + cube.baseY + scrollOffsetScaleY;
        const currentAngle = cube.angle + (currentProgress * cube.rotateSpeed);
        ctx.save();
        ctx.globalAlpha = cupOpacity * 0.9;
        drawIceCube(x, y, cube.size, currentAngle);
        ctx.restore();
      });

      // 9. Interactive Glowing neon ring around the cup rim
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = (0.15 * Math.sin(Date.now() / 250) + 0.2) * cupOpacity;
      ctx.beginPath();
      ctx.ellipse(cx, cy - cupHeight / 2 - 12, cupWidth / 2 + 12, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

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
    <div id="cup-viewport-luxury" className="relative w-full h-[400px] md:h-[520px] flex items-center justify-center select-none z-10">
      <canvas
        ref={canvasRef}
        id="luxury-canvas"
        className="w-full h-full max-w-[550px]"
        style={{ display: "block" }}
      />
    </div>
  );
}
