/**
 * UPSA Life - 3D Walkable Student Hostel Room
 * Controllable 3D avatar moving freely around the room, approaching furniture:
 * Bed, Study Desk, Mini Fridge, Wardrobe, Bathroom Vanity, and Room Exit Door.
 * Full key-capture isolation prevents typing conflicts with smartphone.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGame } from '../context/GameStateContext';
import { HOSTEL_OPTIONS } from '../data/gameData';
import {
  Bed,
  BookOpen,
  Sparkles,
  Bath,
  Coffee,
  Palette,
  DoorOpen,
  Smartphone,
  UserCheck,
  Footprints,
  ShoppingBag,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const StudentRoom: React.FC = () => {
  const {
    student,
    needs,
    roomCustomization,
    updateRoomCustomization,
    restInBed,
    freshenUp,
    attendClassOrStudy,
    buyFoodItem,
    courses,
    setCurrentView,
    setIsPhoneOpen,
    setActiveDialogNpc,
    showToast,
    isPhoneOpen,
    requestTransportTo,
  } = useGame();

  const containerRef = useRef<HTMLDivElement>(null);
  const [nearbyPrompt, setNearbyPrompt] = useState<{
    text: string;
    action: () => void;
  } | null>(null);

  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isDecorModalOpen, setIsDecorModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [activeCourseToStudy, setActiveCourseToStudy] = useState(courses[0]?.code || 'ACC 101');
  const [isSprint, setIsSprint] = useState(false);

  // Animation & Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const fanBladeRef = useRef<THREE.Group | null>(null);
  const playerMeshRef = useRef<THREE.Group | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirection = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Setup 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 6, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fed7aa', 1.1);
    sunLight.position.set(6, 10, 4);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Room Geometry - 8m x 4.5m x 8m
    // Floor
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall
    const wallGeo = new THREE.BoxGeometry(8, 4.5, 0.15);
    const wallMat = new THREE.MeshStandardMaterial({
      color: roomCustomization.wallColor || '#f1f5f9',
      roughness: 0.9,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2.25, -4);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 8), wallMat);
    leftWall.position.set(-4, 2.25, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 8), wallMat);
    rightWall.position.set(4, 2.25, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Area Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.8),
      new THREE.MeshStandardMaterial({ color: roomCustomization.rugColor || '#2563eb', roughness: 0.85 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, 0.2);
    rug.receiveShadow = true;
    scene.add(rug);

    // --- FURNITURE: BED at (2.4, 0, -1.8) ---
    const bedGroup = new THREE.Group();
    bedGroup.position.set(2.4, 0, -1.8);
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 3.2),
      new THREE.MeshStandardMaterial({ color: '#451a03' })
    );
    bedFrame.position.set(0, 0.25, 0);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    const bedSpread = new THREE.Mesh(
      new THREE.BoxGeometry(1.98, 0.25, 2.2),
      new THREE.MeshStandardMaterial({ color: roomCustomization.bedSpreadColor || '#1d4ed8' })
    );
    bedSpread.position.set(0, 0.65, 0.4);
    bedSpread.castShadow = true;
    bedGroup.add(bedSpread);

    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.18, 0.6),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    pillow.position.set(0, 0.75, -1.0);
    bedGroup.add(pillow);
    scene.add(bedGroup);

    // --- FURNITURE: STUDY DESK at (-2.5, 0, -2.4) ---
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-2.5, 0, -2.4);
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1.2),
      new THREE.MeshStandardMaterial({ color: '#7c2d12' })
    );
    deskTop.position.set(0, 1.4, 0);
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    // Laptop
    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.5),
      new THREE.MeshStandardMaterial({ color: '#64748b' })
    );
    laptop.position.set(0, 1.47, 0);
    deskGroup.add(laptop);

    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.45, 0.03),
      new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#0284c7', emissiveIntensity: 0.5 })
    );
    screen.position.set(0, 1.68, -0.22);
    deskGroup.add(screen);

    // Potted plant on desk
    if (roomCustomization.deskPlant) {
      const plant = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.2),
        new THREE.MeshStandardMaterial({ color: '#16a34a' })
      );
      plant.position.set(-0.85, 1.65, -0.2);
      deskGroup.add(plant);
    }
    scene.add(deskGroup);

    // --- MINI FRIDGE at (-3.2, 0, 1.8) ---
    const fridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.3, 0.8),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3 })
    );
    fridge.position.set(-3.2, 0.65, 1.8);
    fridge.castShadow = true;
    scene.add(fridge);

    // --- WARDROBE at (3.2, 0, 1.8) ---
    const wardrobe = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.2, 1.0),
      new THREE.MeshStandardMaterial({ color: '#522304' })
    );
    wardrobe.position.set(3.2, 1.6, 1.8);
    wardrobe.castShadow = true;
    scene.add(wardrobe);

    // --- ROOM EXIT DOOR at (0, 0, 3.85) ---
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, 3.85);
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.2, 0.15),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
    );
    doorMesh.position.set(0, 1.6, 0);
    doorGroup.add(doorMesh);
    scene.add(doorGroup);

    // --- CEILING FAN ---
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 3.8, 0);
    const fanBlades = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.02, 1.3),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      blade.position.set(0, 0, 0.65);
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      fanBlades.add(pivot);
    }
    fanGroup.add(fanBlades);
    scene.add(fanGroup);
    fanBladeRef.current = fanBlades;

    // --- ROOMMATE (if shared room) ---
    if (student?.roomType !== 'single') {
      const rmGroup = new THREE.Group();
      rmGroup.position.set(-1.2, 0, -2.0);
      const rmTorso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.4), new THREE.MeshStandardMaterial({ color: '#0284c7' }));
      rmTorso.position.set(0, 1.35, 0);
      rmGroup.add(rmTorso);
      const rmHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshStandardMaterial({ color: '#78350f' }));
      rmHead.position.set(0, 2.0, 0);
      rmGroup.add(rmHead);
      scene.add(rmGroup);
    }

    // --- CONTROLLABLE PLAYER AVATAR ---
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 1.5); // Center of the room

    const pShirt = student?.avatarConfig?.shirtColor || '#3b82f6';
    const pPants = student?.avatarConfig?.pantsColor || '#1e293b';
    const pSkin = student?.avatarConfig?.skinTone || '#78350f';

    const pTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.45),
      new THREE.MeshStandardMaterial({ color: pShirt })
    );
    pTorso.position.set(0, 1.45, 0);
    pTorso.castShadow = true;
    playerGroup.add(pTorso);

    const pHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.52, 0.5),
      new THREE.MeshStandardMaterial({ color: pSkin })
    );
    pHead.position.set(0, 2.22, 0);
    pHead.castShadow = true;
    playerGroup.add(pHead);

    const pLegs = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.0, 0.4),
      new THREE.MeshStandardMaterial({ color: pPants })
    );
    pLegs.position.set(0, 0.5, 0);
    pLegs.castShadow = true;
    playerGroup.add(pLegs);

    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    // --- KEY LISTENERS WITH INPUT/PHONE ISOLATION ---
    const isTyping = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      return (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        isPhoneOpen
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'shift') setIsSprint(true);
      if (e.key.toLowerCase() === 'p') setIsPhoneOpen(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'shift') setIsSprint(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- ANIMATION & MOVEMENT LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const delta = clock.getDelta();

      if (fanBladeRef.current) {
        fanBladeRef.current.rotation.y += delta * 6;
      }

      if (!playerMeshRef.current || !cameraRef.current) return;
      const player = playerMeshRef.current;
      const speed = isSprint ? 7.5 : 5.0;

      let moveX = 0;
      let moveZ = 0;

      if (!isPhoneOpen) {
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveZ -= 1;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveZ += 1;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX -= 1;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX += 1;

        moveX += touchDirection.current.x;
        moveZ += touchDirection.current.y;
      }

      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        player.position.x += (moveX / len) * speed * delta;
        player.position.z += (moveZ / len) * speed * delta;

        // Room boundaries [-3.4 to 3.4, -3.4 to 3.4]
        player.position.x = Math.max(-3.3, Math.min(3.3, player.position.x));
        player.position.z = Math.max(-3.3, Math.min(3.3, player.position.z));

        player.rotation.y = Math.atan2(moveX, moveZ);
        player.position.y = Math.sin(clock.getElapsedTime() * 11) * 0.05;
      } else {
        player.position.y = 0;
      }

      // Camera follows behind avatar
      cameraRef.current.position.x += (player.position.x - cameraRef.current.position.x) * 0.08;
      cameraRef.current.position.y += (player.position.y + 4.8 - cameraRef.current.position.y) * 0.08;
      cameraRef.current.position.z += (player.position.z + 6.2 - cameraRef.current.position.z) * 0.08;
      cameraRef.current.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

      // Check Proximity to Room Furniture
      const distToBed = Math.hypot(player.position.x - 2.4, player.position.z - -1.8);
      const distToDesk = Math.hypot(player.position.x - -2.5, player.position.z - -2.4);
      const distToFridge = Math.hypot(player.position.x - -3.2, player.position.z - 1.8);
      const distToDoor = Math.hypot(player.position.x - 0, player.position.z - 3.8);
      const distToRoommate = Math.hypot(player.position.x - -1.2, player.position.z - -2.0);

      if (distToDoor < 1.8) {
        setNearbyPrompt({
          text: 'Step out to UPSA Campus Quad',
          action: () => {
            requestTransportTo('campus', 'UPSA Campus Grounds');
          },
        });
      } else if (distToBed < 2.0) {
        setNearbyPrompt({
          text: 'Rest in Bed (Sleep / Nap)',
          action: () => setSelectedHotspot('bed'),
        });
      } else if (distToDesk < 2.0) {
        setNearbyPrompt({
          text: 'Study at Desk & Review Courses',
          action: () => setIsStudyModalOpen(true),
        });
      } else if (distToFridge < 1.8) {
        setNearbyPrompt({
          text: 'Grab Mini Fridge Snack (Sobolo & Pastry)',
          action: () => {
            buyFoodItem({
              id: 'fridge-snack',
              name: 'Chilled Sobolo & Meat Pie',
              price: 15,
              hungerRestored: 30,
              happinessRestored: 20,
              energyRestored: 15,
            });
          },
        });
      } else if (student?.roomType !== 'single' && distToRoommate < 2.0) {
        setNearbyPrompt({
          text: 'Chat with Roommate Kwame',
          action: () => setActiveDialogNpc('kwame'),
        });
      } else {
        setNearbyPrompt(null);
      }

      renderer.render(scene, cameraRef.current);
    };

    loop();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix;
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    student?.avatarConfig,
    student?.roomType,
    roomCustomization,
    isSprint,
    isPhoneOpen,
    buyFoodItem,
    setActiveDialogNpc,
    requestTransportTo,
  ]);

  // E key listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || isPhoneOpen) return;
      if (e.key.toLowerCase() === 'e' && nearbyPrompt) {
        nearbyPrompt.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearbyPrompt, isPhoneOpen]);

  return (
    <div className="relative w-full h-full min-h-[640px] bg-slate-950 select-none overflow-hidden flex flex-col">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Hostel Room Header */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            {student?.roomNumber || 'A-102'}
          </div>
          <div>
            <div className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
              <span>{student?.hostelName || 'Access Hostel'}</span>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-mono">
                {student?.roomType || 'double'} room
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Walk freely with WASD · Walk to bed, desk, fridge, or exit door to interact
            </div>
          </div>
        </div>

        {/* Top Right Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              setIsDecorModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors shadow-lg"
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Customize Decor</span>
          </button>

          <button
            onClick={() => {
              audioService.playPhoneChime();
              setIsPhoneOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone (P)</span>
          </button>

          <button
            onClick={() => {
              requestTransportTo('campus', 'UPSA Campus Grounds');
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            <DoorOpen className="w-4 h-4" />
            <span>Campus Quad</span>
          </button>
        </div>
      </div>

      {/* Floating Proximity Prompt */}
      {nearbyPrompt && (
        <div className="relative z-20 mx-auto mt-auto mb-20 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={nearbyPrompt.action}
            className="group flex items-center gap-3.5 bg-slate-900/95 hover:bg-slate-900 text-white border-2 border-emerald-500/80 hover:border-emerald-400 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all scale-100 hover:scale-105 active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              E
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Room Hotspot
              </div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-200">
                {nearbyPrompt.text}
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse ml-2" />
          </button>
        </div>
      )}

      {/* Bottom Virtual D-Pad for Mobile */}
      <div className="relative z-10 mt-auto p-4 flex items-end justify-between pointer-events-none">
        <button
          onClick={() => freshenUp()}
          className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Bath className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] text-cyan-300 font-medium">Quick Shower</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => {
              setIsSprint((prev) => !prev);
              audioService.playClick();
            }}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all shadow-lg ${
              isSprint
                ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-500/50'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Footprints className="w-5 h-5" />
          </button>

          {/* D-Pad */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/85 border border-slate-700/60 p-2 rounded-2xl shadow-xl">
            <div />
            <button
              onMouseDown={() => { touchDirection.current.y = -1; }}
              onMouseUp={() => { touchDirection.current.y = 0; }}
              onTouchStart={() => { touchDirection.current.y = -1; }}
              onTouchEnd={() => { touchDirection.current.y = 0; }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center text-xs"
            >
              ▲
            </button>
            <div />
            <button
              onMouseDown={() => { touchDirection.current.x = -1; }}
              onMouseUp={() => { touchDirection.current.x = 0; }}
              onTouchStart={() => { touchDirection.current.x = -1; }}
              onTouchEnd={() => { touchDirection.current.x = 0; }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center text-xs"
            >
              ◀
            </button>
            <button
              onMouseDown={() => { touchDirection.current.y = 1; }}
              onMouseUp={() => { touchDirection.current.y = 0; }}
              onTouchStart={() => { touchDirection.current.y = 1; }}
              onTouchEnd={() => { touchDirection.current.y = 0; }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center text-xs"
            >
              ▼
            </button>
            <button
              onMouseDown={() => { touchDirection.current.x = 1; }}
              onMouseUp={() => { touchDirection.current.x = 0; }}
              onTouchStart={() => { touchDirection.current.x = 1; }}
              onTouchEnd={() => { touchDirection.current.x = 0; }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center text-xs"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Bed Rest Modal */}
      {selectedHotspot === 'bed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hostel Bed Rest</h3>
                <p className="text-xs text-slate-400">Restore your energy for lectures and campus events</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  restInBed(false);
                  setSelectedHotspot(null);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-indigo-300">Quick 1-Hour Power Nap</div>
                  <div className="text-xs text-slate-400">+35 Energy · +10 Happiness · Advances 1 hour</div>
                </div>
                <span className="text-xs font-medium text-indigo-400">Nap</span>
              </button>

              <button
                onClick={() => {
                  restInBed(true);
                  setSelectedHotspot(null);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-indigo-300">Full Night Sleep (8 Hours)</div>
                  <div className="text-xs text-slate-400">Energy 100% · Fully refreshed for tomorrow</div>
                </div>
                <span className="text-xs font-medium text-indigo-400">Sleep</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedHotspot(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Study Desk Modal */}
      {isStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Study Desk & Course Review</h3>
                <p className="text-xs text-slate-400">Select a course to revise lecture notes</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
              {courses.map((course) => (
                <div
                  key={course.code}
                  onClick={() => setActiveCourseToStudy(course.code)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeCourseToStudy === course.code
                      ? 'bg-amber-950/40 border-amber-500/70 text-white'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {course.code} — {course.name}
                    </span>
                    <span className="text-xs font-mono text-amber-400">
                      Score: {course.gradeScore}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Lecturer: {course.lecturer} · {course.creditHours} Credits
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  attendClassOrStudy(activeCourseToStudy, true);
                  setIsStudyModalOpen(false);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-600/25"
              >
                Start 1-Hour Study Session
              </button>
              <button
                onClick={() => setIsStudyModalOpen(false)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Decor Modal */}
      {isDecorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Customize Hostel Room</h3>
                  <p className="text-xs text-slate-400">Personalize your walls, bedspread, and rug style</p>
                </div>
              </div>
              <button onClick={() => setIsDecorModalOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Bedspread Color */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Bedspread Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Royal Blue', color: '#1d4ed8' },
                    { label: 'Deep Green', color: '#15803d' },
                    { label: 'Burgundy', color: '#881337' },
                    { label: 'Charcoal', color: '#334155' },
                    { label: 'Golden Mustard', color: '#ca8a04' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => updateRoomCustomization({ bedSpreadColor: c.color })}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                        roomCustomization.bedSpreadColor === c.color
                          ? 'scale-110 border-white ring-2 ring-blue-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Rug Color */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Area Rug Style
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Cobalt', color: '#2563eb' },
                    { label: 'Warm Orange', color: '#ea580c' },
                    { label: 'Emerald', color: '#059669' },
                    { label: 'Purple Accent', color: '#7c3aed' },
                    { label: 'Slate Grey', color: '#475569' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => updateRoomCustomization({ rugColor: c.color })}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                        roomCustomization.rugColor === c.color
                          ? 'scale-110 border-white ring-2 ring-blue-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDecorModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Done Decorating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
