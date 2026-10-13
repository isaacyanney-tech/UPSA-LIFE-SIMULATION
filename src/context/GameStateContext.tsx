/**
 * UPSA Life - Central Game State Context & Persistence Layer
 * Keeps Student Profile, Wallet, Needs, Friendships, Missions,
 * Room, Academics and Chats unified across Room, Campus and Phone.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  StudentProfile,
  StudentNeeds,
  RoomCustomization,
  FriendshipMap,
  FriendshipEntry,
  ChatMessage,
  Mission,
  MissionProgressMap,
  WalletTransaction,
  Course,
  InventoryItem,
  GameTime,
  GameView,
  WorkShiftState,
  TransportOption,
} from '../types/game';
import {
  NPCS,
  INITIAL_COURSES,
  INITIAL_MISSIONS,
  HOSTEL_OPTIONS,
} from '../data/gameData';
import { audioService } from '../services/AudioService';

// Storage Keys (strictly matching existing and required keys)
const STORAGE_KEYS = {
  STUDENT: 'upsaLifeStudent',
  FRIENDSHIPS: 'upsaLifeFriendships',
  MISSION_PROGRESS: 'upsaLifeMissionProgress',
  NEEDS: 'upsaLifeNeeds',
  WALLET: 'upsaLifeWallet',
  ROOM: 'upsaLifeRoom',
  CHATS: 'upsaLifeChats',
  TIME: 'upsaLifeTime',
  COURSES: 'upsaLifeCourses',
  INVENTORY: 'upsaLifeInventory',
};

export const clearSavedGameData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

const DEFAULT_NEEDS: StudentNeeds = {
  energy: 85,
  hunger: 75,
  happiness: 90,
  cleanliness: 95,
};

const DEFAULT_ROOM: RoomCustomization = {
  wallColor: '#e2e8f0',
  bedSpreadColor: '#1d4ed8',
  rugColor: '#3b82f6',
  poster: 'upsa-crest',
  deskPlant: true,
  fairyLights: true,
  studyLamp: true,
};

const DEFAULT_TIME: GameTime = {
  dayName: 'Monday',
  weekNumber: 3,
  hour: 9,
  minute: 30,
  timeSpeed: 1,
};

const DEFAULT_FRIENDSHIPS: FriendshipMap = {
  ama: {
    score: 35,
    status: 'Coursemate',
    unlockedHangouts: ['Library Study Session'],
  },
  kwame: {
    score: 25,
    status: 'Acquaintance',
    unlockedHangouts: ['Students Centre Gaming'],
  },
  esi: {
    score: 20,
    status: 'Acquaintance',
    unlockedHangouts: ['Banking Square Pastry Walk'],
  },
  kojo: {
    score: 25,
    status: 'Acquaintance',
    unlockedHangouts: ['AstroTurf Kickabout'],
  },
  prof_boateng: {
    score: 15,
    status: 'Acquaintance',
    unlockedHangouts: ['Academic Consultation'],
  },
  auntie_mansah: {
    score: 40,
    status: 'Friend',
    unlockedHangouts: ['Food Court Waakye Priority'],
  },
};

const INITIAL_CHAT_HISTORY: Record<string, ChatMessage[]> = {
  ama: [
    {
      id: 'ama-1',
      senderId: 'ama',
      text: 'Chale, are you coming for the ACC 101 tutorial today? Dr. Boateng said he is covering the trial balance!',
      timestamp: '08:45 AM',
      isRead: true,
    },
    {
      id: 'ama-2',
      senderId: 'player',
      text: 'Yes Ama, just heading out from the hostel soon!',
      timestamp: '08:48 AM',
      isRead: true,
    },
    {
      id: 'ama-3',
      senderId: 'ama',
      text: 'Great! Save me a seat near the whiteboard if you get there first 📝',
      timestamp: '08:50 AM',
      isRead: true,
    },
  ],
  kwame: [
    {
      id: 'kwame-1',
      senderId: 'kwame',
      text: 'Yo bro! Did you submit the Python algorithm assignment on the UPSA portal?',
      timestamp: 'Yesterday',
      isRead: true,
    },
    {
      id: 'kwame-2',
      senderId: 'kwame',
      text: 'Meet me at the Students Centre later, let’s test the new campus Wi-Fi network.',
      timestamp: '09:10 AM',
      isRead: false,
    },
  ],
  esi: [
    {
      id: 'esi-1',
      senderId: 'esi',
      text: 'Hey! Fresh batch of meat pies and banana cake just came out! Delivering to Access and Mandela hostels today ✨',
      timestamp: '09:00 AM',
      isRead: false,
    },
  ],
  kojo: [
    {
      id: 'kojo-1',
      senderId: 'kojo',
      text: 'Wassup! Department football trials start at 4:30 PM on the AstroTurf. You have your boots ready?',
      timestamp: '08:15 AM',
      isRead: true,
    },
  ],
};

interface GameContextType {
  student: StudentProfile | null;
  needs: StudentNeeds;
  walletBalance: number;
  transactions: WalletTransaction[];
  roomCustomization: RoomCustomization;
  friendships: FriendshipMap;
  chats: Record<string, ChatMessage[]>;
  missions: Mission[];
  missionProgress: MissionProgressMap;
  courses: Course[];
  inventory: InventoryItem[];
  gameTime: GameTime;
  currentView: GameView;
  isPhoneOpen: boolean;
  phoneActiveApp: string;
  activeDialogNpc: string | null;
  activeActivity: string | null;
  toastNotification: string | null;
  activeShift: WorkShiftState | null;
  activeTransport: {
    option: TransportOption;
    destinationView: GameView;
    destinationName: string;
  } | null;
  isTransportModalOpen: boolean;
  pendingTransportDestination: { view: GameView; name: string } | null;

  // Actions
  setStudentProfile: (profile: StudentProfile) => void;
  updateNeeds: (changes: Partial<StudentNeeds>) => void;
  modifyMoney: (
    amount: number,
    title: string,
    category: WalletTransaction['category']
  ) => boolean;
  updateRoomCustomization: (changes: Partial<RoomCustomization>) => void;
  adjustFriendship: (npcId: string, delta: number) => void;
  sendChatMessage: (npcId: string, text: string) => void;
  completeMissionStep: (missionId: string) => void;
  claimMissionReward: (missionId: string) => void;
  setCurrentView: (view: GameView) => void;
  setIsPhoneOpen: (open: boolean) => void;
  setPhoneActiveApp: (app: string) => void;
  setActiveDialogNpc: (npcId: string | null) => void;
  setActiveActivity: (actId: string | null) => void;
  showToast: (message: string) => void;
  passTime: (minutes: number) => void;
  attendClassOrStudy: (courseCode: string, isStudySession?: boolean) => void;
  buyFoodItem: (item: {
    id: string;
    name: string;
    price: number;
    hungerRestored: number;
    happinessRestored: number;
    energyRestored: number;
  }) => boolean;
  restInBed: (isFullSleep: boolean) => void;
  freshenUp: () => void;
  resetAllGameData: () => void;
  teleportTo: (view: GameView, locationId?: string) => void;
  targetCampusLocation: string | null;
  setTargetCampusLocation: (loc: string | null) => void;
  startWorkShift: (job: { id: string; title: string; pay: number; durationSeconds?: number }) => void;
  cancelWorkShift: () => void;
  setIsTransportModalOpen: (open: boolean) => void;
  requestTransportTo: (view: GameView, name: string) => void;
  startCommute: (option: TransportOption, targetView: GameView, destinationName: string) => void;
  dismissTransportCutscene: () => void;
  buyRenovationItem: (item: any) => boolean;
  completeLibraryChallenge: (score: number, total: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Student Profile
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Needs
  const [needs, setNeeds] = useState<StudentNeeds>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEEDS);
      return saved ? JSON.parse(saved) : DEFAULT_NEEDS;
    } catch {
      return DEFAULT_NEEDS;
    }
  });

  // 3. Wallet
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.balance === 'number' ? parsed.balance : 850;
      }
      return 850; // Starting semester allowance in GH₵
    } catch {
      return 850;
    }
  });

  const walletBalanceRef = useRef(walletBalance);

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.transactions || [];
      }
      return [
        {
          id: 'tx-1',
          title: 'Initial Semester Allowance from Family (MTN MoMo)',
          amount: 850,
          type: 'credit',
          date: 'Day 1',
          category: 'stipend',
        },
      ];
    } catch {
      return [];
    }
  });

  // 4. Room Customization
  const [roomCustomization, setRoomCustomization] = useState<RoomCustomization>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOM);
      return saved ? JSON.parse(saved) : DEFAULT_ROOM;
    } catch {
      return DEFAULT_ROOM;
    }
  });

  // 5. Friendships
  const [friendships, setFriendships] = useState<FriendshipMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
      return saved ? JSON.parse(saved) : DEFAULT_FRIENDSHIPS;
    } catch {
      return DEFAULT_FRIENDSHIPS;
    }
  });

  // 6. Chats
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_HISTORY;
    } catch {
      return INITIAL_CHAT_HISTORY;
    }
  });

  // 7. Mission Progress
  const [missionProgress, setMissionProgress] = useState<MissionProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MISSION_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    return INITIAL_MISSIONS.map((m) => {
      const prog = missionProgress[m.id];
      return {
        ...m,
        completed: prog ? prog.completed : false,
        claimed: prog ? prog.claimed : false,
      };
    });
  });

  // 8. Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  // 9. Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'inv-student-id',
              name: 'UPSA Student Smart Card',
              category: 'stationery',
              description: 'Official University ID card for biometric library access & exam halls.',
              quantity: 1,
              price: 0,
              icon: '💳',
            },
            {
              id: 'inv-notebook',
              name: 'Hardcover Lecture Journal',
              category: 'stationery',
              description: 'Ruled notebook for lecture summaries and study diagrams.',
              quantity: 2,
              price: 15,
              icon: '📓',
            },
          ];
    } catch {
      return [];
    }
  });

  // 10. Game Time
  const [gameTime, setGameTime] = useState<GameTime>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIME);
      return saved ? JSON.parse(saved) : DEFAULT_TIME;
    } catch {
      return DEFAULT_TIME;
    }
  });

  // View state
  const [currentView, setCurrentView] = useState<GameView>(() => {
    return student ? 'campus' : 'creation';
  });

  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [phoneActiveApp, setPhoneActiveApp] = useState('profile');
  const [activeDialogNpc, setActiveDialogNpc] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [targetCampusLocation, setTargetCampusLocation] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<WorkShiftState | null>(null);
  const [activeTransport, setActiveTransport] = useState<{
    option: TransportOption;
    destinationView: GameView;
    destinationName: string;
  } | null>(null);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [pendingTransportDestination, setPendingTransportDestination] = useState<{
    view: GameView;
    name: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (student) {
      localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT);
    }
  }, [student]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NEEDS, JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.WALLET,
      JSON.stringify({ balance: walletBalance, transactions })
    );
  }, [walletBalance, transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOM, JSON.stringify(roomCustomization));
  }, [roomCustomization]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
  }, [friendships]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISSION_PROGRESS, JSON.stringify(missionProgress));
  }, [missionProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME, JSON.stringify(gameTime));
  }, [gameTime]);

  // Toast Notification helper
  const showToast = useCallback((msg: string) => {
    setToastNotification(msg);
    const timer = setTimeout(() => {
      setToastNotification((prev) => (prev === msg ? null : prev));
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Time Progression Tick
  const passTime = useCallback((minutesToAdd: number) => {
    const safeMinutes = Number.isFinite(minutesToAdd) ? Math.max(0, Math.floor(minutesToAdd)) : 0;
    setGameTime((prev) => {
      const totalMins = prev.minute + safeMinutes;
      const totalHours = prev.hour + Math.floor(totalMins / 60);
      const remainingMins = totalMins % 60;
      const days: GameTime['dayName'][] = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      const currentDayIndex = Math.max(0, days.indexOf(prev.dayName));
      const daysAdvanced = Math.floor(totalHours / 24);
      const newDayIndex = (currentDayIndex + daysAdvanced) % days.length;
      const week = prev.weekNumber + Math.floor((currentDayIndex + daysAdvanced) / days.length);
      return {
        ...prev,
        hour: totalHours % 24,
        minute: remainingMins,
        dayName: days[newDayIndex],
        weekNumber: week,
      };
    });

    // Slight need drain on time pass
    setNeeds((prev) => ({
      energy: Math.max(0, Math.min(100, prev.energy - Math.floor(safeMinutes / 40))),
      hunger: Math.max(0, Math.min(100, prev.hunger - Math.floor(safeMinutes / 30))),
      cleanliness: Math.max(0, Math.min(100, prev.cleanliness - Math.floor(safeMinutes / 70))),
      happiness: Math.max(0, Math.min(100, prev.happiness - Math.floor(safeMinutes / 90))),
    }));
  }, []);

  // Periodic passive game tick (every 25 seconds = 15 minutes of campus life)
  useEffect(() => {
    const interval = setInterval(() => {
      passTime(10);
    }, 25000);
    return () => clearInterval(interval);
  }, [passTime]);

  // Set Profile
  const setStudentProfile = useCallback((profile: StudentProfile) => {
    setStudent(profile);
    setCurrentView('campus');
    audioService.playSuccess();
  }, []);

  // Update Needs
  const updateNeeds = useCallback((changes: Partial<StudentNeeds>) => {
    setNeeds((prev) => ({
      energy: Math.max(0, Math.min(100, (changes.energy !== undefined ? changes.energy : prev.energy))),
      hunger: Math.max(0, Math.min(100, (changes.hunger !== undefined ? changes.hunger : prev.hunger))),
      happiness: Math.max(0, Math.min(100, (changes.happiness !== undefined ? changes.happiness : prev.happiness))),
      cleanliness: Math.max(0, Math.min(100, (changes.cleanliness !== undefined ? changes.cleanliness : prev.cleanliness))),
    }));
  }, []);

  // Modify Money (GH₵)
  const modifyMoney = useCallback(
    (amount: number, title: string, category: WalletTransaction['category']): boolean => {
      if (!Number.isFinite(amount)) {
        showToast('❌ Invalid wallet amount.');
        return false;
      }
      const currentBalance = walletBalanceRef.current;
      if (amount < 0 && currentBalance + amount < 0) {
        showToast('❌ Insufficient funds in your CampusPay wallet!');
        return false;
      }

      const nextBalance = Math.max(0, currentBalance + amount);
      walletBalanceRef.current = nextBalance;
      setWalletBalance(nextBalance);

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        title,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit',
        date: `${gameTime.dayName} ${String(gameTime.hour).padStart(2, '0')}:${String(
          gameTime.minute
        ).padStart(2, '0')}`,
        category,
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (amount >= 0) {
        audioService.playCashSound();
        showToast(`💰 Received GH₵ ${amount.toFixed(2)} (${title})`);
      } else {
        audioService.playClick();
        showToast(`💳 Paid GH₵ ${Math.abs(amount).toFixed(2)} for ${title}`);
      }
      return true;
    },
    [gameTime, showToast]
  );

  // Room Customization
  const updateRoomCustomization = useCallback((changes: Partial<RoomCustomization>) => {
    setRoomCustomization((prev) => ({ ...prev, ...changes }));
    audioService.playClick();
    showToast('✨ Room decor updated!');
  }, [showToast]);

  // Friendship Adjust
  const adjustFriendship = useCallback(
    (npcId: string, delta: number) => {
      setFriendships((prev) => {
        const current = prev[npcId] || {
          score: 10,
          status: 'Acquaintance',
          unlockedHangouts: [],
        };
        const newScore = Math.max(0, Math.min(100, current.score + delta));
        let status: FriendshipEntry['status'] = 'Acquaintance';
        if (newScore >= 80) status = 'Best Friend';
        else if (newScore >= 60) status = 'Close Friend';
        else if (newScore >= 40) status = 'Friend';
        else if (newScore >= 20) status = 'Coursemate';

        const npc = NPCS[npcId];
        if (delta > 0) {
          showToast(`💚 Friendship with ${npc?.name || npcId} increased! (+${delta})`);
        }

        return {
          ...prev,
          [npcId]: {
            ...current,
            score: newScore,
            status,
          },
        };
      });
    },
    [showToast]
  );

  // Send Chat Message
  const sendChatMessage = useCallback(
    (npcId: string, text: string) => {
      const nowStr = `${String(gameTime.hour).padStart(2, '0')}:${String(
        gameTime.minute
      ).padStart(2, '0')}`;
      const playerMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'player',
        text,
        timestamp: nowStr,
        isRead: true,
      };

      setChats((prev) => ({
        ...prev,
        [npcId]: [...(prev[npcId] || []), playerMsg],
      }));
      audioService.playClick();

      // Trigger automatic realistic reply based on character personality
      setTimeout(() => {
        const npc = NPCS[npcId];
        let replyText = 'Noted! Catch you later around campus.';
        if (npcId === 'ama') {
          const amaReplies = [
            'Perfect! Make sure you revise Chapter 4 before Dr. Boateng begins the seminar!',
            'Thanks for checking in! Did you manage to balance the cash flow statement?',
            'I am heading to the Central Library soon. Want to grab a quiet table together?',
          ];
          replyText = amaReplies[Math.floor(Math.random() * amaReplies.length)];
        } else if (npcId === 'kwame') {
          const kwameReplies = [
            'Bet! Let me push this Git commit real quick and I’ll pull up.',
            'Did you check out the new tech workshop at the IT auditorium? Looks solid!',
            'Let’s grab FanYogo at the Students Centre afterwards.',
          ];
          replyText = kwameReplies[Math.floor(Math.random() * kwameReplies.length)];
        } else if (npcId === 'esi') {
          const esiReplies = [
            'Aww you’re the best! I saved a special warm pastry for you next time we link up!',
            'Business has been booming today in Banking Square! Talk to you soon!',
            'Let’s take a walk around University Avenue this evening!',
          ];
          replyText = esiReplies[Math.floor(Math.random() * esiReplies.length)];
        } else if (npcId === 'kojo') {
          const kojoReplies = [
            'Top man! Remember to stretch before coming onto the AstroTurf pitch!',
            'The match is going to be electric! Bring your A-game!',
            'Respect! Let’s link up near the sports complex pavilion.',
          ];
          replyText = kojoReplies[Math.floor(Math.random() * kojoReplies.length)];
        }

        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: npcId,
          text: replyText,
          timestamp: `${String(gameTime.hour).padStart(2, '0')}:${String(
            (gameTime.minute + 2) % 60
          ).padStart(2, '0')}`,
          isRead: false,
        };

        setChats((prev) => ({
          ...prev,
          [npcId]: [...(prev[npcId] || []), replyMsg],
        }));

        audioService.playPhoneChime();
        adjustFriendship(npcId, 3);
        showToast(`💬 New text from ${npc?.name || npcId}`);
      }, 1600);
    },
    [gameTime, adjustFriendship, showToast]
  );

  // Missions
  const completeMissionStep = useCallback(
    (missionId: string) => {
      setMissionProgress((prev) => {
        const curr = prev[missionId] || { completed: false, step: 0, claimed: false };
        if (curr.completed) return prev;
        const next = { ...prev, [missionId]: { ...curr, completed: true, step: 1 } };
        return next;
      });

      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
      );

      const targetMission = missions.find((m) => m.id === missionId);
      audioService.playSuccess();
      showToast(`🎯 Objective Complete: "${targetMission?.title || 'Mission'}"! Check Phone to claim reward.`);
    },
    [missions, showToast]
  );

  const claimMissionReward = useCallback(
    (missionId: string) => {
      const target = missions.find((m) => m.id === missionId);
      if (!target || !target.completed || target.claimed) return;

      // Award money
      modifyMoney(target.rewardMoney, `Quest Reward: ${target.title}`, 'stipend');

      // Award GPA
      if (student && target.rewardGpa) {
        setStudent((prev) => {
          if (!prev) return null;
          const newGpa = Math.min(4.0, Number((prev.gpa + target.rewardGpa).toFixed(2)));
          return { ...prev, gpa: newGpa };
        });
      }

      // Award Friendship
      if (target.rewardFriendship) {
        adjustFriendship(target.rewardFriendship.npcId, target.rewardFriendship.amount);
      }

      setMissionProgress((prev) => ({
        ...prev,
        [missionId]: { ...prev[missionId], claimed: true },
      }));

      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
      );

      audioService.playSuccess();
      showToast(`🏆 Claimed GH₵ ${target.rewardMoney} & +${target.rewardGpa} GPA boost!`);
    },
    [missions, student, modifyMoney, adjustFriendship, showToast]
  );

  // Attend Class or Study Session
  const attendClassOrStudy = useCallback(
    (courseCode: string, isStudySession = false) => {
      passTime(75);
      updateNeeds({
        energy: Math.max(10, needs.energy - 20),
        hunger: Math.max(10, needs.hunger - 15),
        happiness: Math.min(100, needs.happiness + 5),
      });

      setCourses((prev) =>
        prev.map((c) => {
          if (c.code === courseCode) {
            const nextAtt = Math.min(100, c.attendance + (isStudySession ? 0 : 5));
            const nextScore = Math.min(100, c.gradeScore + (isStudySession ? 6 : 4));
            return {
              ...c,
              attendance: nextAtt,
              gradeScore: nextScore,
            };
          }
          return c;
        })
      );

      // Boost overall GPA
      if (student) {
        setStudent((prev) => {
          if (!prev) return null;
          const currentTotal = courses.reduce((acc, c) => acc + c.gradeScore, 0);
          const calculatedGpa = Math.min(4.0, Number((2.0 + (currentTotal / (courses.length * 100)) * 2.0).toFixed(2)));
          return {
            ...prev,
            gpa: calculatedGpa,
            academicCredits: prev.academicCredits + 1,
          };
        });
      }

      audioService.playLectureBell();
      showToast(
        isStudySession
          ? `📚 Focused Study completed for ${courseCode}! Exam confidence boosted.`
          : `🎓 Attended ${courseCode} Lecture! Attendance & knowledge updated.`
      );

      // Check mission 3
      if (!missionProgress['m3_lecture_prep']?.completed) {
        completeMissionStep('m3_lecture_prep');
      }
    },
    [needs, passTime, updateNeeds, student, courses, missionProgress, completeMissionStep, showToast]
  );

  // Food purchase
  const buyFoodItem = useCallback(
    (item: {
      id: string;
      name: string;
      price: number;
      hungerRestored: number;
      happinessRestored: number;
      energyRestored: number;
    }) => {
      const ok = modifyMoney(-item.price, item.name, 'food');
      if (!ok) return false;

      updateNeeds({
        hunger: Math.min(100, needs.hunger + item.hungerRestored),
        happiness: Math.min(100, needs.happiness + item.happinessRestored),
        energy: Math.min(100, needs.energy + item.energyRestored),
      });

      passTime(20);
      showToast(`😋 Enjoyed delicious ${item.name}!`);

      // Complete Waakye mission if relevant
      if (
        (item.id.includes('waakye') || item.id.includes('jollof')) &&
        !missionProgress['m4_waakye_run']?.completed
      ) {
        completeMissionStep('m4_waakye_run');
      }

      return true;
    },
    [modifyMoney, updateNeeds, needs, passTime, showToast, missionProgress, completeMissionStep]
  );

  // Rest in Bed
  const restInBed = useCallback(
    (isFullSleep: boolean) => {
      if (isFullSleep) {
        passTime(480); // 8 hours
        updateNeeds({
          energy: 100,
          happiness: Math.min(100, needs.happiness + 20),
          hunger: Math.max(20, needs.hunger - 30),
          cleanliness: Math.max(30, needs.cleanliness - 15),
        });
        audioService.playSleepSound();
        showToast('🛌 Had a full 8-hour restful night in your hostel room! Energy restored to 100%.');
      } else {
        passTime(60); // 1 hour nap
        updateNeeds({
          energy: Math.min(100, needs.energy + 35),
          happiness: Math.min(100, needs.happiness + 10),
          hunger: Math.max(20, needs.hunger - 10),
        });
        audioService.playSleepSound();
        showToast('💤 Took a rejuvenating 1-hour power nap! Energy refreshed.');
      }
    },
    [passTime, updateNeeds, needs, showToast]
  );

  // Freshen Up
  const freshenUp = useCallback(() => {
    passTime(20);
    updateNeeds({
      cleanliness: 100,
      happiness: Math.min(100, needs.happiness + 15),
      energy: Math.min(100, needs.energy + 5),
    });
    audioService.playClick();
    showToast('🚿 Fresh shower & grooming completed! Cleanliness restored to 100%.');
  }, [passTime, updateNeeds, needs, showToast]);

  // Teleport / Scene Transition
  const teleportTo = useCallback((view: GameView, locationId?: string) => {
    setCurrentView(view);
    if (locationId) {
      setTargetCampusLocation(locationId);
    }
    audioService.playClick();
  }, []);

  // Work Shift 60-Second Real-Time Countdown & Payout
  useEffect(() => {
    if (!activeShift || activeShift.isCompleted) return;

    const timer = setInterval(() => {
      setActiveShift((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          // Completed Shift in Full!
          clearInterval(timer);
          modifyMoney(prev.pay, `Completed Full Shift: ${prev.title}`, 'work');
          passTime(15);
          updateNeeds({
            energy: Math.max(10, needs.energy - 20),
            hunger: Math.max(10, needs.hunger - 15),
            happiness: Math.min(100, needs.happiness + 15),
          });
          audioService.playCashSound();
          showToast(`🎉 Shift Complete! Paid GH₵ ${prev.pay.toFixed(2)} in full!`);
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeShift, modifyMoney, passTime, updateNeeds, needs, showToast]);

  const startWorkShift = useCallback(
    (job: { id: string; title: string; pay: number; durationSeconds?: number }) => {
      const duration = job.durationSeconds || 60; // 1-minute work shift
      setActiveShift({
        jobId: job.id,
        title: job.title,
        totalSeconds: duration,
        remainingSeconds: duration,
        pay: job.pay,
        isCompleted: false,
      });
      audioService.playClick();
      showToast(`💼 Clocked in for 1-minute shift: "${job.title}". Stay focused to earn GH₵ ${job.pay}!`);
    },
    [showToast]
  );

  const cancelWorkShift = useCallback(() => {
    if (activeShift) {
      showToast('⚠️ Shift abandoned early! No wage was paid.');
      setActiveShift(null);
      audioService.playClick();
    }
  }, [activeShift, showToast]);

  // Request Transport / Commute with Cutscene
  const requestTransportTo = useCallback((view: GameView, name: string) => {
    setPendingTransportDestination({ view, name });
    setIsTransportModalOpen(true);
  }, []);

  const startCommute = useCallback(
    (option: TransportOption, targetView: GameView, destinationName: string) => {
      if (option.cost > 0 && walletBalance < option.cost) {
        showToast('❌ Insufficient funds in CampusPay for this transit option!');
        return;
      }
      if (option.cost > 0) {
        modifyMoney(-option.cost, `Campus Commute: ${option.name}`, 'shopping');
      }
      passTime(option.timeMinutes);
      updateNeeds({
        energy: Math.max(0, needs.energy + option.energyChange),
        happiness: Math.min(100, needs.happiness + option.happinessChange),
      });

      setIsTransportModalOpen(false);
      setActiveTransport({ option, destinationView: targetView, destinationName });
      audioService.playClick();
    },
    [walletBalance, modifyMoney, passTime, updateNeeds, needs, showToast]
  );

  const dismissTransportCutscene = useCallback(() => {
    if (activeTransport) {
      setCurrentView(activeTransport.destinationView);
      showToast(`📍 Arrived at ${activeTransport.destinationName}`);
      setActiveTransport(null);
      audioService.playClick();
    }
  }, [activeTransport, showToast]);

  // Renovation Shop Purchase
  const buyRenovationItem = useCallback(
    (item: any) => {
      const ok = modifyMoney(-item.price, `Room Renovation: ${item.name}`, 'shopping');
      if (!ok) return false;

      updateNeeds({ happiness: Math.min(100, needs.happiness + (item.happinessBonus || 15)) });

      if (item.appliedType === 'plant') {
        updateRoomCustomization({ deskPlant: true });
      } else if (item.appliedType === 'fairyLights') {
        updateRoomCustomization({ fairyLights: true });
      } else if (item.appliedType === 'lamp') {
        updateRoomCustomization({ studyLamp: true });
      }

      setInventory((prev) => [
        ...prev,
        {
          id: `inv-${Date.now()}`,
          name: item.name,
          category: 'decor',
          description: item.description,
          quantity: 1,
          price: item.price,
          icon: item.icon,
        },
      ]);

      audioService.playCashSound();
      showToast(`✨ Purchased ${item.name}! Added to your hostel room.`);
      return true;
    },
    [modifyMoney, updateNeeds, needs, updateRoomCustomization, showToast]
  );

  // Library Academic Challenge mini-game
  const completeLibraryChallenge = useCallback(
    (score: number, total: number) => {
      const gpaBonus = Number(((score / total) * 0.15).toFixed(2));
      passTime(45);
      updateNeeds({
        energy: Math.max(10, needs.energy - 15),
        happiness: Math.min(100, needs.happiness + 20),
      });

      if (student) {
        setStudent((prev) => {
          if (!prev) return null;
          const newGpa = Math.min(4.0, Number((prev.gpa + gpaBonus).toFixed(2)));
          return { ...prev, gpa: newGpa, academicCredits: prev.academicCredits + 1 };
        });
      }

      audioService.playSuccess();
      showToast(`📚 Library Challenge finished (${score}/${total})! +${gpaBonus} GPA boost!`);
    },
    [passTime, updateNeeds, needs, student, showToast]
  );

  // Reset Data
  const resetAllGameData = useCallback(() => {
    clearSavedGameData();
    setStudent(null);
    setNeeds(DEFAULT_NEEDS);
    walletBalanceRef.current = 850;
    setWalletBalance(850);
    setTransactions([]);
    setRoomCustomization(DEFAULT_ROOM);
    setFriendships(DEFAULT_FRIENDSHIPS);
    setChats(INITIAL_CHAT_HISTORY);
    setMissionProgress({});
    setMissions(INITIAL_MISSIONS);
    setCourses(INITIAL_COURSES);
    setGameTime(DEFAULT_TIME);
    setCurrentView('creation');
    setIsPhoneOpen(false);
    showToast('🔄 Game reset successfully.');
  }, [showToast]);

  return (
    <GameContext.Provider
      value={{
        student,
        needs,
        walletBalance,
        transactions,
        roomCustomization,
        friendships,
        chats,
        missions,
        missionProgress,
        courses,
        inventory,
        gameTime,
        currentView,
        isPhoneOpen,
        phoneActiveApp,
        activeDialogNpc,
        activeActivity,
        toastNotification,
        targetCampusLocation,
        activeShift,
        activeTransport,
        isTransportModalOpen,
        pendingTransportDestination,
        setStudentProfile,
        updateNeeds,
        modifyMoney,
        updateRoomCustomization,
        adjustFriendship,
        sendChatMessage,
        completeMissionStep,
        claimMissionReward,
        setCurrentView,
        setIsPhoneOpen,
        setPhoneActiveApp,
        setActiveDialogNpc,
        setActiveActivity,
        showToast,
        passTime,
        attendClassOrStudy,
        buyFoodItem,
        restInBed,
        freshenUp,
        resetAllGameData,
        teleportTo,
        setTargetCampusLocation,
        startWorkShift,
        cancelWorkShift,
        setIsTransportModalOpen,
        requestTransportTo,
        startCommute,
        dismissTransportCutscene,
        buyRenovationItem,
        completeLibraryChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
