import { useEffect, useRef, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coffee, 
  Shield, 
  ChevronDown, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Check, 
  Award,
  Sparkles,
  HelpCircle
} from "lucide-react";
import Lenis from "lenis";
import CoffeeCanister from "./components/CoffeeCanister";
import OxidizationChart from "./components/OxidizationChart";
import CoffeeCupSplash from "./components/CoffeeCupSplash";

// Roast Profiles Data for the active accent configurations
interface RoastProfile {
  id: string;
  name: string;
  sub: string;
  accent: string;
  notes: string[];
  altitude: string;
  origin: string;
  description: string;
  intensity: number;
}

const ROAST_PROFILES: RoastProfile[] = [
  {
    id: "sombra",
    name: "Sombra Obsidian",
    sub: "COCOA FRAGRANT • BLACKBERRY • OAK SMOKE",
    accent: "#ff5500", // Bright Neon Orange
    notes: ["Dark Cocoa", "Smoked Toffee", "Blackberry Jam"],
    altitude: "1,950m",
    origin: "Huehuetenango, Guatemala",
    description: "A bold, dark-fired single-origin roast. Its high concentration of volatile oils demands advanced atmospheric control. Volatiles oxidize rapidly in normal conditions, but remain perfectly bound under Brim's pressure sealing.",
    intensity: 9
  },
  {
    id: "solar",
    name: "Solar Aurora",
    sub: "JASMINE SHIELD • HONEYED LIME • PEACH",
    accent: "#00e5ff", // Bright Neon Cyan
    notes: ["White Jasmine", "Clover Honey", "Meyer Lime"],
    altitude: "2,100m",
    origin: "Sidama, Ethiopia",
    description: "An ultra-delicate light roast with crisp floral and citrus notes. These highly fragile flavor esters are the first to evaporate. Brim's physical vacuum lock prevents gas exchange, locking in the nectar-like sweetness.",
    intensity: 5
  },
  {
    id: "lunar",
    name: "Lunar Eclipse",
    sub: "BLOOD ORANGE • CARAMEL VORTEX • VELVET",
    accent: "#ff00aa", // Bright Neon Magenta
    notes: ["Blood Orange", "Toasted Caramel", "Cacao Nib"],
    altitude: "1,800m",
    origin: "Tarrazú, Costa Rica",
    description: "A balanced medium roast with complex sweetness and subtle fruit acidity. Volatile chocolate-caramel ketones undergo structural collapse if exposed to moisture. The Brim canister's titanium wall completely repels humidity.",
    intensity: 7
  }
];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeRoast, setActiveRoast] = useState<RoastProfile>(ROAST_PROFILES[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [exposureDays, setExposureDays] = useState(15);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [timeString, setTimeString] = useState("");

  // Initialize Lenis Smooth Scroll for top-tier, silky kinetic feedback
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-style exponential ease-out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Track scroll position of the overall page from 0 to 1
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Keep live UTC clock ticking
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hrs = String(d.getUTCHours()).padStart(2, "0");
      const mins = String(d.getUTCMinutes()).padStart(2, "0");
      const secs = String(d.getUTCSeconds()).padStart(2, "0");
      setTimeString(`${hrs}:${mins}:${secs} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manage body theme class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Flavor degradation formulas based on interactive slider
  const flavorStd = Math.max(4, Math.round(100 * Math.pow(0.86, exposureDays)));
  const flavorBrim = Math.max(78, Math.round(100 * Math.pow(0.996, exposureDays)));

  const getTastingVerdict = (days: number, isBrim: boolean) => {
    if (isBrim) {
      if (days < 10) return { title: "Pristine Extraction", desc: "Complex floral bouquets, highly defined acidity, full volatile oils." };
      if (days < 45) return { title: "Peak Roast State", desc: "Esters fully stable. Complete structural sweetness. Rich crema potential." };
      return { title: "Excellent Integrity", desc: "No staleness. Extremely clean profile. Aromatic volatiles intact." };
    } else {
      if (days < 5) return { title: "Initial Gassing", desc: "Acceptable quality. Carbon dioxide degassing underway." };
      if (days < 14) return { title: "Oxidized Decay", desc: "Aromatics fading. Acidity begins to turn sour and flat." };
      if (days < 30) return { title: "Stale / Woody", desc: "Volatile esters fully lost. Woody cellulose, rancid oils present." };
      return { title: "Dead Carbon", desc: "No scent remaining. Cardboard extraction, heavy bitterness, flat mouthfeel." };
    }
  };

  const brimVerdict = getTastingVerdict(exposureDays, true);
  const stdVerdict = getTastingVerdict(exposureDays, false);

  const handleOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setEmail("");
      }, 5000);
    }
  };

  // Gorgeous background warm colors matching attachment
  const bgGradient = isDark 
    ? "bg-gradient-to-b from-[#0c0502] via-[#170a04] to-[#050201] text-neutral-100" 
    : "bg-gradient-to-b from-[#fbf8f5] via-[#f2e7dd] to-[#e4d6ca] text-neutral-900";

  return (
    <div 
      id="main-wrapper" 
      className={`theme-transition min-h-screen relative overflow-hidden ${bgGradient} selection:bg-neutral-800 selection:text-white`}
    >
      {/* Global Border Frame */}
      <div className="fixed inset-0 border-[1px] border-neutral-300/10 dark:border-white/5 pointer-events-none z-50" />
      
      {/* 1. Sticky Navigation */}
      <nav id="navbar" className="fixed top-0 left-0 w-full z-40 border-b border-neutral-200/5 dark:border-white/5 bg-neutral-100/10 dark:bg-black/10 backdrop-blur-xl px-6 md:px-12 py-5 flex justify-between items-center transition-all duration-500">
        
        {/* Logo and Chrono Sys */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden group border transition-colors duration-500" 
              style={{ borderColor: activeRoast.accent }}
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundColor: activeRoast.accent }} />
              <span className="font-display font-bold text-base tracking-tighter text-neutral-900 dark:text-white">B</span>
            </div>
            <div>
              <span className="text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-900 dark:text-white block">BRIM®</span>
              <span className="text-[7px] font-mono opacity-50 uppercase block tracking-widest text-neutral-500 dark:text-neutral-400">KŌHI SYSTEMS</span>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-200/10 dark:bg-white/10 hidden sm:block" />

          {/* UTC Clock */}
          <div className="hidden sm:flex flex-col font-mono text-[9px] text-neutral-400 tracking-wider">
            <span className="text-neutral-900 dark:text-white font-medium tabular-nums">{timeString || "00:00:00 UTC"}</span>
            <span className="opacity-40">STABLE CHRONO SYS</span>
          </div>
        </div>

        {/* Navigation links for exactly 4 sections */}
        <div className="hidden lg:flex items-center gap-10 text-[9px] font-mono tracking-[0.25em] text-neutral-400">
          <a href="#hero" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 relative group py-1">
            EXPLORE
            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: activeRoast.accent }} />
          </a>
          <a href="#engineering" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 relative group py-1">
            ENGINEERING
            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: activeRoast.accent }} />
          </a>
          <a href="#fresher" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 relative group py-1">
            SCIENCE
            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: activeRoast.accent }} />
          </a>
          <a href="#preorder" className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 relative group py-1">
            RESERVE
            <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: activeRoast.accent }} />
          </a>
        </div>

        {/* Dynamic active roast & theme switches */}
        <div className="flex items-center gap-4">
          
          {/* Luxurious Roast Selection Dropdown / Selector inside Navbar */}
          <div className="hidden sm:flex items-center bg-neutral-200/40 dark:bg-white/5 border border-neutral-300/10 dark:border-white/5 p-1 rounded-full text-[8px] font-mono">
            {ROAST_PROFILES.map((roast) => {
              const isSelected = activeRoast.id === roast.id;
              return (
                <button
                  key={roast.id}
                  onClick={() => setActiveRoast(roast)}
                  className={`px-3 py-1.5 rounded-full tracking-widest transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "bg-neutral-800 dark:bg-white text-white dark:text-black font-bold shadow-sm" 
                      : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {roast.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Quick theme control capsule */}
          <div className="flex items-center bg-neutral-200/40 dark:bg-white/5 border border-neutral-300/10 dark:border-white/5 p-1 rounded-full">
            <button
              onClick={() => setIsDark(false)}
              className={`px-2.5 py-1 rounded-full text-[8px] font-mono tracking-widest transition-all duration-300 cursor-pointer ${!isDark ? "bg-white text-black shadow-sm font-bold" : "text-neutral-400 hover:text-neutral-900"}`}
            >
              LIGHT
            </button>
            <button
              onClick={() => setIsDark(true)}
              className={`px-2.5 py-1 rounded-full text-[8px] font-mono tracking-widest transition-all duration-300 cursor-pointer ${isDark ? "bg-neutral-800 text-white shadow-sm font-bold" : "text-neutral-400 hover:text-white"}`}
            >
              DARK
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Fixed Product Canvas Backdrop - Scrub-Scrolls with page scroll */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center lg:justify-end lg:pr-[8%] xl:pr-[10%] select-none">
        
        {/* Canister revealing on first 30% scroll */}
        {scrollProgress < 0.32 && (
          <motion.div
            style={{
              opacity: scrollProgress < 0.20 ? 1 : Math.max(0, 1 - (scrollProgress - 0.20) * 8),
              scale: scrollProgress < 0.20 ? 1.05 : 1.05 - (scrollProgress - 0.20) * 0.5,
              y: scrollProgress < 0.20 ? 0 : -50 * (scrollProgress - 0.20),
            }}
            className="w-full max-w-lg flex items-center justify-center"
          >
            <CoffeeCanister
              scrollProgress={scrollProgress * 3.3} // Full opening cycle mapped to first part of scroll
              isDark={isDark}
              activeRoastColor={activeRoast.accent}
              activeRoastName={activeRoast.name}
            />
          </motion.div>
        )}

        {/* Coffee cup, floating beans, ice cubes and splash emerging from 18% scroll down to footer */}
        {scrollProgress >= 0.18 && (
          <motion.div
            style={{
              opacity: scrollProgress < 0.28 
                ? Math.min(1, (scrollProgress - 0.18) * 10) 
                : 1,
              scale: scrollProgress < 0.28 
                ? 0.75 + (scrollProgress - 0.18) * 1.8 
                : 1,
              y: scrollProgress < 0.28 ? 60 * (0.28 - scrollProgress) : 0,
            }}
            className="w-full max-w-xl flex items-center justify-center"
          >
            <CoffeeCupSplash
              scrollProgress={scrollProgress}
              isDark={isDark}
              accentColor={activeRoast.accent}
            />
          </motion.div>
        )}
      </div>

      {/* 3. The 4 Sections of the website */}

      {/* SECTION 1: HERO INTRO (Exploring the Canister Opening) */}
      <section 
        id="hero" 
        className="min-h-screen pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center relative z-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
          
          {/* Left Editorial Content (Exactly structured like attachment) */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 md:space-y-8 text-left">
            <div>
              <span className="text-[10px] font-mono tracking-[0.45em] text-neutral-400 block uppercase">
                Apex Extraction & Sealing Vessel
              </span>
              
              {/* Massive Award-Winning Serif Display Heading from attachment style */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-neutral-900 dark:text-white mt-3 leading-[1.05] uppercase">
                Luxing <br />
                <span className="font-sans font-light tracking-tighter text-neutral-400 dark:text-neutral-500 italic">Connecting</span>
              </h1>
              
              <div className="w-16 h-[2px] mt-6" style={{ backgroundColor: activeRoast.accent }} />
            </div>

            <p className="text-sm font-light text-neutral-500 dark:text-neutral-300 max-w-lg leading-relaxed font-sans">
              How art meets thermodynamics. Scroll down to unlock the titanium canister, watch it open, and pour into our premium insulated double-wall glass. Experience coffee at absolute stasis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#preorder"
                className="px-8 py-4 rounded-full text-xs font-mono tracking-widest text-white transition-all duration-300 font-semibold text-center hover:-translate-y-0.5 cursor-pointer shadow-lg relative group overflow-hidden"
                style={{ backgroundColor: activeRoast.accent }}
              >
                <span className="relative z-10 uppercase">Order Online</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              <a
                href="#engineering"
                className="px-8 py-4 rounded-full text-xs font-mono tracking-widest border border-neutral-400/20 hover:border-neutral-400/40 transition-all duration-300 text-center hover:-translate-y-0.5 cursor-pointer"
              >
                VIEW DETAILS
              </a>
            </div>

            {/* Scroll indicator overlay */}
            <div className="flex items-center gap-3 pt-8 animate-bounce">
              <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
                DRAG SCROLL TO UNLOCK GASKET
              </span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Right Column is transparent to reveal the beautifully fixed titanium canister canvas on the right */}
          <div className="lg:col-span-6 h-[400px] lg:h-full pointer-events-none" />

        </div>
      </section>

      {/* SECTION 2: MOLECULAR ENGINEERING (Material Science Bento Grid) */}
      <section 
        id="engineering" 
        className="min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-20 flex flex-col justify-center"
      >
        <div className="text-left max-w-3xl mb-16 space-y-3">
          <span className="text-[10px] font-mono tracking-[0.5em] text-neutral-400 uppercase block">
            Molecular Protection
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-neutral-900 dark:text-white uppercase">
            Designed to Arrest Staleness
          </h2>
          <div className="w-12 h-0.5" style={{ backgroundColor: activeRoast.accent }} />
        </div>

        {/* Bento Grid layout wrapping around the central floating cup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Interactive Oxidization Chart */}
          <div className="lg:col-span-7 flex flex-col h-full justify-between">
            <OxidizationChart accentColor={activeRoast.accent} />
          </div>

          {/* Card 2: Titanium Material Card */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 p-8 backdrop-blur-md flex flex-col justify-between overflow-hidden relative group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/40 dark:bg-white/5 flex items-center justify-center border border-neutral-300/10 dark:border-white/10">
                <Layers className="w-5 h-5" style={{ color: activeRoast.accent }} />
              </div>
              <h3 className="text-lg font-display font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
                Grade 5 Titanium Body
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans font-light">
                Aerospace-grade titanium is chemically inert, meaning it never leaches flavors or metallic odors. Our proprietary micro-beaded finish completely blocks 100% of electromagnetic radiation, shielding sensitive roasted beans from light-induced fatty acid rancidity.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200/10 dark:border-white/5 flex justify-between items-center text-xs font-mono text-neutral-400 relative z-10">
              <span>WEIGHT: <span className="text-neutral-900 dark:text-white font-medium">280G</span></span>
              <span>INERTNESS RANK: <span className="text-emerald-500 dark:text-emerald-400 font-semibold">ULTRA-CLASS AA</span></span>
            </div>
          </div>

          {/* Card 3: Clasp Design & Sealing Force */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 p-8 backdrop-blur-md flex flex-col justify-between overflow-hidden relative group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/40 dark:bg-white/5 flex items-center justify-center border border-neutral-300/10 dark:border-white/10">
                <Shield className="w-5 h-5" style={{ color: activeRoast.accent }} />
              </div>
              <h3 className="text-lg font-display font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
                Mechanical Tension Clasp
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans font-light">
                A highly calibrated cantilevered lock compresses the fluoroelastomer gasket symmetrically. Rather than rely on friction or threads (which degrade over time), Brim guarantees constant pressure sealing that never slides, slips, or lets external gases leak in.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200/10 dark:border-white/5 flex justify-between items-center text-xs font-mono text-neutral-400 relative z-10">
              <span>LOCK LIFE: <span className="text-neutral-900 dark:text-white font-medium">&gt; 10,000 CLICKS</span></span>
              <span>PRESSURE RATIO: <span className="text-neutral-900 dark:text-white font-medium">1.6 ATM</span></span>
            </div>
          </div>

          {/* Card 4: Double Wall Thermal Vacuum Insulation */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 p-8 backdrop-blur-md flex flex-col justify-between overflow-hidden relative group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center relative z-10 h-full">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-200/40 dark:bg-white/5 flex items-center justify-center border border-neutral-300/10 dark:border-white/10">
                  <Cpu className="w-5 h-5" style={{ color: activeRoast.accent }} />
                </div>
                <h3 className="text-lg font-display font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
                  Thermo-Shield Vacuum
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans font-light">
                  The vacuum gap between the inner and outer titanium walls completely stops kinetic heat transfer, keeping internal coffee bean temperatures perfectly stable and preventing roasting oil sweating.
                </p>
              </div>

              {/* Data metric overlay visual */}
              <div className="border border-neutral-200/10 dark:border-white/5 rounded-xl bg-neutral-100/50 dark:bg-black/40 p-5 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-[10px]">HEAT TRANSFER</span>
                  <span className="text-emerald-500 dark:text-emerald-400">0.02 W/m²K</span>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 text-[9px] block">EXTERNAL FLUCTUATION (20°C to 45°C)</span>
                  <div className="w-full bg-neutral-200/60 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 dark:bg-emerald-400 w-[4%]" />
                  </div>
                  <span className="text-[9px] text-emerald-500 dark:text-emerald-400">INTERNAL DRIFT: &lt; 0.4°C OVER 24H</span>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 text-[9px] block">STANDARD BAG THERMAL CONDUCTIVITY</span>
                  <div className="w-full bg-neutral-200/60 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[85%]" />
                  </div>
                  <span className="text-[9px] text-rose-500">THERMAL COLLAPSE INDUCED</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: COMPOUND DEGRADE SCIENCE (Interactive Decay Simulator) */}
      <section 
        id="fresher" 
        className="min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-20 flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Calculator Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.45em] text-neutral-400 uppercase block">
                Staleness Estimator
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-neutral-900 dark:text-white uppercase mt-2">
                Compound Degrade Calculator
              </h2>
              <div className="w-12 h-0.5 mt-3" style={{ backgroundColor: activeRoast.accent }} />
              <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-4 leading-relaxed font-sans font-light">
                Drag the timeline slider to simulate volatile gas exposure and see how standard paper bag storage compares to Brim double-walled preservation over time.
              </p>
            </div>

            {/* Slider Container */}
            <div className="bg-neutral-100/60 dark:bg-black/30 border border-neutral-200/10 dark:border-white/5 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-400">BEAN EXPOSURE TIME</span>
                <span className="text-lg font-display font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {exposureDays} {exposureDays === 1 ? "Day" : "Days"} Since Opening
                </span>
              </div>

              {/* Range Input slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={exposureDays}
                  onChange={(e) => setExposureDays(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: activeRoast.accent }}
                />
                <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                  <span>DAY 1 (FRESH ROAST)</span>
                  <span>DAY 30</span>
                  <span>DAY 60</span>
                  <span>DAY 90 (EXTREME)</span>
                </div>
              </div>

              {/* Slider quick select buttons */}
              <div className="flex gap-2">
                {[1, 15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setExposureDays(d)}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-[9px] border transition-all duration-300 cursor-pointer ${
                      exposureDays === d 
                        ? "bg-neutral-800 dark:bg-white text-white dark:text-black border-transparent font-bold" 
                        : "border-neutral-200/20 dark:border-white/5 hover:border-neutral-400 text-neutral-400"
                    }`}
                  >
                    DAY {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Dual Dial readout */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Standard Bag Readout */}
            <div className="rounded-2xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 p-6 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-200/10 dark:border-white/5">
                <span className="font-mono text-[10px] text-neutral-400 uppercase">STANDARD FUSED BAG</span>
                <span className="font-mono text-xs text-rose-500 font-semibold uppercase">RAPID DECAY</span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-neutral-400 block">VOLATILE COMPOUNDS RETAINED</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-display font-semibold text-rose-500 tabular-nums">
                    {flavorStd}%
                  </span>
                  <span className="text-xs font-mono text-neutral-400">Original Profile</span>
                </div>
              </div>

              {/* Tasting Verdict */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-1">
                <h4 className="text-xs font-mono text-rose-500 dark:text-rose-400 uppercase font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {stdVerdict.title}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal font-light">
                  {stdVerdict.desc}
                </p>
              </div>
            </div>

            {/* Brim Canister Readout */}
            <div className="rounded-2xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl backdrop-blur-md">
              <div 
                className="absolute -top-12 -right-12 w-[100px] h-[100px] rounded-full filter blur-[50px] opacity-10"
                style={{ backgroundColor: activeRoast.accent }}
              />

              <div className="flex justify-between items-center pb-4 border-b border-neutral-200/10 dark:border-white/5">
                <span className="font-mono text-[10px] text-neutral-400 uppercase">BRIM VACUUM SEAL</span>
                <span className="font-mono text-xs font-semibold uppercase" style={{ color: activeRoast.accent }}>ISOLATED</span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-neutral-400 block">VOLATILE COMPOUNDS RETAINED</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-display font-semibold tabular-nums animate-pulse" style={{ color: activeRoast.accent }}>
                    {flavorBrim}%
                  </span>
                  <span className="text-xs font-mono text-neutral-400">Original Profile</span>
                </div>
              </div>

              {/* Tasting Verdict */}
              <div className="border rounded-xl p-4 space-y-1" style={{ backgroundColor: `${activeRoast.accent}03`, borderColor: `${activeRoast.accent}15` }}>
                <h4 className="text-xs font-mono uppercase font-semibold flex items-center gap-1.5" style={{ color: activeRoast.accent }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeRoast.accent }} />
                  {brimVerdict.title}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal font-light">
                  {brimVerdict.desc}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: WAITING LIST & FOOTER (SplashLands on Footer Climax!) */}
      <section 
        id="preorder" 
        className="min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-between relative z-20"
      >
        {/* Waitlist priority Card */}
        <div className="relative rounded-3xl border border-neutral-200/10 dark:border-white/5 bg-white/35 dark:bg-black/35 overflow-hidden backdrop-blur-md p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto shadow-xl my-auto">
          
          <div 
            className="absolute inset-0 m-auto w-[350px] h-[350px] rounded-full filter blur-[120px] opacity-15"
            style={{ backgroundColor: activeRoast.accent }}
          />

          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-[10px] font-mono tracking-[0.5em] text-neutral-400 block uppercase">
              SECURE A SHELF RESERVATION
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-neutral-900 dark:text-white uppercase leading-none">
              RESERVE YOUR BRIM VESSEL
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans font-light max-w-lg mx-auto">
              Our titanium canisters are hand-calibrated in limited, serialized batch runs. Join the priority waitlist to secure a vessel and a complimentary selection of <span className="font-semibold text-neutral-900 dark:text-white">{activeRoast.name}</span>.
            </p>
          </div>

          {/* Form */}
          <div className="mt-8 w-full max-w-md relative z-10">
            <AnimatePresence mode="wait">
              {!orderSuccess ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleOrderSubmit}
                  className="flex flex-col sm:flex-row gap-3 w-full"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter email for priority allocation"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow rounded-xl bg-neutral-100/80 dark:bg-black/60 border border-neutral-300/30 dark:border-white/10 px-5 py-3.5 text-sm focus:outline-none focus:border-neutral-500 transition-colors duration-300 placeholder-neutral-400 text-neutral-900 dark:text-white font-sans font-light"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl text-xs font-mono tracking-widest text-white transition-all duration-300 font-bold hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-md hover:brightness-110"
                    style={{ backgroundColor: activeRoast.accent }}
                  >
                    <span>ALLOCATE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-base font-display font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Priority Allocation Secured
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Your allocation code <span className="font-mono text-neutral-900 dark:text-white font-semibold">#BRM-2026-{(Math.random() * 9000 + 1000).toFixed(0)}</span> has been reserved. You will receive configuration access within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-8 text-[9px] font-mono text-neutral-400 relative z-10 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>BATCH 05: OPEN</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeRoast.accent }} />
              <span>42 VESSELS LEFT</span>
            </div>
          </div>

        </div>

        {/* Footer sits beautifully at the bottom of Section 4 */}
        <footer id="footer" className="w-full pt-16 border-t border-neutral-300/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-neutral-400">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-neutral-300/30 dark:border-white/10" style={{ borderColor: activeRoast.accent }}>
              <span className="font-display font-semibold text-xs tracking-tighter text-neutral-900 dark:text-white">B</span>
            </div>
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-neutral-900 dark:text-white uppercase">BRIM COFFEE LABORATORIES</span>
          </div>

          <div className="font-mono text-[9px] text-neutral-400 uppercase text-center md:text-right space-y-1">
            <p>© 2026 BRIM KŌHI LABS INC. ALL RIGHTS RESERVED.</p>
            <p className="text-[8px] text-neutral-500 dark:text-neutral-500">CRAFTED FOR PEAK DEGASTING INTEGRITY // TOKYO • SEATTLE • COPENHAGEN</p>
          </div>

        </footer>
      </section>

    </div>
  );
}
