import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MenuItem } from "../../types";
import { useCafe } from "../../context/CafeContext";
import { X, Plus, Minus, Move3d, Clock, Sparkles, Flame, Check, RotateCw, Sun, Moon } from "lucide-react";
import { soundService } from "../../utils/sound";
import { motion } from "motion/react";

interface Dish3DInspectorProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Dish3DInspector: React.FC<Dish3DInspectorProps> = ({ item, isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config, addToCart } = useCafe();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(item?.sizes?.[0]?.name);
  const [selectedSugar, setSelectedSugar] = useState<string | undefined>(item?.sugarLevels?.[0]);
  const [selectedSpice, setSelectedSpice] = useState<string | undefined>(item?.spiceLevels?.[0]);
  const [isJainSelected, setIsJainSelected] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<"warm" | "bright">("warm");
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedSize(item.sizes?.[0]?.name);
      setSelectedSugar(item.sugarLevels?.[0]);
      setSelectedSpice(item.spiceLevels?.[0]);
      setIsJainSelected(false);
    }
  }, [item]);

  const sizeExtra = item?.sizes?.find((s) => s.name === selectedSize)?.extraPrice || 0;
  const unitPrice = (item?.price || 0) + sizeExtra;
  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    if (!isOpen || !item) return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingMode === "warm" ? 0x16100e : 0x1a1c22);

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.0);
    camera.lookAt(0, 0.2, 0);

    // 2. WebGL Renderer with Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      lightingMode === "warm" ? 0xffecd6 : 0xffffff,
      lightingMode === "warm" ? 1.3 : 1.6
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      lightingMode === "warm" ? 0xffdfb8 : 0xffffff,
      2.6
    );
    keyLight.position.set(3.5, 6, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillPoint = new THREE.PointLight(
      lightingMode === "warm" ? 0xff7722 : 0x60a5fa,
      1.8,
      9
    );
    fillPoint.position.set(-3.5, 2.5, -2);
    scene.add(fillPoint);

    // 4. Model Showcase Group
    const dishGroup = new THREE.Group();
    scene.add(dishGroup);

    // Build procedural 3D model according to category
    const cat = item.category.toLowerCase();
    const itemName = item.name.toLowerCase();

    if (cat.includes("chai") || cat.includes("kaapi") || cat.includes("tea") || itemName.includes("chai")) {
      // ----------------- MODEL 1: STEAMING KULHAD CHAI -----------------
      const points: THREE.Vector2[] = [];
      points.push(new THREE.Vector2(0, 0));
      points.push(new THREE.Vector2(0.66, 0.05));
      points.push(new THREE.Vector2(0.74, 0.35));
      points.push(new THREE.Vector2(0.88, 0.9));
      points.push(new THREE.Vector2(1.0, 1.45));
      points.push(new THREE.Vector2(1.03, 1.6));
      points.push(new THREE.Vector2(0.95, 1.62));
      points.push(new THREE.Vector2(0.9, 1.5));
      points.push(new THREE.Vector2(0.8, 0.8));
      points.push(new THREE.Vector2(0.66, 0.2));
      points.push(new THREE.Vector2(0, 0.16));

      const kulhadGeo = new THREE.LatheGeometry(points, 32);
      const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xba5327, roughness: 0.88 });
      const cup = new THREE.Mesh(kulhadGeo, terracottaMat);
      cup.castShadow = true;
      dishGroup.add(cup);

      // Liquid Chai
      const liquidGeo = new THREE.CylinderGeometry(0.89, 0.89, 0.04, 32);
      const liquidMat = new THREE.MeshStandardMaterial({ color: 0xdf8438, roughness: 0.25, metalness: 0.1 });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = 1.38;
      dishGroup.add(liquid);

      // Saucer
      const saucerGeo = new THREE.CylinderGeometry(1.65, 1.25, 0.12, 32);
      const saucerMat = new THREE.MeshStandardMaterial({ color: 0x8f3c1b, roughness: 0.9 });
      const saucer = new THREE.Mesh(saucerGeo, saucerMat);
      saucer.position.y = -0.05;
      saucer.receiveShadow = true;
      dishGroup.add(saucer);

      // Cinnamon stick on saucer
      const cinnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8);
      const cinnMat = new THREE.MeshStandardMaterial({ color: 0x6e3717, roughness: 0.8 });
      const cinn = new THREE.Mesh(cinnGeo, cinnMat);
      cinn.rotation.set(Math.PI / 2, 0, Math.PI / 3);
      cinn.position.set(0.9, 0.05, 0.6);
      dishGroup.add(cinn);
    } else if (cat.includes("sandwich") || cat.includes("burger") || itemName.includes("sandwich")) {
      // ----------------- MODEL 2: BOMBAY MASALA GRILLED SANDWICH -----------------
      // Diagonal cut triangular toasted sandwich
      const breadShape = new THREE.Shape();
      breadShape.moveTo(-1.2, -1.0);
      breadShape.lineTo(1.2, -1.0);
      breadShape.lineTo(0, 1.2);
      breadShape.closePath();

      const extrudeSettings = { depth: 0.22, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const breadGeo = new THREE.ExtrudeGeometry(breadShape, extrudeSettings);
      breadGeo.rotateX(-Math.PI / 2);

      const breadMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.65 });
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
      const fillingMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 }); // Mint chutney & spiced potato

      // Bottom Toast
      const bBottom = new THREE.Mesh(breadGeo, breadMat);
      bBottom.position.y = 0.05;
      bBottom.castShadow = true;
      dishGroup.add(bBottom);

      // Potato & Mint Chutney Filling Layer
      const filling = new THREE.Mesh(breadGeo, fillingMat);
      filling.position.y = 0.28;
      filling.scale.set(0.95, 1, 0.95);
      dishGroup.add(filling);

      // Cheese Melt
      const cheese = new THREE.Mesh(breadGeo, cheeseMat);
      cheese.position.y = 0.46;
      cheese.scale.set(1.02, 0.6, 1.02);
      dishGroup.add(cheese);

      // Top Toast with Grill Marks
      const bTop = new THREE.Mesh(breadGeo, breadMat);
      bTop.position.y = 0.64;
      bTop.castShadow = true;
      dishGroup.add(bTop);

      // Slate Serving Platter
      const platterGeo = new THREE.CylinderGeometry(2.1, 1.8, 0.12, 32);
      const platterMat = new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.4 });
      const platter = new THREE.Mesh(platterGeo, platterMat);
      platter.position.y = -0.06;
      platter.receiveShadow = true;
      dishGroup.add(platter);
    } else if (cat.includes("chaat") || cat.includes("samosa") || itemName.includes("samosa") || cat.includes("bites")) {
      // ----------------- MODEL 3: CRISP GOLDEN SAMOSAS & CHUTNEY -----------------
      // Banana leaf plate
      const leafGeo = new THREE.CylinderGeometry(2.0, 1.9, 0.06, 32);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d7026, roughness: 0.6 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = -0.03;
      leaf.receiveShadow = true;
      dishGroup.add(leaf);

      // Golden Triangular Samosa 1
      const samosaGeo = new THREE.ConeGeometry(0.75, 1.1, 3);
      const samosaMat = new THREE.MeshStandardMaterial({ color: 0xd4892c, roughness: 0.65 });
      const samosa1 = new THREE.Mesh(samosaGeo, samosaMat);
      samosa1.rotation.set(-0.3, 0.4, 0.2);
      samosa1.position.set(-0.55, 0.48, 0);
      samosa1.castShadow = true;
      dishGroup.add(samosa1);

      // Samosa 2
      const samosa2 = new THREE.Mesh(samosaGeo, samosaMat);
      samosa2.rotation.set(-0.2, -0.6, -0.15);
      samosa2.position.set(0.45, 0.45, -0.2);
      samosa2.castShadow = true;
      dishGroup.add(samosa2);

      // Stainless steel katori of Green Chutney
      const bowlGeo = new THREE.CylinderGeometry(0.45, 0.32, 0.35, 16);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.2 });
      const bowl = new THREE.Mesh(bowlGeo, steelMat);
      bowl.position.set(0.55, 0.18, 0.85);
      bowl.castShadow = true;
      dishGroup.add(bowl);

      const chutneyGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
      const chutneyMat = new THREE.MeshStandardMaterial({ color: 0x1e6f1d, roughness: 0.4 });
      const chutney = new THREE.Mesh(chutneyGeo, chutneyMat);
      chutney.position.set(0.55, 0.33, 0.85);
      dishGroup.add(chutney);
    } else if (cat.includes("maggi") || cat.includes("noodle") || itemName.includes("maggi")) {
      // ----------------- MODEL 4: MASALA MAGGI BOWL WITH FORK -----------------
      // Yellow Cafe Ceramic Bowl
      const bowlGeo = new THREE.CylinderGeometry(1.6, 0.8, 1.1, 28, 1, false);
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.55;
      bowl.castShadow = true;
      dishGroup.add(bowl);

      // Steaming Maggi Noodles
      const noodleGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.25, 24);
      const noodleMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.7 });
      const noodles = new THREE.Mesh(noodleGeo, noodleMat);
      noodles.position.y = 0.95;
      dishGroup.add(noodles);

      // Green peas & spices on top
      const peaGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const peaMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.4 });
      for (let p = 0; p < 8; p++) {
        const pea = new THREE.Mesh(peaGeo, peaMat);
        const r = Math.random() * 0.9;
        const th = Math.random() * Math.PI * 2;
        pea.position.set(Math.cos(th) * r, 1.1, Math.sin(th) * r);
        dishGroup.add(pea);
      }

      // Silver fork resting in bowl
      const forkGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8);
      const forkMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
      const fork = new THREE.Mesh(forkGeo, forkMat);
      fork.rotation.set(0.4, 0, 0.6);
      fork.position.set(0.7, 1.4, 0);
      dishGroup.add(fork);
    } else {
      // ----------------- MODEL 5: SIZZLING BROWNIE / DESSERTS -----------------
      // Scorching Cast Iron Plate
      const ironPlateGeo = new THREE.CylinderGeometry(1.9, 1.6, 0.16, 32);
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x23272a, metalness: 0.75, roughness: 0.35 });
      const ironPlate = new THREE.Mesh(ironPlateGeo, ironMat);
      ironPlate.position.y = 0.05;
      ironPlate.receiveShadow = true;
      dishGroup.add(ironPlate);

      // Wooden Under-plate
      const woodBaseGeo = new THREE.CylinderGeometry(2.1, 2.0, 0.14, 32);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2711, roughness: 0.7 });
      const woodBase = new THREE.Mesh(woodBaseGeo, woodMat);
      woodBase.position.y = -0.08;
      woodBase.receiveShadow = true;
      dishGroup.add(woodBase);

      // Belgian Fudge Brownie
      const brownieGeo = new THREE.BoxGeometry(1.4, 0.65, 1.4);
      const brownieMat = new THREE.MeshStandardMaterial({ color: 0x3d1d14, roughness: 0.85 });
      const brownie = new THREE.Mesh(brownieGeo, brownieMat);
      brownie.position.y = 0.44;
      brownie.castShadow = true;
      dishGroup.add(brownie);

      // Vanilla Ice Cream Scoop
      const scoopGeo = new THREE.SphereGeometry(0.55, 20, 16);
      const scoopMat = new THREE.MeshStandardMaterial({ color: 0xfffaed, roughness: 0.35 });
      const scoop = new THREE.Mesh(scoopGeo, scoopMat);
      scoop.position.set(0, 1.05, 0);
      scoop.castShadow = true;
      dishGroup.add(scoop);

      // Hot Chocolate Ganache Drizzle
      const dripGeo = new THREE.TorusGeometry(0.52, 0.06, 12, 24);
      dripGeo.rotateX(Math.PI / 2);
      const dripMat = new THREE.MeshStandardMaterial({ color: 0x271008, roughness: 0.15 });
      const drip = new THREE.Mesh(dripGeo, dripMat);
      drip.position.set(0, 0.9, 0);
      dishGroup.add(drip);
    }

    // 5. Interactive Drag to Spin Controls
    let isDragging = false;
    let prevX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      dishGroup.rotation.y += dx * 0.015;
      prevX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch Support for Mobile
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      prevX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevX;
      dishGroup.rotation.y += dx * 0.015;
      prevX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 6. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging) {
        dishGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [isOpen, item, autoRotate, lightingMode]);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    addToCart(item, quantity, {
      size: selectedSize,
      sugar: selectedSugar,
      spice: selectedSpice,
      isJain: isJainSelected,
      extraPrice: sizeExtra
    });
    soundService.playSuccessChime();
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-stone-900 text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-600/30 text-amber-400 rounded-lg">
              <Move3d className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">{item.name}</h3>
              <p className="text-[11px] text-stone-400">Interactive 360° 3D Food Model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-stone-950 to-stone-900 flex items-center justify-center">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Quick 3D Controls Overlays */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-1 transition-all ${
                autoRotate ? "bg-amber-600/80 border-amber-500/50 text-white" : "bg-stone-900/70 border-stone-700 text-stone-300"
              }`}
              title="Toggle Auto Spin"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setLightingMode(lightingMode === "warm" ? "bright" : "warm")}
              className="p-2 rounded-xl backdrop-blur-md border bg-stone-900/70 border-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-all"
              title="Toggle Studio Lighting"
            >
              {lightingMode === "warm" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          </div>

          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-700 text-[10px] text-stone-400 pointer-events-none flex items-center gap-1">
            <Move3d className="w-3 h-3 text-amber-400" />
            <span>Drag / Swipe in 360°</span>
          </div>
        </div>

        {/* Customization & Add to Cart Controls */}
        <div className="p-4 space-y-4 overflow-y-auto bg-stone-900">
          
          {/* Item Meta & Badges */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              {item.isVeg ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pure Veg
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg
                </span>
              )}
              {item.prepTimeMinutes && (
                <span className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Clock className="w-3 h-3 text-amber-400" /> {item.prepTimeMinutes} mins
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 line-through mr-1.5 opacity-60">
                {config.currencySymbol}{Math.round(unitPrice * 1.15)}
              </span>
              <span className="text-lg font-black text-amber-400">
                {config.currencySymbol}{unitPrice}
              </span>
            </div>
          </div>

          {/* Sizes / Servings */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Select Size / Portion:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSize(s.name)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                      selectedSize === s.name
                        ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                        : "bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600"
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.extraPrice > 0 && (
                      <span className="text-[10px] opacity-80">+{config.currencySymbol}{s.extraPrice}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugar or Spice Customization */}
          {item.sugarLevels && item.sugarLevels.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Sweetness Level:</label>
              <div className="flex flex-wrap gap-2">
                {item.sugarLevels.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setSelectedSugar(sug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedSugar === sug
                        ? "bg-espresso-800 text-amber-300 border-amber-500/50"
                        : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Row */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-stone-800 p-1 rounded-2xl border border-stone-700">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center font-bold hover:bg-stone-600 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm w-6 text-center text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center font-bold hover:bg-stone-600 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 ${
                addedAnimation
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950"
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-stone-950" />
                  <span>Add to Order • {config.currencySymbol}{totalPrice}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
