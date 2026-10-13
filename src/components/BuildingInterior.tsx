/**
 * UPSA Life - 3D Building Interiors
 * Fully explorable 3D interiors with third-person avatar movement for:
 * 1. UPSA Central Library (Academic books, study desks, librarian, challenge terminal)
 * 2. Lecture Block Complex / LBC (Lecture hall rows, podium, Dr. Boateng, pop quiz)
 * 3. Students Centre & Food Court (Food stall, Auntie Mansah, tables, drinks)
 * 4. Banking Square & Admin Office (Bank counters, ATM, campus job terminal)
 * 5. AstroTurf Sports Complex (Turf pitch, goals, penalty spot, Kojo)
 *
 * Players can walk around freely and exit through the door back to the campus at will.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGame } from '../context/GameStateContext';
import { GameView } from '../types/game';
import {
  DoorOpen,
  Smartphone,
  BookOpen,
  GraduationCap,
  Utensils,
  CreditCard,
  Activity,
  Sparkles,
  Footprints,
  Compass,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

interface BuildingInteriorProps {
  type: 'library' | 'lbc' | 'food_court' | 'banking' | 'astroturf';
}

export const BuildingInterior: React.FC<BuildingInteriorProps> = ({ type }) => {
  const {
    student,
    setCurrentView,
    setIsPhoneOpen,
    setPhoneActiveApp,
    setActiveActivity,
    setActiveDialogNpc,
    isPhoneOpen,
    showToast,
    requestTransportTo,
  } = useGame();

  const containerRef = useRef<HTMLDivElement>(null);
  const [nearbyPrompt, setNearbyPrompt] = useState<{
    text: string;
    action: () => void;
  } | null>(null);

  const [isSprint, setIsSprint] = useState(false);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirection = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const playerMeshRef = useRef<THREE.Group | null>(null);

  const getBuildingDetails = () => {
    switch (type) {
      case 'library':
        return {
          title: 'UPSA Central Library (Reading Complex)',
          subtitle: 'Floor 1 — Quiet Study & Research Hall',
          icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
          accent: '#10b981',
        };
      case 'lbc':
        return {
          title: 'Lecture Block Complex (LBC Hall 3)',
          subtitle: 'Tiered Auditorium & Lecture Theater',
          icon: <GraduationCap className="w-5 h-5 text-blue-400" />,
          accent: '#3b82f6',
        };
      case 'food_court':
        return {
          title: 'Students Centre & Food Court',
          subtitle: 'Auntie Mansah’s Spot & Refreshment Pavilion',
          icon: <Utensils className="w-5 h-5 text-orange-400" />,
          accent: '#f97316',
        };
      case 'banking':
        return {
          title: 'Banking Square & Student Services',
          subtitle: 'Campus Branch, ATM & Career Desk',
          icon: <CreditCard className="w-5 h-5 text-amber-400" />,
          accent: '#f59e0b',
        };
      case 'astroturf':
        return {
          title: 'UPSA AstroTurf Sports Pitch',
          subtitle: 'Varsity Pitch & Athletics Track',
          icon: <Activity className="w-5 h-5 text-emerald-400" />,
          accent: '#16a34a',
        };
    }
  };

  const info = getBuildingDetails();

  // Setup 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(type === 'astroturf' ? '#7dd3fc' : '#0f172a');

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 150);
    camera.position.set(0, 8, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight('#fff7ed', 1.2);
    mainLight.position.set(10, 16, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // --- ROOM INTERIOR STRUCTURE ---
    // Floor
    const floorSizeX = type === 'astroturf' ? 40 : 24;
    const floorSizeZ = type === 'astroturf' ? 32 : 24;

    const floorColor =
      type === 'astroturf'
        ? '#15803d'
        : type === 'library'
        ? '#334155'
        : type === 'lbc'
        ? '#1e293b'
        : type === 'food_court'
        ? '#fed7aa'
        : '#e2e8f0';

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSizeX, floorSizeZ),
      new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls (for indoor buildings)
    if (type !== 'astroturf') {
      const wallMat = new THREE.MeshStandardMaterial({
        color: type === 'library' ? '#f8fafc' : type === 'lbc' ? '#e2e8f0' : '#f1f5f9',
        roughness: 0.9,
      });

      // Back Wall
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(floorSizeX, 8, 0.3), wallMat);
      backWall.position.set(0, 4, -floorSizeZ / 2);
      backWall.receiveShadow = true;
      scene.add(backWall);

      // Left Wall
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, floorSizeZ), wallMat);
      leftWall.position.set(-floorSizeX / 2, 4, 0);
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      // Right Wall
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, floorSizeZ), wallMat);
      rightWall.position.set(floorSizeX / 2, 4, 0);
      rightWall.receiveShadow = true;
      scene.add(rightWall);
    }

    // --- EXIT DOOR (Always at (0, 0, floorSizeZ / 2 - 1)) ---
    const exitDoorGroup = new THREE.Group();
    exitDoorGroup.position.set(0, 0, floorSizeZ / 2 - 1.2);

    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 4.2, 0.4),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
    );
    doorFrame.position.set(0, 2.1, 0);
    exitDoorGroup.add(doorFrame);

    const doorMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.2, transparent: true, opacity: 0.7 });
    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.8), doorMat);
    doorGlass.position.set(0, 2.1, 0.22);
    exitDoorGroup.add(doorGlass);

    // Exit Sign above door
    const exitSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.5, 0.2),
      new THREE.MeshStandardMaterial({ color: '#16a34a' })
    );
    exitSign.position.set(0, 4.4, 0.2);
    exitDoorGroup.add(exitSign);
    scene.add(exitDoorGroup);

    // --- SPECIFIC BUILDING FURNITURE ---
    if (type === 'library') {
      // Bookshelves along walls
      for (let i = -8; i <= 8; i += 4) {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 5, 1.2),
          new THREE.MeshStandardMaterial({ color: '#78350f' })
        );
        shelf.position.set(i, 2.5, -9.5);
        shelf.castShadow = true;
        scene.add(shelf);
      }

      // Study Tables in center
      [-4, 4].forEach((tx) => {
        const table = new THREE.Mesh(
          new THREE.BoxGeometry(4.5, 1.2, 2.2),
          new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.6 })
        );
        table.position.set(tx, 0.6, 0);
        table.castShadow = true;
        scene.add(table);
      });

      // Academic Research Terminal in Library center
      const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.2, 1.2),
        new THREE.MeshStandardMaterial({ color: '#0284c7' })
      );
      terminal.position.set(0, 1.1, -4);
      terminal.castShadow = true;
      scene.add(terminal);

      // NPC Ama Serwaa studying in the library
      const amaGroup = new THREE.Group();
      amaGroup.position.set(-4, 0, -2);
      const amaTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), new THREE.MeshStandardMaterial({ color: '#ea580c' }));
      amaTorso.position.set(0, 1.45, 0);
      amaGroup.add(amaTorso);
      const amaHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: '#78350f' }));
      amaHead.position.set(0, 2.2, 0);
      amaGroup.add(amaHead);
      scene.add(amaGroup);
    } else if (type === 'lbc') {
      // Tiered Lecture Desks
      for (let r = 0; r < 3; r++) {
        const zPos = -7 + r * 4.5;
        const desk = new THREE.Mesh(
          new THREE.BoxGeometry(16, 1.2, 1.4),
          new THREE.MeshStandardMaterial({ color: '#854d0e' })
        );
        desk.position.set(0, 0.6 + r * 0.4, zPos);
        desk.castShadow = true;
        scene.add(desk);
      }

      // Front Stage Podium & Lecturer Dr. Boateng
      const podium = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.4, 1.2),
        new THREE.MeshStandardMaterial({ color: '#1e293b' })
      );
      podium.position.set(0, 0.7, 6);
      scene.add(podium);

      // Whiteboard on front wall
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 3.5),
        new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })
      );
      board.position.set(0, 3.2, 10.8);
      board.rotation.y = Math.PI;
      scene.add(board);
    } else if (type === 'food_court') {
      // Food Serving Counter
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1.6, 2.5),
        new THREE.MeshStandardMaterial({ color: '#c2410c' })
      );
      counter.position.set(0, 0.8, -7);
      counter.castShadow = true;
      scene.add(counter);

      // Auntie Mansah behind counter
      const amGroup = new THREE.Group();
      amGroup.position.set(0, 0, -9);
      const amTorso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5), new THREE.MeshStandardMaterial({ color: '#78350f' }));
      amTorso.position.set(0, 1.45, 0);
      amGroup.add(amTorso);
      const amHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: '#451a03' }));
      amHead.position.set(0, 2.2, 0);
      amGroup.add(amHead);
      scene.add(amGroup);

      // Dining Tables
      [[-5, 0], [5, 0], [-5, 4], [5, 4]].forEach(([tx, tz]) => {
        const table = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.4, 1.2, 16),
          new THREE.MeshStandardMaterial({ color: '#fbbf24' })
        );
        table.position.set(tx, 0.6, tz);
        table.castShadow = true;
        scene.add(table);
      });
    } else if (type === 'banking') {
      // Bank Teller Counters
      const bankDesk = new THREE.Mesh(
        new THREE.BoxGeometry(14, 1.8, 2.2),
        new THREE.MeshStandardMaterial({ color: '#0f172a' })
      );
      bankDesk.position.set(0, 0.9, -7);
      scene.add(bankDesk);

      // ATM Machine on side
      const atm = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 2.8, 1.2),
        new THREE.MeshStandardMaterial({ color: '#2563eb' })
      );
      atm.position.set(-8, 1.4, 0);
      scene.add(atm);

      // Job Center Kiosk
      const jobKiosk = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.4, 1.2),
        new THREE.MeshStandardMaterial({ color: '#d97706' })
      );
      jobKiosk.position.set(8, 1.2, 0);
      scene.add(jobKiosk);
    } else if (type === 'astroturf') {
      // Goal posts
      const goalBar = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      goalBar.position.set(0, 3, -13);
      scene.add(goalBar);

      // Penalty Spot Ring
      const spot = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.5, 16),
        new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
      );
      spot.rotation.x = -Math.PI / 2;
      spot.position.set(0, 0.05, -3);
      scene.add(spot);

      // Kojo standing near goal
      const kojoGroup = new THREE.Group();
      kojoGroup.position.set(3, 0, -5);
      const kTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), new THREE.MeshStandardMaterial({ color: '#059669' }));
      kTorso.position.set(0, 1.45, 0);
      kojoGroup.add(kTorso);
      const kHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: '#78350f' }));
      kHead.position.set(0, 2.2, 0);
      kojoGroup.add(kHead);
      scene.add(kojoGroup);
    }

    // --- PLAYER 3D AVATAR ---
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 4); // Start inside near door

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

    // --- KEY LISTENERS (WITH STRICT INPUT & PHONE FOCUS CHECK) ---
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

    // --- GAME LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const delta = clock.getDelta();

      if (!playerMeshRef.current || !cameraRef.current) return;
      const player = playerMeshRef.current;
      const speed = isSprint ? 12 : 7.5;

      // When phone is open or user is typing, stop avatar motion
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

        // Bounds limit
        const limitX = (floorSizeX / 2) - 1.2;
        const limitZ = (floorSizeZ / 2) - 1.2;
        player.position.x = Math.max(-limitX, Math.min(limitX, player.position.x));
        player.position.z = Math.max(-limitZ, Math.min(limitZ, player.position.z));

        player.rotation.y = Math.atan2(moveX, moveZ);
        player.position.y = Math.sin(clock.getElapsedTime() * 11) * 0.06;
      } else {
        player.position.y = 0;
      }

      // Camera follow
      cameraRef.current.position.x += (player.position.x - cameraRef.current.position.x) * 0.08;
      cameraRef.current.position.y += (player.position.y + 6.5 - cameraRef.current.position.y) * 0.08;
      cameraRef.current.position.z += (player.position.z + 10.5 - cameraRef.current.position.z) * 0.08;
      cameraRef.current.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

      // Check Proximity to Exit Door or Hotspots
      const distToExit = Math.hypot(player.position.x - 0, player.position.z - (floorSizeZ / 2 - 1.2));
      if (distToExit < 2.5) {
        setNearbyPrompt({
          text: 'Leave Building & Return to Campus Quad',
          action: () => {
            audioService.playClick();
            setCurrentView('campus');
            showToast('🚪 Stepped out into the campus grounds.');
          },
        });
      } else if (type === 'library') {
        const distToTerminal = Math.hypot(player.position.x - 0, player.position.z - -4);
        const distToAma = Math.hypot(player.position.x - -4, player.position.z - -2);
        if (distToTerminal < 2.8) {
          setNearbyPrompt({
            text: 'Access Academic Research Challenge Terminal',
            action: () => setActiveActivity('library_study'),
          });
        } else if (distToAma < 2.8) {
          setNearbyPrompt({
            text: 'Talk to Ama Serwaa (Group Study)',
            action: () => setActiveDialogNpc('ama'),
          });
        } else {
          setNearbyPrompt(null);
        }
      } else if (type === 'lbc') {
        const distToPodium = Math.hypot(player.position.x - 0, player.position.z - 6);
        if (distToPodium < 3.2) {
          setNearbyPrompt({
            text: 'Take Dr. Boateng’s Lecture Pop Quiz',
            action: () => setActiveActivity('lbc_lecture'),
          });
        } else {
          setNearbyPrompt(null);
        }
      } else if (type === 'food_court') {
        const distToCounter = Math.hypot(player.position.x - 0, player.position.z - -7);
        if (distToCounter < 3.2) {
          setNearbyPrompt({
            text: 'Order Auntie Mansah’s Waakye & Jollof',
            action: () => setActiveActivity('food_court'),
          });
        } else {
          setNearbyPrompt(null);
        }
      } else if (type === 'banking') {
        const distToKiosk = Math.hypot(player.position.x - 8, player.position.z - 0);
        const distToAtm = Math.hypot(player.position.x - -8, player.position.z - 0);
        if (distToKiosk < 2.8) {
          setNearbyPrompt({
            text: 'View Campus Part-Time Work Shifts',
            action: () => setActiveActivity('banking_gig'),
          });
        } else if (distToAtm < 2.8) {
          setNearbyPrompt({
            text: 'Open CampusPay / MoMo Terminal',
            action: () => {
              setPhoneActiveApp('wallet');
              setIsPhoneOpen(true);
              audioService.playPhoneChime();
            },
          });
        } else {
          setNearbyPrompt(null);
        }
      } else if (type === 'astroturf') {
        const distToSpot = Math.hypot(player.position.x - 0, player.position.z - -3);
        const distToKojo = Math.hypot(player.position.x - 3, player.position.z - -5);
        if (distToSpot < 3.0) {
          setNearbyPrompt({
            text: 'Start Penalty Kick Challenge',
            action: () => setActiveActivity('astroturf_shootout'),
          });
        } else if (distToKojo < 2.8) {
          setNearbyPrompt({
            text: 'Talk to Kojo (Varsity Football)',
            action: () => setActiveDialogNpc('kojo'),
          });
        } else {
          setNearbyPrompt(null);
        }
      } else {
        setNearbyPrompt(null);
      }

      renderer.render(scene, cameraRef.current);
    };

    loop();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
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
  }, [type, student?.avatarConfig, isSprint, isPhoneOpen, setCurrentView, setActiveActivity, setActiveDialogNpc, setIsPhoneOpen, showToast]);

  // E key listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        isPhoneOpen
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'e' && nearbyPrompt) {
        nearbyPrompt.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearbyPrompt, isPhoneOpen]);

  return (
    <div className="relative w-full h-full min-h-[640px] bg-slate-950 select-none overflow-hidden flex flex-col">
      {/* 3D Interior Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Header */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            {info.icon}
          </div>
          <div>
            <div className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
              <span>{info.title}</span>
            </div>
            <div className="text-xs text-slate-400">
              {info.subtitle} · Walk around with WASD · Walk to door to exit
            </div>
          </div>
        </div>

        {/* Top Right: Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              setCurrentView('campus');
              showToast('🚪 Returned to Campus Quad.');
            }}
            className="flex items-center gap-2 bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors shadow-lg"
          >
            <DoorOpen className="w-4 h-4 text-emerald-400" />
            <span>Exit to Campus</span>
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
        </div>
      </div>

      {/* Floating Proximity Prompt (Center) */}
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
                Interaction Available
              </div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-200">
                {nearbyPrompt.text}
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse ml-2" />
          </button>
        </div>
      )}

      {/* Bottom Touch Virtual Controls */}
      <div className="relative z-10 mt-auto p-4 flex items-end justify-between pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-[11px] text-slate-400">
          Walk to the glass double doors at the front to return to campus grounds anytime.
        </div>

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
    </div>
  );
};
