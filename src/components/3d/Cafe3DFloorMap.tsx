import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useCafe } from "../../context/CafeContext";
import { Move3d, MapPin, Sparkles, Check, Coffee } from "lucide-react";
import { soundService } from "../../utils/sound";

interface TableMeshUserData {
  tableName: string;
  isOccupied: boolean;
}

export const Cafe3DFloorMap: React.FC = () => {
  const { config, activeTable, setActiveTable, orders } = useCafe();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [selectedTableLocal, setSelectedTableLocal] = useState<string>(activeTable);
  const [tableFilter, setTableFilter] = useState<"all" | "vacant" | "occupied">("all");

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const occupiedTableSet = new Set(activeOrders.map((o) => o.tableNumber));

  useEffect(() => {
    setSelectedTableLocal(activeTable);
  }, [activeTable]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Isometric Perspective Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x130e0c); // Rich espresso night ambiance

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(13, 15, 17);
    camera.lookAt(0, 0.5, 0);

    // 2. WebGL Renderer with Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Realistic Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd6, 1.2);
    scene.add(ambientLight);

    const warmCeilingLight = new THREE.DirectionalLight(0xffd29d, 2.0);
    warmCeilingLight.position.set(8, 18, 10);
    warmCeilingLight.castShadow = true;
    warmCeilingLight.shadow.mapSize.width = 1024;
    warmCeilingLight.shadow.mapSize.height = 1024;
    warmCeilingLight.shadow.bias = -0.001;
    scene.add(warmCeilingLight);

    const accentPoint = new THREE.PointLight(0xff8833, 2.5, 16);
    accentPoint.position.set(0, 6, 0);
    scene.add(accentPoint);

    // 4. Cafe Architecture: Herringbone Parquet Wood Floor
    const floorGeo = new THREE.BoxGeometry(20, 0.4, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x221713,
      roughness: 0.65,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Brick perimeter trim
    const trimGeo = new THREE.BoxGeometry(20.4, 0.15, 20.4);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x542618, roughness: 0.9 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = -0.05;
    scene.add(trim);

    // Glass/Wood Patio Divider
    const patioDividerGeo = new THREE.BoxGeometry(20, 0.6, 0.2);
    const patioDividerMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.4 });
    const divider = new THREE.Mesh(patioDividerGeo, patioDividerMat);
    divider.position.set(0, 0.15, 3.2);
    scene.add(divider);

    // 5. Modern Barista Coffee Bar & Billing Counter
    const counterGroup = new THREE.Group();
    counterGroup.position.set(-5.5, 0, -6.5);
    scene.add(counterGroup);

    // Counter base
    const counterGeo = new THREE.BoxGeometry(5.2, 1.3, 1.6);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x854823, roughness: 0.5 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.y = 0.65;
    counter.castShadow = true;
    counter.receiveShadow = true;
    counterGroup.add(counter);

    // Marble counter top
    const counterTopGeo = new THREE.BoxGeometry(5.4, 0.1, 1.8);
    const counterTopMat = new THREE.MeshStandardMaterial({ color: 0x2d2420, roughness: 0.2, metalness: 0.2 });
    const counterTop = new THREE.Mesh(counterTopGeo, counterTopMat);
    counterTop.position.y = 1.35;
    counterTop.castShadow = true;
    counterGroup.add(counterTop);

    // Chrome Espresso Machine on counter
    const espressoMachineGeo = new THREE.BoxGeometry(1.4, 0.8, 0.9);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
    const espressoMachine = new THREE.Mesh(espressoMachineGeo, chromeMat);
    espressoMachine.position.set(-1.2, 1.8, 0);
    espressoMachine.castShadow = true;
    counterGroup.add(espressoMachine);

    // 6. Indoor Plants / Fiddle Leaf Fig in Corners (2 Plants)
    const plantPositions = [
      { x: 8.5, z: -8.5 },
      { x: -8.5, z: 8.5 }
    ];
    plantPositions.forEach((pos) => {
      const plantGroup = new THREE.Group();
      plantGroup.position.set(pos.x, 0, pos.z);
      scene.add(plantGroup);

      // Pot
      const potGeo = new THREE.CylinderGeometry(0.5, 0.38, 0.9, 16);
      const potMat = new THREE.MeshStandardMaterial({ color: 0xba5c32, roughness: 0.9 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.45;
      pot.castShadow = true;
      plantGroup.add(pot);

      // Leaves (Spherical foliage clusters)
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a36, roughness: 0.6 });
      for (let l = 0; l < 4; l++) {
        const leafGeo = new THREE.SphereGeometry(0.45, 8, 8);
        leafGeo.scale(1.2, 0.6, 1.2);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set((Math.random() - 0.5) * 0.4, 1.0 + l * 0.3, (Math.random() - 0.5) * 0.4);
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }
    });

    // 7. Interactive 3D Tables with Floating 3D Canvas Labels
    const tableMeshes: THREE.Mesh[] = [];
    const tableLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 12);
    const tableLegMat = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.8, roughness: 0.2 });
    const tableTopGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 28);
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.06, 16);

    // Helper: Create 3D Canvas Sprite Badge above each table
    function createTableLabelSprite(name: string, isCurrent: boolean, isOccupied: boolean) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Pill background
        ctx.fillStyle = isCurrent ? "#d97706" : isOccupied ? "#b91c1c" : "#047857";
        ctx.beginPath();
        ctx.roundRect(10, 10, 236, 80, 24);
        ctx.fill();

        // Border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const shortName = name.replace("Table ", "T-");
        const statusText = isCurrent ? "Active" : isOccupied ? "Dining" : "Vacant";
        ctx.fillText(`${shortName} • ${statusText}`, 128, 50);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.6, 0.65, 1);
      sprite.position.y = 2.0;
      return sprite;
    }

    config.tables.forEach((tableName, index) => {
      const isOccupied = occupiedTableSet.has(tableName);
      const isCurrentSelected = tableName === selectedTableLocal;

      // Filter visibility
      if (tableFilter === "vacant" && isOccupied) return;
      if (tableFilter === "occupied" && !isOccupied) return;

      const row = Math.floor(index / 4);
      const col = index % 4;
      const x = (col - 1.5) * 4.0;
      const z = (row - 1) * 4.2 - 0.5;

      const tableGroup = new THREE.Group();
      tableGroup.position.set(x, 0, z);
      scene.add(tableGroup);

      // Table Top Material
      const tableMat = new THREE.MeshStandardMaterial({
        color: isCurrentSelected ? 0xd97706 : isOccupied ? 0x9a3412 : 0xede0d4,
        roughness: 0.35,
        metalness: 0.1
      });

      const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
      tableTop.position.y = 1;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      tableTop.userData = { tableName, isOccupied } as TableMeshUserData;
      tableGroup.add(tableTop);
      tableMeshes.push(tableTop);

      // Table Leg & Base
      const leg = new THREE.Mesh(tableLegGeo, tableLegMat);
      leg.position.y = 0.5;
      leg.castShadow = true;
      tableGroup.add(leg);

      const base = new THREE.Mesh(baseGeo, tableLegMat);
      base.position.y = 0.03;
      base.receiveShadow = true;
      tableGroup.add(base);

      // Glowing Neon Status Ring on floor
      const ringGeo = new THREE.RingGeometry(1.1, 1.25, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isCurrentSelected ? 0xf59e0b : isOccupied ? 0xef4444 : 0x10b981,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      tableGroup.add(ring);

      // Floating 3D Text Label
      const labelSprite = createTableLabelSprite(tableName, isCurrentSelected, isOccupied);
      tableGroup.add(labelSprite);

      // Overhead Pendant Brass Lamp hanging above table
      const wireGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.set(0, 3.2, 0);
      tableGroup.add(wire);

      const shadeGeo = new THREE.ConeGeometry(0.35, 0.25, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0xc8963e, metalness: 0.8, roughness: 0.3 });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(0, 2.4, 0);
      tableGroup.add(shade);

      // Cozy warm pool light on table
      const tableLight = new THREE.PointLight(0xffd59e, 1.2, 3.2);
      tableLight.position.set(0, 2.2, 0);
      tableGroup.add(tableLight);

      // 3D Miniature Chairs (2 chairs)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI) {
        const chairGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.65, 12);
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.6 });
        const chair = new THREE.Mesh(chairGeo, chairMat);
        chair.position.set(Math.cos(angle) * 1.35, 0.32, Math.sin(angle) * 1.35);
        chair.castShadow = true;
        tableGroup.add(chair);
      }
    });

    // 8. Raycasting & Table Selection Logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(tableMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData as TableMeshUserData;
        if (data && data.tableName) {
          setHoveredTable(data.tableName);
          renderer.domElement.style.cursor = "pointer";
          return;
        }
      }
      setHoveredTable(null);
      renderer.domElement.style.cursor = "grab";
    };

    const handleTableSelect = (tblName: string) => {
      setActiveTable(tblName);
      setSelectedTableLocal(tblName);
      soundService.playSuccessChime();
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(tableMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const data = hit.userData as TableMeshUserData;
        if (data && data.tableName) {
          handleTableSelect(data.tableName);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);
    renderer.domElement.addEventListener("click", onPointerClick);

    // 9. Orbit Drag Controls with Mouse & Touch
    let isDragging = false;
    let prevX = 0;
    let cameraAngle = Math.PI / 4;
    const radius = 23;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      cameraAngle -= deltaX * 0.006;
      camera.position.x = Math.sin(cameraAngle) * radius;
      camera.position.z = Math.cos(cameraAngle) * radius;
      camera.lookAt(0, 0.5, 0);
      prevX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMoveDrag);
    window.addEventListener("mouseup", onMouseUp);

    // Touch Support for Mobile Phones
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMoveDrag = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const deltaX = clientX - prevX;
      cameraAngle -= deltaX * 0.008;
      camera.position.x = Math.sin(cameraAngle) * radius;
      camera.position.z = Math.cos(cameraAngle) * radius;
      camera.lookAt(0, 0.5, 0);
      prevX = clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      isDragging = false;
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
        if (dist < 10) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(tableMeshes);
          if (intersects.length > 0) {
            const hit = intersects[0].object as THREE.Mesh;
            const data = hit.userData as TableMeshUserData;
            if (data && data.tableName) {
              handleTableSelect(data.tableName);
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMoveDrag, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 10. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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
      renderer.domElement.removeEventListener("mousemove", onPointerMove);
      renderer.domElement.removeEventListener("click", onPointerClick);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMoveDrag);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMoveDrag);
      window.removeEventListener("touchend", onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [config.tables, selectedTableLocal, orders, tableFilter]);

  return (
    <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl p-4 sm:p-6 space-y-4 text-white">
      
      {/* Header & Table Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-600/30 text-amber-400 rounded-lg border border-amber-500/40">
              <Move3d className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-lg text-white">Interactive 3D Cafe Floor Plan</h3>
          </div>
          <p className="text-xs text-stone-400">
            Click/tap any 3D table to switch your seat. Overhead tags display live table occupancy.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-xl border border-stone-700 self-start sm:self-auto">
          <button
            onClick={() => setTableFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tableFilter === "all" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
            }`}
          >
            All ({config.tables.length})
          </button>
          <button
            onClick={() => setTableFilter("vacant")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tableFilter === "vacant" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-400 hover:text-white"
            }`}
          >
            🟢 Vacant ({config.tables.length - occupiedTableSet.size})
          </button>
          <button
            onClick={() => setTableFilter("occupied")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tableFilter === "occupied" ? "bg-red-700 text-white shadow-xs" : "text-stone-400 hover:text-white"
            }`}
          >
            🔴 Dining ({occupiedTableSet.size})
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-stone-950 to-stone-900 border border-stone-800">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Active Selected Table Floating Overlay Banner */}
        <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-300 shadow-xl flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Active Table: <strong className="text-white font-extrabold">{activeTable}</strong></span>
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] border border-amber-500/30">
            Selected
          </span>
        </div>

        {/* Instruction Footer Overlay */}
        <div className="absolute bottom-3 right-3 bg-stone-900/85 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-700/60 text-[11px] text-stone-300 pointer-events-none flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Swipe / Drag to Orbit • Click Table to Select</span>
        </div>
      </div>

    </div>
  );
};
