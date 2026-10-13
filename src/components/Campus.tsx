/**
 * UPSA Life - 3D Campus Simulation
 * Low-poly University of Professional Studies, Accra (UPSA) campus with
 * third-person avatar exploration, buildings, wandering NPCs, proximity prompts,
 * day/night lighting, and touch/keyboard controls.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGame } from '../context/GameStateContext';
import { CAMPUS_LOCATIONS, NPCS, CampusLocation } from '../data/gameData';
import {
  Compass,
  Smartphone,
  Home,
  MessageSquare,
  GraduationCap,
  Utensils,
  BookOpen,
  Building,
  Activity,
  CreditCard,
  Footprints,
  Sparkles,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const Campus: React.FC = () => {
  const {
    student,
    needs,
    gameTime,
    setCurrentView,
    isPhoneOpen,
    setIsPhoneOpen,
    setActiveDialogNpc,
    setActiveActivity,
    targetCampusLocation,
    setTargetCampusLocation,
    showToast,
    completeMissionStep,
    missionProgress,
  } = useGame();

  const containerRef = useRef<HTMLDivElement>(null);
  const [nearbyTarget, setNearbyTarget] = useState<{
    type: 'npc' | 'location';
    id: string;
    name: string;
    actionText: string;
  } | null>(null);

  // Player position state for minimap
  const [playerCoord, setPlayerCoord] = useState<{ x: number; z: number }>({ x: 0, z: 25 });
  const [isSprint, setIsSprint] = useState(false);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const playerMeshRef = useRef<THREE.Group | null>(null);
  const npcMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirection = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lighting & Day/Night ambient
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Initialize Three.js Campus Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Atmospheric Fog and Sky
    scene.background = new THREE.Color('#93c5fd'); // Tropical bright Accra sky
    scene.fog = new THREE.FogExp2('#93c5fd', 0.0075);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 400);
    camera.position.set(0, 12, 38);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Sun Lighting
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#334155', 0.8);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight('#fff7ed', 1.3);
    dirLight.position.set(50, 70, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -90;
    dirLight.shadow.camera.right = 90;
    dirLight.shadow.camera.top = 90;
    dirLight.shadow.camera.bottom = -90;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // --- TERRAIN & GROUNDS ---
    // Main Grass Field
    const grassGeo = new THREE.PlaneGeometry(280, 280);
    const grassMat = new THREE.MeshStandardMaterial({
      color: '#4ade80', // Vibrant green lawn
      roughness: 0.9,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // Main Central Walkway (University Avenue)
    const avenueGeo = new THREE.PlaneGeometry(16, 220);
    const avenueMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0', // Clean paved stone walkway
      roughness: 0.8,
    });
    const avenue = new THREE.Mesh(avenueGeo, avenueMat);
    avenue.rotation.x = -Math.PI / 2;
    avenue.position.set(0, 0.05, 0);
    avenue.receiveShadow = true;
    scene.add(avenue);

    // Cross Walkways connecting East and West wings
    const cross1 = new THREE.Mesh(new THREE.PlaneGeometry(160, 10), avenueMat);
    cross1.rotation.x = -Math.PI / 2;
    cross1.position.set(0, 0.06, -15);
    cross1.receiveShadow = true;
    scene.add(cross1);

    const cross2 = new THREE.Mesh(new THREE.PlaneGeometry(140, 8), avenueMat);
    cross2.rotation.x = -Math.PI / 2;
    cross2.position.set(0, 0.06, 32);
    cross2.receiveShadow = true;
    scene.add(cross2);

    // --- LOW-POLY CAMPUS BUILDINGS ---

    // 1. UPSA Main Auditorium (Grand landmark at 0, 0, -45)
    const audGroup = new THREE.Group();
    audGroup.position.set(0, 0, -50);

    // Base podium & steps
    const audBase = new THREE.Mesh(
      new THREE.BoxGeometry(40, 2.5, 30),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 })
    );
    audBase.position.set(0, 1.25, 0);
    audBase.castShadow = true;
    audBase.receiveShadow = true;
    audGroup.add(audBase);

    // Auditorium Main Arch / Hall Structure
    const audMain = new THREE.Mesh(
      new THREE.BoxGeometry(34, 16, 24),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 })
    );
    audMain.position.set(0, 10, 0);
    audMain.castShadow = true;
    audGroup.add(audMain);

    // Blue glass curved facade
    const glassFacade = new THREE.Mesh(
      new THREE.BoxGeometry(26, 12, 1),
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8,
      })
    );
    glassFacade.position.set(0, 9, 12.1);
    audGroup.add(glassFacade);

    // Roof Canopy
    const roofCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(38, 1.5, 28),
      new THREE.MeshStandardMaterial({ color: '#0284c7' })
    );
    roofCanopy.position.set(0, 18.5, 0);
    audGroup.add(roofCanopy);
    scene.add(audGroup);

    // 2. Lecture Block Complex (LBC) at [-42, 0, -15]
    const lbcGroup = new THREE.Group();
    lbcGroup.position.set(-42, 0, -15);
    const lbcBody = new THREE.Mesh(
      new THREE.BoxGeometry(24, 14, 30),
      new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.6 })
    );
    lbcBody.position.set(0, 7, 0);
    lbcBody.castShadow = true;
    lbcBody.receiveShadow = true;
    lbcGroup.add(lbcBody);

    // Windows strips
    for (let floor = 1; floor <= 3; floor++) {
      const windowStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 2, 24),
        new THREE.MeshStandardMaterial({ color: '#0369a1', roughness: 0.2 })
      );
      windowStrip.position.set(12.1, floor * 3.5, 0);
      lbcGroup.add(windowStrip);
    }
    scene.add(lbcGroup);

    // 3. Central Library at [42, 0, -18]
    const libGroup = new THREE.Group();
    libGroup.position.set(42, 0, -18);
    const libBody = new THREE.Mesh(
      new THREE.BoxGeometry(26, 12, 28),
      new THREE.MeshStandardMaterial({ color: '#f0fdf4', roughness: 0.5 })
    );
    libBody.position.set(0, 6, 0);
    libBody.castShadow = true;
    libGroup.add(libBody);

    // Library Entrance Pillars
    for (let p = -3; p <= 3; p += 2) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: '#16a34a' })
      );
      pillar.position.set(-13.2, 6, p * 3);
      pillar.castShadow = true;
      libGroup.add(pillar);
    }
    scene.add(libGroup);

    // 4. Students Centre & Food Court at [-22, 0, 32]
    const foodGroup = new THREE.Group();
    foodGroup.position.set(-22, 0, 32);

    // Open pavilion roof
    const foodPavilion = new THREE.Mesh(
      new THREE.BoxGeometry(22, 1, 20),
      new THREE.MeshStandardMaterial({ color: '#ea580c' })
    );
    foodPavilion.position.set(0, 7, 0);
    foodGroup.add(foodPavilion);

    // Corner posts
    [[-10, -9], [10, -9], [-10, 9], [10, 9]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 7),
        new THREE.MeshStandardMaterial({ color: '#78350f' })
      );
      post.position.set(px, 3.5, pz);
      foodGroup.add(post);
    });

    // Auntie Mansah's food counter & signs
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(10, 1.8, 3),
      new THREE.MeshStandardMaterial({ color: '#fed7aa' })
    );
    counter.position.set(0, 0.9, -4);
    foodGroup.add(counter);
    scene.add(foodGroup);

    // 5. AstroTurf Sports Pitch at [45, 0, 35]
    const turfGroup = new THREE.Group();
    turfGroup.position.set(45, 0, 35);
    const turfField = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 26),
      new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.9 })
    );
    turfField.rotation.x = -Math.PI / 2;
    turfField.position.set(0, 0.08, 0);
    turfGroup.add(turfField);

    // White pitch markings
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const lineBorder = new THREE.Mesh(new THREE.RingGeometry(3.8, 4.0, 32), lineMat);
    lineBorder.rotation.x = -Math.PI / 2;
    lineBorder.position.set(0, 0.1, 0);
    turfGroup.add(lineBorder);

    // Goal posts
    const goalCrossbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    goalCrossbar.position.set(-17.5, 3, 0);
    turfGroup.add(goalCrossbar);
    scene.add(turfGroup);

    // 6. Hostels Entrance Quad Gate (positioned at z = 62, high arch so it never blocks camera)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 62);
    const gatePillar1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 14, 1.8),
      new THREE.MeshStandardMaterial({ color: '#4338ca' })
    );
    gatePillar1.position.set(-10, 7, 0);
    gateGroup.add(gatePillar1);

    const gatePillar2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 14, 1.8),
      new THREE.MeshStandardMaterial({ color: '#4338ca' })
    );
    gatePillar2.position.set(10, 7, 0);
    gateGroup.add(gatePillar2);

    const archBeam = new THREE.Mesh(
      new THREE.BoxGeometry(22, 1.4, 2),
      new THREE.MeshStandardMaterial({ color: '#3730a3' })
    );
    archBeam.position.set(0, 14.5, 0);
    gateGroup.add(archBeam);
    scene.add(gateGroup);

    // 7. Banking Square & Admin at [-40, 0, 8]
    const bankGroup = new THREE.Group();
    bankGroup.position.set(-40, 0, 8);
    const bankBody = new THREE.Mesh(
      new THREE.BoxGeometry(18, 9, 16),
      new THREE.MeshStandardMaterial({ color: '#fef08a' })
    );
    bankBody.position.set(0, 4.5, 0);
    bankGroup.add(bankBody);
    scene.add(bankGroup);

    // --- DECORATIVE PALM TREES & FLOWERBEDS ---
    const treeGeo = new THREE.CylinderGeometry(0.2, 0.35, 7, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7 });

    const treePositions: [number, number][] = [
      [-10, 10], [10, 10], [-10, -10], [10, -10],
      [-10, -30], [10, -30], [-25, 0], [25, 0],
      [-25, -20], [25, -20], [-8, 40], [8, 40],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(treeGeo, treeTrunkMat);
      trunk.position.set(0, 3.5, 0);
      trunk.castShadow = true;
      tree.add(trunk);

      // Palm Crown fronds
      for (let f = 0; f < 5; f++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.0, 5), leafMat);
        frond.position.set(0, 7.5, 0);
        frond.rotation.z = 0.5;
        const frondPivot = new THREE.Group();
        frondPivot.rotation.y = (f * Math.PI * 2) / 5;
        frondPivot.add(frond);
        tree.add(frondPivot);
      }
      scene.add(tree);
    });

    // --- 3D NPCS ON CAMPUS ---
    const npcCoords: Record<string, [number, number]> = {
      ama: [30, -15], // near Library
      kwame: [-14, 26], // near Students Centre
      esi: [-18, 14], // near Banking Square
      kojo: [32, 28], // near AstroTurf
      prof_boateng: [-30, -12], // outside LBC
      auntie_mansah: [-22, 28], // at Food stall
    };

    Object.entries(npcCoords).forEach(([npcId, [nx, nz]]) => {
      const npcInfo = NPCS[npcId];
      if (!npcInfo) return;

      const npcGroup = new THREE.Group();
      npcGroup.position.set(nx, 0, nz);

      // Torso
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.45),
        new THREE.MeshStandardMaterial({ color: npcInfo.shirtColor || '#2563eb' })
      );
      torso.position.set(0, 1.45, 0);
      torso.castShadow = true;
      npcGroup.add(torso);

      // Head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.5, 0.48),
        new THREE.MeshStandardMaterial({ color: '#78350f' })
      );
      head.position.set(0, 2.2, 0);
      head.castShadow = true;
      npcGroup.add(head);

      // Legs
      const legs = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 1.0, 0.4),
        new THREE.MeshStandardMaterial({ color: '#1e293b' })
      );
      legs.position.set(0, 0.5, 0);
      legs.castShadow = true;
      npcGroup.add(legs);

      // Floating NPC Marker ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.0, 16),
        new THREE.MeshBasicMaterial({ color: npcInfo.shirtColor, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.04, 0);
      npcGroup.add(ring);

      scene.add(npcGroup);
      npcMeshesRef.current.set(npcId, npcGroup);
    });

    // --- PLAYER 3D AVATAR ---
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 10); // Start cleanly centered on University Avenue facing North

    // Player torso
    const playerShirtColor = student?.avatarConfig?.shirtColor || '#3b82f6';
    const playerPantsColor = student?.avatarConfig?.pantsColor || '#1e293b';
    const playerSkinColor = student?.avatarConfig?.skinTone || '#78350f';

    const pTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.45),
      new THREE.MeshStandardMaterial({ color: playerShirtColor })
    );
    pTorso.position.set(0, 1.45, 0);
    pTorso.castShadow = true;
    playerGroup.add(pTorso);

    // Player head
    const pHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.52, 0.5),
      new THREE.MeshStandardMaterial({ color: playerSkinColor })
    );
    pHead.position.set(0, 2.22, 0);
    pHead.castShadow = true;
    playerGroup.add(pHead);

    // Backpack
    const backpack = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.25),
      new THREE.MeshStandardMaterial({ color: '#334155' })
    );
    backpack.position.set(0, 1.45, -0.32);
    playerGroup.add(backpack);

    // Player legs
    const pLegs = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.0, 0.4),
      new THREE.MeshStandardMaterial({ color: playerPantsColor })
    );
    pLegs.position.set(0, 0.5, 0);
    pLegs.castShadow = true;
    playerGroup.add(pLegs);

    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    // Handle initial teleport if targetCampusLocation was set
    if (targetCampusLocation) {
      const loc = CAMPUS_LOCATIONS.find((l) => l.id === targetCampusLocation);
      if (loc) {
        playerGroup.position.set(loc.position[0], 0, loc.position[2] + 8);
      }
      setTargetCampusLocation(null);
    }

    // --- KEYBOARD EVENT LISTENERS (ISOLATED FROM TEXTING & PHONE) ---
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
      if (e.key.toLowerCase() === 'shift') {
        setIsSprint(true);
      }
      if (e.key.toLowerCase() === 'p') {
        setIsPhoneOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'shift') {
        setIsSprint(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- ANIMATION / GAME LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const delta = clock.getDelta();

      if (!playerMeshRef.current || !cameraRef.current) return;

      const player = playerMeshRef.current;
      const speed = isSprint ? 14 : 9;

      let moveX = 0;
      let moveZ = 0;

      // Keyboard Inputs
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveZ -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveZ += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX += 1;

      // Touch Inputs
      if (touchDirection.current.x !== 0 || touchDirection.current.y !== 0) {
        moveX += touchDirection.current.x;
        moveZ += touchDirection.current.y;
      }

      // Apply Movement & Player Rotation
      if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const normX = (moveX / length) * speed * delta;
        const normZ = (moveZ / length) * speed * delta;

        player.position.x += normX;
        player.position.z += normZ;

        // Keep inside campus bounds [-85 to 85, -60 to 70]
        player.position.x = Math.max(-85, Math.min(85, player.position.x));
        player.position.z = Math.max(-60, Math.min(65, player.position.z));

        // Smoothly rotate avatar towards movement direction
        const targetAngle = Math.atan2(moveX, moveZ);
        player.rotation.y = targetAngle;

        // Subtle walking bounce
        player.position.y = Math.sin(clock.getElapsedTime() * 12) * 0.08;

        // Update player coord for Minimap
        setPlayerCoord({ x: player.position.x, z: player.position.z });
      } else {
        player.position.y = 0;
      }

      // Smooth Third-Person Camera Follow
      const targetCamX = player.position.x;
      const targetCamY = player.position.y + 11.5;
      const targetCamZ = player.position.z + 18.5;

      cameraRef.current.position.x += (targetCamX - cameraRef.current.position.x) * 0.08;
      cameraRef.current.position.y += (targetCamY - cameraRef.current.position.y) * 0.08;
      cameraRef.current.position.z += (targetCamZ - cameraRef.current.position.z) * 0.08;
      cameraRef.current.lookAt(player.position.x, player.position.y + 1.8, player.position.z);

      // Check Proximity to NPCs and Buildings
      let foundTarget: {
        type: 'npc' | 'location';
        id: string;
        name: string;
        actionText: string;
      } | null = null;

      // 1. Proximity to NPCs (< 4.5m)
      for (const [npcId, [nx, nz]] of Object.entries(npcCoords)) {
        const dist = Math.hypot(player.position.x - nx, player.position.z - nz);
        if (dist < 4.5) {
          const npc = NPCS[npcId];
          foundTarget = {
            type: 'npc',
            id: npcId,
            name: npc?.name || npcId,
            actionText: `Talk to ${npc?.name || npcId}`,
          };
          break;
        }
      }

      // 2. Proximity to Campus Buildings (< 10m) if no NPC directly closer
      if (!foundTarget) {
        for (const loc of CAMPUS_LOCATIONS) {
          const dist = Math.hypot(
            player.position.x - loc.position[0],
            player.position.z - loc.position[2]
          );
          if (dist < 11) {
            foundTarget = {
              type: 'location',
              id: loc.id,
              name: loc.name,
              actionText: loc.activityTitle,
            };
            break;
          }
        }
      }

      setNearbyTarget(foundTarget);

      // Check Mission 1: Campus tour (visit Auditorium)
      if (
        Math.hypot(player.position.x - 0, player.position.z - -45) < 14 &&
        !missionProgress['m1_orientation']?.completed
      ) {
        completeMissionStep('m1_orientation');
      }

      renderer.render(scene, cameraRef.current);
    };

    gameLoop();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
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
    isSprint,
    targetCampusLocation,
    setTargetCampusLocation,
    missionProgress,
    completeMissionStep,
    setIsPhoneOpen,
  ]);

  // Dynamic Day/Night atmosphere updates
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    const hour = gameTime.hour;

    // Daytime (07:00 - 16:59)
    if (hour >= 7 && hour < 17) {
      sceneRef.current.background = new THREE.Color('#93c5fd');
      sceneRef.current.fog = new THREE.FogExp2('#93c5fd', 0.0075);
      dirLightRef.current.color.set('#fff7ed');
      dirLightRef.current.intensity = 1.3;
      hemiLightRef.current.intensity = 0.8;
    }
    // Sunset / Golden Hour (17:00 - 19:00)
    else if (hour >= 17 && hour < 20) {
      sceneRef.current.background = new THREE.Color('#fdba74');
      sceneRef.current.fog = new THREE.FogExp2('#fed7aa', 0.009);
      dirLightRef.current.color.set('#ea580c');
      dirLightRef.current.intensity = 1.1;
      hemiLightRef.current.intensity = 0.6;
    }
    // Night (20:00 - 06:59)
    else {
      sceneRef.current.background = new THREE.Color('#090d16');
      sceneRef.current.fog = new THREE.FogExp2('#090d16', 0.012);
      dirLightRef.current.color.set('#38bdf8');
      dirLightRef.current.intensity = 0.35;
      hemiLightRef.current.intensity = 0.35;
    }
  }, [gameTime.hour]);

  // Execute interactive action when prompt clicked or 'E' key pressed
  const handleInteract = useCallback(() => {
    if (!nearbyTarget) return;
    audioService.playClick();

    if (nearbyTarget.type === 'npc') {
      setActiveDialogNpc(nearbyTarget.id);
    } else if (nearbyTarget.type === 'location') {
      if (nearbyTarget.id === 'hostel_gate') {
        setCurrentView('room');
        showToast('🏠 Stepped into your Hostel Room.');
      } else if (nearbyTarget.id === 'library') {
        setCurrentView('library');
        showToast('📖 Entered UPSA Central Library.');
      } else if (nearbyTarget.id === 'lbc') {
        setCurrentView('lbc');
        showToast('🎓 Entered Lecture Block Complex (LBC).');
      } else if (nearbyTarget.id === 'student_centre') {
        setCurrentView('food_court');
        showToast('🍛 Entered Students Centre & Food Court.');
      } else if (nearbyTarget.id === 'banking_square') {
        setCurrentView('banking');
        showToast('🏦 Entered Banking Square & Career Center.');
      } else if (nearbyTarget.id === 'astroturf') {
        setCurrentView('astroturf');
        showToast('⚽ Stepped onto the UPSA AstroTurf pitch.');
      } else if (nearbyTarget.id === 'auditorium') {
        setActiveActivity('auditorium_event');
      }
    }
  }, [nearbyTarget, setActiveDialogNpc, setCurrentView, showToast, setActiveActivity]);

  // Listen for 'E' key interaction (ignoring typing inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        isPhoneOpen
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'e' && nearbyTarget) {
        handleInteract();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearbyTarget, handleInteract, isPhoneOpen]);

  return (
    <div className="relative w-full h-full min-h-[640px] bg-slate-950 select-none overflow-hidden flex flex-col">
      {/* 3D Campus Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Proximity Interaction Prompt (Clean Bottom-Center Banner) */}
      {nearbyTarget && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={handleInteract}
            className="flex items-center gap-3 bg-slate-900/95 hover:bg-slate-900 text-white border-2 border-emerald-500/80 hover:border-emerald-400 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-2xl backdrop-blur-md transition-all active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
              E
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                {nearbyTarget.type === 'npc' ? 'Campus Friend' : 'Campus Venue'}
              </span>
              <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-200 block truncate max-w-[220px] sm:max-w-xs">
                {nearbyTarget.actionText}
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse ml-1" />
          </button>
        </div>
      )}

      {/* Bottom Minimap & Quick Teleport Strip */}
      <div className="relative z-10 mt-auto p-3 sm:p-4 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        {/* Campus Compass / GPS Waypoint Dock */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-full px-3 py-1.5 shadow-xl flex items-center gap-1.5 overflow-x-auto max-w-[95vw] sm:max-w-none">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 px-2 shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">GPS:</span>
          </div>
          {CAMPUS_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                if (playerMeshRef.current) {
                  playerMeshRef.current.position.set(loc.position[0], 0, loc.position[2] + 7);
                  audioService.playClick();
                  showToast(`📍 Guided to ${loc.name}`);
                }
              }}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {loc.shortName}
            </button>
          ))}
        </div>


        {/* On-Screen Mobile Virtual D-Pad / Touch Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Sprint Toggle */}
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

          {/* Simple touch directional pad for mobile browsers */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/85 border border-slate-700/60 p-2 rounded-2xl shadow-xl">
            <div />
            <button
              onMouseDown={() => {
                touchDirection.current.y = -1;
              }}
              onMouseUp={() => {
                touchDirection.current.y = 0;
              }}
              onTouchStart={() => {
                touchDirection.current.y = -1;
              }}
              onTouchEnd={() => {
                touchDirection.current.y = 0;
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center"
            >
              ▲
            </button>
            <div />
            <button
              onMouseDown={() => {
                touchDirection.current.x = -1;
              }}
              onMouseUp={() => {
                touchDirection.current.x = 0;
              }}
              onTouchStart={() => {
                touchDirection.current.x = -1;
              }}
              onTouchEnd={() => {
                touchDirection.current.x = 0;
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center"
            >
              ◀
            </button>
            <button
              onMouseDown={() => {
                touchDirection.current.y = 1;
              }}
              onMouseUp={() => {
                touchDirection.current.y = 0;
              }}
              onTouchStart={() => {
                touchDirection.current.y = 1;
              }}
              onTouchEnd={() => {
                touchDirection.current.y = 0;
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center"
            >
              ▼
            </button>
            <button
              onMouseDown={() => {
                touchDirection.current.x = 1;
              }}
              onMouseUp={() => {
                touchDirection.current.x = 0;
              }}
              onTouchStart={() => {
                touchDirection.current.x = 1;
              }}
              onTouchEnd={() => {
                touchDirection.current.x = 0;
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold flex items-center justify-center"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
