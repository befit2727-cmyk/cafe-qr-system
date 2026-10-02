import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Move3d, Wind } from "lucide-react";
import { soundService } from "../../utils/sound";

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [burstCount, setBurstCount] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 340;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.0);
    camera.lookAt(0, 0.3, 0);

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.4);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffddb0, 2.8);
    mainKeyLight.position.set(4, 7, 5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.bias = -0.001;
    scene.add(mainKeyLight);

    const warmFillLight = new THREE.PointLight(0xff7722, 2.4, 10);
    warmFillLight.position.set(-3.5, 3, -2);
    scene.add(warmFillLight);

    const rimLight = new THREE.PointLight(0xffaa44, 2.0, 8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. Central Showcase Group (Cup, Plate, Spices)
    const showcaseGroup = new THREE.Group();
    scene.add(showcaseGroup);

    // 4a. Circular Cafe Wooden Tabletop Plinth
    const plinthGeo = new THREE.CylinderGeometry(2.0, 2.1, 0.18, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x24160f,
      roughness: 0.6,
      metalness: 0.1
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.15;
    plinth.receiveShadow = true;
    showcaseGroup.add(plinth);

    // Golden brass rim ring on plinth
    const brassRingGeo = new THREE.TorusGeometry(2.02, 0.03, 16, 64);
    brassRingGeo.rotateX(Math.PI / 2);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25
    });
    const brassRing = new THREE.Mesh(brassRingGeo, brassMat);
    brassRing.position.y = -0.07;
    showcaseGroup.add(brassRing);

    // 4b. Terracotta Earthen Kulhad (Authentic lathe contour)
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.68, 0.05)); // base
    points.push(new THREE.Vector2(0.74, 0.35));
    points.push(new THREE.Vector2(0.88, 0.9));
    points.push(new THREE.Vector2(1.02, 1.45)); // rim flare
    points.push(new THREE.Vector2(1.05, 1.62));
    points.push(new THREE.Vector2(0.97, 1.65));
    points.push(new THREE.Vector2(0.92, 1.52));
    points.push(new THREE.Vector2(0.82, 0.8));
    points.push(new THREE.Vector2(0.68, 0.25));
    points.push(new THREE.Vector2(0, 0.18)); // inner depth

    const kulhadGeo = new THREE.LatheGeometry(points, 36);
    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xc85d34, // Desi earthen clay
      roughness: 0.88,
      metalness: 0.04
    });
    const kulhad = new THREE.Mesh(kulhadGeo, terracottaMat);
    kulhad.castShadow = true;
    kulhad.receiveShadow = true;
    showcaseGroup.add(kulhad);

    // Earthen Grooved Accent Rings
    for (let r = 0; r < 2; r++) {
      const ringY = 0.65 + r * 0.45;
      const ringG = new THREE.TorusGeometry(0.82 + r * 0.12, 0.02, 12, 36);
      ringG.rotateX(Math.PI / 2);
      const ringM = new THREE.Mesh(ringG, new THREE.MeshStandardMaterial({ color: 0x9e4320, roughness: 0.9 }));
      ringM.position.y = ringY;
      showcaseGroup.add(ringM);
    }

    // 4c. Golden Kadak Chai Liquid Surface with Froth
    const chaiGeo = new THREE.CylinderGeometry(0.91, 0.91, 0.04, 36);
    const chaiMat = new THREE.MeshStandardMaterial({
      color: 0xd8823b, // Kadak Assam Chai with buffalo milk
      roughness: 0.22,
      metalness: 0.12
    });
    const chaiLiquid = new THREE.Mesh(chaiGeo, chaiMat);
    chaiLiquid.position.y = 1.42;
    showcaseGroup.add(chaiLiquid);

    // Cardamom specks on chai surface
    const speckGeo = new THREE.CircleGeometry(0.04, 8);
    speckGeo.rotateX(-Math.PI / 2);
    const speckMat = new THREE.MeshBasicMaterial({ color: 0x4a2408 });
    for (let s = 0; s < 6; s++) {
      const sp = new THREE.Mesh(speckGeo, speckMat);
      const r = Math.random() * 0.55;
      const th = Math.random() * Math.PI * 2;
      sp.position.set(Math.cos(th) * r, 1.442, Math.sin(th) * r);
      showcaseGroup.add(sp);
    }

    // 4d. Terracotta Saucer
    const saucerGeo = new THREE.CylinderGeometry(1.65, 1.25, 0.12, 36);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0xa84620,
      roughness: 0.9
    });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -0.04;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    showcaseGroup.add(saucer);

    // 5. Rising Soft Steam Particle System
    const particleCount = 65;
    const steamGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number; age: number; life: number; baseSpeed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.45;
      positions[i * 3 + 1] = 1.45 + Math.random() * 1.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;

      velocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: 0.016 + Math.random() * 0.012,
        z: (Math.random() - 0.5) * 0.006,
        age: Math.random() * 70,
        life: 65 + Math.random() * 45,
        baseSpeed: 0.016 + Math.random() * 0.012
      });
    }
    steamGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Custom Canvas Texture for Ultra-Soft Fluffy Smoke
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,255,255,0.75)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.35)");
      grad.addColorStop(0.7, "rgba(255,255,255,0.1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const steamTexture = new THREE.CanvasTexture(canvas);

    const steamMat = new THREE.PointsMaterial({
      size: 0.55,
      map: steamTexture,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    scene.add(steamPoints);

    // 6. Floating Orbiting Cafe Ingredients (Coffee Beans, Cardamom Pods, Cinnamon Quill)
    const spicesGroup = new THREE.Group();
    scene.add(spicesGroup);

    interface OrbitItem {
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      angle: number;
      yBase: number;
      rotSpeedX: number;
      rotSpeedY: number;
    }
    const orbitItems: OrbitItem[] = [];

    // 6a. Roasted Coffee Beans (3 beans)
    const beanGeo = new THREE.SphereGeometry(0.18, 14, 10);
    beanGeo.scale(1.4, 0.85, 1.05);
    const beanMat = new THREE.MeshStandardMaterial({ color: 0x361c10, roughness: 0.45, metalness: 0.1 });

    for (let i = 0; i < 3; i++) {
      const bean = new THREE.Mesh(beanGeo, beanMat);
      bean.castShadow = true;
      spicesGroup.add(bean);
      orbitItems.push({
        mesh: bean,
        radius: 1.8 + i * 0.35,
        speed: 0.008 + i * 0.003,
        angle: (i / 3) * Math.PI * 2,
        yBase: 0.6 + i * 0.4,
        rotSpeedX: 0.02,
        rotSpeedY: 0.025
      });
    }

    // 6b. Green Elaichi / Cardamom Pods (2 pods)
    const elaichiGeo = new THREE.ConeGeometry(0.12, 0.32, 8);
    elaichiGeo.scale(1, 1, 0.7);
    const elaichiMat = new THREE.MeshStandardMaterial({ color: 0x5a8a25, roughness: 0.6 });

    for (let j = 0; j < 2; j++) {
      const elaichi = new THREE.Mesh(elaichiGeo, elaichiMat);
      elaichi.castShadow = true;
      spicesGroup.add(elaichi);
      orbitItems.push({
        mesh: elaichi,
        radius: 2.1 + j * 0.4,
        speed: -0.009 - j * 0.002,
        angle: (j / 2) * Math.PI * 2 + Math.PI / 4,
        yBase: 0.8 + j * 0.5,
        rotSpeedX: 0.015,
        rotSpeedY: 0.03
      });
    }

    // 6c. Dalchini / Cinnamon Stick Quill
    const cinnamonGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12, 1, true);
    const cinnamonMat = new THREE.MeshStandardMaterial({ color: 0x6e3717, roughness: 0.85, side: THREE.DoubleSide });
    const cinnamon = new THREE.Mesh(cinnamonGeo, cinnamonMat);
    cinnamon.castShadow = true;
    cinnamon.rotation.z = Math.PI / 4;
    spicesGroup.add(cinnamon);
    orbitItems.push({
      mesh: cinnamon,
      radius: 2.3,
      speed: 0.006,
      angle: Math.PI,
      yBase: 1.2,
      rotSpeedX: 0.01,
      rotSpeedY: 0.015
    });

    // 7. Interactive Drag & Touch Orbit Controls
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      prevX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - prevX;
      targetRotY += delta * 0.015;
      prevX = clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Aroma Puff Burst on Click / Tap
    const triggerAromaPuff = () => {
      soundService.playSuccessChime();
      setBurstCount((c) => c + 1);

      // Accelerate steam particles instantly
      const posAttr = steamGeo.getAttribute("position") as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        velocities[i].y = velocities[i].baseSpeed * 3.5;
        if (Math.random() > 0.5) {
          posArr[i * 3] = (Math.random() - 0.5) * 0.3;
          posArr[i * 3 + 1] = 1.45;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
          velocities[i].age = 0;
        }
      }
      posAttr.needsUpdate = true;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    dom.addEventListener("click", triggerAromaPuff);

    // 8. 60 FPS Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth spin
      if (!isDragging) {
        targetRotY += 0.005;
      }
      showcaseGroup.rotation.y += (targetRotY - showcaseGroup.rotation.y) * 0.08;

      // Gentle breathing float
      showcaseGroup.position.y = Math.sin(elapsed * 1.6) * 0.05;

      // Update steam particles
      const posAttr = steamGeo.getAttribute("position") as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const v = velocities[i];
        v.age += 1;

        // Restore normal speed gradually
        if (v.y > v.baseSpeed) {
          v.y -= 0.001;
        }

        posArr[i * 3 + 1] += v.y;
        posArr[i * 3] += v.x + Math.sin(elapsed * 2.2 + i) * 0.003;
        posArr[i * 3 + 2] += v.z + Math.cos(elapsed * 2.2 + i) * 0.003;

        if (v.age > v.life) {
          v.age = 0;
          posArr[i * 3] = (Math.random() - 0.5) * 0.45;
          posArr[i * 3 + 1] = 1.45;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
        }
      }
      posAttr.needsUpdate = true;

      // Orbit & rotate spices
      orbitItems.forEach((item) => {
        item.angle += item.speed;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.z = Math.sin(item.angle) * item.radius;
        item.mesh.position.y = item.yBase + Math.sin(elapsed * 2 + item.angle) * 0.14;
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
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
      dom.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      dom.removeEventListener("click", triggerAromaPuff);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-72 sm:h-80 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Badge with Aroma Burst prompt */}
      <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center pointer-events-none gap-1">
        <div className="bg-white/10 backdrop-blur-xl text-white border border-white/15 px-3.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-2xl transition-transform hover:scale-105">
          <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Interactive 3D Experience • Tap to Interact</span>
        </div>
        <span className="text-[10px] text-[#86868b]">Drag 360° to rotate in spatial view</span>
      </div>
    </div>
  );
};
