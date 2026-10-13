/**
 * UPSA Life - Responsive Floating Smartphone Overlay
 * Features:
 * 1. UPSA ID Profile & Vital Needs
 * 2. UPSA Campus Guide (offline guide AI Powered Campus & Study Mentor)
 * 3. Social (ChitChat with coursemates, texting with typing isolation)
 * 4. CampusPay / MTN MoMo Wallet (With instant deposit allowance)
 * 5. OSIS Academic Portal (Timetable & Cumulative GPA)
 * 6. Campus Quests & Missions
 * 7. Campus Mart (Food Delivery & Room Renovation Decor Store)
 * 8. UPSA Arcade Games (Playable Snake Game, Wordle Word Quiz, Math Sprint)
 * 9. GPS Transit Navigator
 * 10. Settings & Reset Options
 *
 * Implemented with mobile-first CSS Grid & Flexbox to guarantee elements never clip or overlap on small screens.
 * All React hooks are called unconditionally at the top of the component to prevent hook-order crashes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameStateContext';
import { NPCS, CAMPUS_LOCATIONS, FOOD_MENU, RENOVATION_ITEMS } from '../data/gameData';
import {
  X,
  User,
  MessageSquare,
  Wallet,
  GraduationCap,
  MapPin,
  ShoppingBag,
  Target,
  Send,
  ArrowLeft,
  CheckCircle2,
  Wifi,
  Battery,
  Gamepad2,
  Bot,
  Sparkles,
  RotateCcw,
  BookOpen,
  DollarSign,
  Heart,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { audioService } from '../services/AudioService';
import { getOfflineTutorReply } from '../services/OfflineCampusAI';

export const PhoneOverlay: React.FC = () => {
  const {
    student,
    needs,
    walletBalance,
    transactions,
    friendships,
    chats,
    missions,
    courses,
    gameTime,
    isPhoneOpen,
    phoneActiveApp,
    setIsPhoneOpen,
    setPhoneActiveApp,
    sendChatMessage,
    modifyMoney,
    claimMissionReward,
    setCurrentView,
    buyFoodItem,
    buyRenovationItem,
    resetAllGameData,
    showToast,
    requestTransportTo,
    attendClassOrStudy,
  } = useGame();

  // Active chat state
  const [activeChatNpc, setActiveChatNpc] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [momoAmountInput, setMomoAmountInput] = useState('250');

  // Store Tabs: 'food' or 'renovation'
  const [storeTab, setStoreTab] = useState<'food' | 'renovation'>('food');

  // Games App: 'menu' | 'snake' | 'wordle' | 'math'
  const [gameMode, setGameMode] = useState<'menu' | 'snake' | 'wordle' | 'math'>('menu');

  // --- SNAKE GAME STATE ---
  const [snake, setSnake] = useState<Array<{ x: number; y: number }>>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const [snakeDir, setSnakeDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 8, y: 8 });
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [isSnakeRunning, setIsSnakeRunning] = useState(false);

  // --- WORDLE STATE ---
  const WORD_LIST = ['AUDIT', 'STUDY', 'BOOKS', 'SMART', 'DEBIT', 'CHALE', 'GRADE'];
  const [targetWord, setTargetWord] = useState('STUDY');
  const [wordGuesses, setWordGuesses] = useState<string[]>([]);
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [isWordleWon, setIsWordleWon] = useState(false);

  // --- MATH SPRINT STATE ---
  const [mathScore, setMathScore] = useState(0);
  const [mathQuestion, setMathQuestion] = useState({ q: 'Assets 140 - Liabilities 50 = ?', a: 90 });
  const [mathOptions, setMathOptions] = useState([90, 80, 110, 95]);

  // --- AI TUTOR & CAMPUS ADVISOR STATE ---
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{
      id: string;
      sender: 'user' | 'ai';
      text: string;
      time: string;
      sources?: Array<{ title: string; url: string }>;
    }>
  >([
    {
      id: 'ai-welcome',
      sender: 'ai',
      text: `Hello ${student?.name || 'Scholar'}! 🇬🇭 I’m your offline campus and study guide. Ask about basic course concepts, study habits, or fictional in-game locations.`,
      time: 'Just now',
    },
  ]);
  const [aiInputPrompt, setAiInputPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiChatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll AI chat messages
  useEffect(() => {
    if (phoneActiveApp === 'ai_tutor' && aiChatScrollRef.current) {
      aiChatScrollRef.current.scrollTop = aiChatScrollRef.current.scrollHeight;
    }
  }, [aiChatMessages, phoneActiveApp]);

  // --- SNAKE GAME LOOP (Always executed unconditionally at top level) ---
  useEffect(() => {
    if (!isPhoneOpen || phoneActiveApp !== 'games' || gameMode !== 'snake' || !isSnakeRunning || snakeGameOver) {
      return;
    }

    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + snakeDir.x, y: prev[0].y + snakeDir.y };

        // Wall collisions (12x12 grid)
        if (head.x < 0 || head.x >= 12 || head.y < 0 || head.y >= 12) {
          setSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prev;
        }

        // Self collisions
        if (prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prev;
        }

        const newSnake = [head, ...prev];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setSnakeScore((s) => s + 10);
          audioService.playClick();
          setFood({
            x: Math.floor(Math.random() * 12),
            y: Math.floor(Math.random() * 12),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [isPhoneOpen, phoneActiveApp, gameMode, isSnakeRunning, snakeGameOver, snakeDir, food]);

  // Early return ONLY happens after all React hooks are executed
  if (!isPhoneOpen) {
    return null;
  }

  const closePhone = () => {
    audioService.playClick();
    setIsPhoneOpen(false);
  };

  const handleAppClick = (appId: string) => {
    audioService.playClick();
    setPhoneActiveApp(appId);
    if (appId === 'games') setGameMode('menu');
  };

  const resetSnake = () => {
    setSnake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
    setSnakeDir({ x: 1, y: 0 });
    setSnakeScore(0);
    setSnakeGameOver(false);
    setIsSnakeRunning(true);
    setFood({ x: 8, y: 8 });
  };

  // Wordle guess submit
  const handleWordleSubmit = () => {
    if (currentWordInput.length !== 5) return;
    const guess = currentWordInput.toUpperCase();
    const newGuesses = [...wordGuesses, guess];
    setWordGuesses(newGuesses);
    setCurrentWordInput('');

    if (guess === targetWord) {
      setIsWordleWon(true);
      audioService.playSuccess();
      showToast('🎉 Brilliant! Wordle solved!');
    }
  };

  // Offline tutor uses authored local rules; it makes no network requests.
  const handleSendAiQuery = (queryText?: string) => {
    const question = (queryText || aiInputPrompt).trim();
    if (!question || isAiLoading) return;
    audioService.playClick();
    const time = `${String(gameTime?.hour ?? 9).padStart(2, '0')}:${String(gameTime?.minute ?? 30).padStart(2, '0')}`;
    setAiChatMessages((prev) => [
      ...prev,
      { id: `usr-${Date.now()}`, sender: 'user', text: question, time },
      { id: `ai-${Date.now() + 1}`, sender: 'ai', text: getOfflineTutorReply(question, student?.programme || 'your programme'), time },
    ]);
    setAiInputPrompt('');
    audioService.playSuccess();
  };

  const safeBalance = typeof walletBalance === 'number' ? walletBalance : 850;
  const safeGpa = typeof student?.gpa === 'number' ? student.gpa : 3.75;
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeMissions = Array.isArray(missions) ? missions : [];

  const currentNpcData = activeChatNpc ? NPCS[activeChatNpc] : null;
  const currentChatList = activeChatNpc && chats ? chats[activeChatNpc] || [] : [];

  return (
    <div
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Smartphone Hardware Frame (Responsive Flexbox Layout) */}
      <div className="relative w-full max-w-full sm:max-w-[400px] h-[100dvh] sm:h-[750px] sm:max-h-[94vh] bg-slate-950 rounded-none sm:rounded-[42px] border-0 sm:border-[6px] border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-0 sm:ring-4 ring-black/50">
        {/* Dynamic Island & Status Bar */}
        <div className="pt-2 sm:pt-3 px-5 sm:px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-400 select-none bg-slate-950 shrink-0 z-20">
          <span className="font-mono">
            {String(gameTime?.hour ?? 9).padStart(2, '0')}:
            {String(gameTime?.minute ?? 30).padStart(2, '0')}
          </span>
          <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Close Phone Button */}
        <button
          onClick={closePhone}
          className="absolute top-2.5 sm:top-3.5 right-3.5 sm:right-4 z-30 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shadow-lg active:scale-95"
          title="Close Phone"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Screen Content Wrapper (Flex column, never clipped) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-900">
          {/* Top Subheader if inside an app */}
          {phoneActiveApp !== 'home' && (
            <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  audioService.playClick();
                  if (activeChatNpc) {
                    setActiveChatNpc(null);
                  } else if (gameMode !== 'menu') {
                    setGameMode('menu');
                  } else {
                    setPhoneActiveApp('home');
                  }
                }}
                className="flex items-center gap-1 text-xs text-blue-400 font-bold hover:text-blue-300 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 truncate max-w-[200px]">
                {activeChatNpc
                  ? currentNpcData?.name || 'Chat'
                  : phoneActiveApp === 'games'
                  ? 'ARCADE'
                  : phoneActiveApp === 'ai_tutor'
                  ? 'UPSA GENIUS AI'
                  : phoneActiveApp.toUpperCase()}
              </h2>
              <div className="w-8" />
            </div>
          )}

          {/* 1. HOME SCREEN */}
          {phoneActiveApp === 'home' && (
            <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Clock Header */}
                <div className="text-center my-3 sm:my-4">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    {String(gameTime?.hour ?? 9).padStart(2, '0')}:
                    {String(gameTime?.minute ?? 30).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {gameTime?.dayName || 'Monday'} · Week {gameTime?.weekNumber || 1} · UPSA Campus
                  </div>
                </div>

                {/* Grid of Apps (4 Columns CSS Grid) */}
                <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-5">
                  {/* Profile */}
                  <button onClick={() => handleAppClick('profile')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">UPSA ID</span>
                  </button>

                  {/* AI Tutor */}
                  <button onClick={() => handleAppClick('ai_tutor')} className="flex flex-col items-center gap-1.5 group relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-purple-300 truncate max-w-full">Genius AI</span>
                    <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-[8px] rounded-full">
                      NEW
                    </span>
                  </button>

                  {/* Social */}
                  <button onClick={() => handleAppClick('social')} className="flex flex-col items-center gap-1.5 group relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">Social</span>
                    <span className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                  </button>

                  {/* Wallet */}
                  <button onClick={() => handleAppClick('wallet')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">CampusPay</span>
                  </button>

                  {/* Academics */}
                  <button onClick={() => handleAppClick('academics')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">OSIS Portal</span>
                  </button>

                  {/* Missions */}
                  <button onClick={() => handleAppClick('missions')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">Missions</span>
                  </button>

                  {/* Store & Decor */}
                  <button onClick={() => handleAppClick('store')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">Shop</span>
                  </button>

                  {/* Arcade */}
                  <button onClick={() => handleAppClick('games')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">Arcade</span>
                  </button>

                  {/* GPS Map */}
                  <button onClick={() => handleAppClick('map')} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-full">GPS Transit</span>
                  </button>
                </div>
              </div>

              {/* Bottom Quick Dock */}
              <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-2.5 flex items-center justify-around mt-4 shrink-0 border border-slate-700/60">
                <button
                  onClick={() => handleAppClick('profile')}
                  className="p-2 rounded-2xl bg-blue-600 text-white hover:scale-105 active:scale-95 transition-transform"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAppClick('ai_tutor')}
                  className="p-2 rounded-2xl bg-purple-600 text-white hover:scale-105 active:scale-95 transition-transform"
                  title="Genius AI"
                >
                  <Bot className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAppClick('social')}
                  className="p-2 rounded-2xl bg-emerald-600 text-white hover:scale-105 active:scale-95 transition-transform"
                  title="Social"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAppClick('wallet')}
                  className="p-2 rounded-2xl bg-amber-600 text-white hover:scale-105 active:scale-95 transition-transform"
                  title="CampusPay"
                >
                  <Wallet className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. PROFILE APP */}
          {phoneActiveApp === 'profile' && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
              {/* Official UPSA Smart Student ID Card */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-blue-400/20 pb-2 mb-3">
                  <div className="text-[11px] font-black tracking-widest text-blue-300 uppercase">
                    Univ. of Professional Studies, Accra
                  </div>
                  <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    STUDENT ID
                  </span>
                </div>

                <div className="flex gap-3.5 items-center">
                  <div className="w-16 h-20 rounded-2xl bg-slate-800 border-2 border-blue-400/50 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-md">
                    <div
                      className="w-8 h-8 rounded-full mb-1"
                      style={{ backgroundColor: student?.avatarConfig?.skinTone || '#78350f' }}
                    />
                    <div
                      className="w-11 h-6 rounded-t-lg"
                      style={{ backgroundColor: student?.avatarConfig?.shirtColor || '#2563eb' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-base text-white leading-tight truncate">
                      {student?.name || 'Student Name'}
                    </h3>
                    <div className="text-xs text-blue-300 font-semibold truncate mt-0.5">
                      {student?.programme || 'Degree Programme'}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-1">
                      ID: {student?.indexNumber || '10294821'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Level {student?.level || 100} · {student?.hostelName || 'Hostel'} ({student?.roomNumber || 'Room'})
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-blue-400/20 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Cumulative GPA:</span>
                  <span className="font-black font-mono text-emerald-400 text-sm">
                    {safeGpa.toFixed(2)} / 4.00
                  </span>
                </div>
              </div>

              {/* Student Vital Needs Dashboard */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vital Needs Meters
                </h4>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Energy (Sleep & Rest)</span>
                      <span className="font-semibold text-blue-400">{needs?.energy ?? 100}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${needs?.energy ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Nutrition (Food)</span>
                      <span className="font-semibold text-amber-400">{needs?.hunger ?? 100}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${needs?.hunger ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Morale & Happiness</span>
                      <span className="font-semibold text-rose-400">{needs?.happiness ?? 100}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${needs?.happiness ?? 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Hygiene (Cleanliness)</span>
                      <span className="font-semibold text-teal-400">{needs?.cleanliness ?? 100}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${needs?.cleanliness ?? 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. UPSA GENIUS AI APP (STUDY TUTOR & CAMPUS ADVISOR) */}
          {phoneActiveApp === 'ai_tutor' && (
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              {/* AI Header Bar */}
              <div className="p-3 bg-purple-950/60 border-b border-purple-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>UPSA Campus Guide</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-mono rounded">
                        Online
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-300">
                      Offline guide · No API calls
                    </div>
                  </div>
                </div>

                {/* Search Grounding Toggle & Clear Button */}
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 bg-emerald-950/60">Works offline · Free</span>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setAiChatMessages([
                        {
                          id: `ai-${Date.now()}`,
                          sender: 'ai',
                          text: `Chat cleared! How can I assist you with your UPSA studies today, ${student?.name}?`,
                          time: 'Just now',
                        },
                      ]);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Clear Conversation History"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div
                ref={aiChatScrollRef}
                className="flex-1 min-h-0 p-3 overflow-y-auto space-y-3 bg-slate-900/60"
              >
                {aiChatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-purple-500/20 text-[10px] space-y-0.5">
                            <span className="text-purple-300 font-bold block">
                              🔍 Verified Sources:
                            </span>
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-blue-400 hover:underline truncate"
                              >
                                • {src.title || src.url}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}

                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-purple-300 max-w-[80%] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>
                      {'Preparing an offline answer...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips & Input Box */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
                {/* Prompt Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {[
                    'Explain Trial Balance',
                    'FIFO vs LIFO logic',
                    'Where is Auntie Mansah?',
                    'Tips for First Class GPA',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendAiQuery(chip)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 border border-slate-700 whitespace-nowrap transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInputPrompt}
                    onChange={(e) => setAiInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') handleSendAiQuery();
                    }}
                    placeholder={
                      'Ask the offline campus guide about study or in-game locations...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleSendAiQuery()}
                    disabled={isAiLoading || !aiInputPrompt.trim()}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl transition-colors font-bold text-xs flex items-center justify-center shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. SOCIAL TEXTING APP */}
          {phoneActiveApp === 'social' && !activeChatNpc && (
            <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2">
              <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                UPSA Coursemates & Contacts
              </div>
              {Object.values(NPCS).map((npc) => {
                const fs = friendships?.[npc.id] || { score: 10, status: 'Acquaintance' };
                const npcChats = chats?.[npc.id] || [];
                const lastMsg = npcChats[npcChats.length - 1];

                return (
                  <div
                    key={npc.id}
                    onClick={() => {
                      audioService.playClick();
                      setActiveChatNpc(npc.id);
                    }}
                    className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer flex items-center gap-3 transition-colors group"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
                      style={{ backgroundColor: npc.shirtColor }}
                    >
                      {npc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-white group-hover:text-blue-300 truncate">
                          {npc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {fs.score}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : npc.defaultStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Thread inside Social */}
          {phoneActiveApp === 'social' && activeChatNpc && (
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              <div className="p-3 bg-slate-800/60 border-b border-slate-700 flex items-center justify-between shrink-0">
                <div>
                  <div className="font-semibold text-sm text-white">{currentNpcData?.name}</div>
                  <div className="text-[11px] text-slate-400">{currentNpcData?.programme}</div>
                </div>
                <div className="text-xs text-emerald-400 font-mono">Online</div>
              </div>

              <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2.5">
                {currentChatList.map((msg) => {
                  const isMe = msg.senderId === 'player';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/80 shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' && typedMessage.trim()) {
                        sendChatMessage(activeChatNpc, typedMessage.trim());
                        setTypedMessage('');
                      }
                    }}
                    placeholder="Type a message (W, A, S, D safe)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (typedMessage.trim()) {
                        sendChatMessage(activeChatNpc, typedMessage.trim());
                        setTypedMessage('');
                      }
                    }}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. WALLET APP (CAMPUSPAY / MTN MOMO) */}
          {phoneActiveApp === 'wallet' && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
              <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-600 rounded-3xl p-5 shadow-2xl text-white">
                <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                  <span className="font-semibold tracking-wide">CampusPay / MTN MoMo Balance</span>
                  <span className="font-mono bg-amber-900/60 px-2 py-0.5 rounded-full text-[10px]">
                    Active
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
                  GH₵ {safeBalance.toFixed(2)}
                </div>
                <div className="text-[11px] opacity-85 mt-1 truncate">
                  Account: {student?.name || 'Student'} ({student?.indexNumber || 'ID'})
                </div>
              </div>

              {/* Request MoMo Allowance */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  Request MoMo Allowance from Home
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={momoAmountInput}
                    onChange={(e) => setMomoAmountInput(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => {
                      const amt = parseFloat(momoAmountInput) || 250;
                      modifyMoney(amt, 'Family MoMo Allowance Deposit', 'stipend');
                      showToast(`📱 Received GH₵ ${amt} MoMo transfer!`);
                    }}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md active:scale-95"
                  >
                    Receive GH₵ {momoAmountInput} MoMo
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Transactions
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {safeTransactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="font-medium text-slate-200 truncate">{tx.title}</div>
                        <div className="text-[10px] text-slate-400">{tx.date}</div>
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'}GH₵ {Number(tx.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. ACADEMICS APP (OSIS PORTAL) */}
          {phoneActiveApp === 'academics' && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Semester Status</span>
                  <span className="text-xs font-bold text-purple-400">
                    Level {student?.level || 100}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">
                    {safeGpa.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 4.00 Cumulative GPA</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium mt-1">
                  First Class Honours Standing 🎓
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Semester Timetable
                </h4>
                {safeCourses.map((course) => (
                  <div
                    key={course.code}
                    className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{course.code}</span>
                      <span className="text-xs font-mono font-semibold text-purple-400">
                        Score: {course.gradeScore}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">{course.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>
                        {course.day} · {course.time}
                      </span>
                      <span>Venue: {course.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. STORE & ROOM RENOVATION SHOP */}
          {phoneActiveApp === 'store' && (
            <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-3">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 rounded-2xl border border-slate-700 shrink-0">
                <button
                  onClick={() => setStoreTab('food')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    storeTab === 'food'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Food Delivery
                </button>
                <button
                  onClick={() => setStoreTab('renovation')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    storeTab === 'renovation'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Room Decor & Renovation
                </button>
              </div>

              {/* Food Tab */}
              {storeTab === 'food' && (
                <div className="space-y-2">
                  {FOOD_MENU.map((foodItem) => (
                    <div
                      key={foodItem.id}
                      className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between gap-3"
                    >
                      <div className="text-2xl shrink-0">{foodItem.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">{foodItem.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {foodItem.description}
                        </div>
                      </div>
                      <button
                        onClick={() => buyFoodItem(foodItem)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-md transition-colors shrink-0"
                      >
                        GH₵ {foodItem.price}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Renovation Tab */}
              {storeTab === 'renovation' && (
                <div className="space-y-2">
                  {RENOVATION_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between gap-3"
                    >
                      <div className="text-2xl shrink-0">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                        <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                          +{item.happinessBonus} Happiness
                        </div>
                      </div>
                      <button
                        onClick={() => buyRenovationItem(item)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-md transition-colors shrink-0"
                      >
                        GH₵ {item.price}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. ARCADE / PHONE GAMES APP */}
          {phoneActiveApp === 'games' && (
            <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-3">
              {/* Menu */}
              {gameMode === 'menu' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select a Campus Phone Game
                  </div>

                  {/* Snake Game */}
                  <div
                    onClick={() => {
                      setGameMode('snake');
                      resetSnake();
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800 border border-emerald-500/40 cursor-pointer hover:border-emerald-400 transition-all flex items-center gap-3.5"
                  >
                    <div className="text-3xl p-2 rounded-xl bg-emerald-600 text-white">🐍</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">UPSA Snake Arcade</h4>
                      <p className="text-xs text-slate-400">Classic retro snake game. Eat apples & dodge walls!</p>
                    </div>
                  </div>

                  {/* Wordle Game */}
                  <div
                    onClick={() => {
                      setGameMode('wordle');
                      setTargetWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
                      setWordGuesses([]);
                      setIsWordleWon(false);
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-800 border border-blue-500/40 cursor-pointer hover:border-blue-400 transition-all flex items-center gap-3.5"
                  >
                    <div className="text-3xl p-2 rounded-xl bg-blue-600 text-white">🔤</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Campus Wordle Quiz</h4>
                      <p className="text-xs text-slate-400">Guess the secret 5-letter university word in 6 tries!</p>
                    </div>
                  </div>

                  {/* Math Sprint */}
                  <div
                    onClick={() => {
                      setGameMode('math');
                      setMathScore(0);
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-800 border border-amber-500/40 cursor-pointer hover:border-amber-400 transition-all flex items-center gap-3.5"
                  >
                    <div className="text-3xl p-2 rounded-xl bg-amber-600 text-white">⚡</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Accounting Math Sprint</h4>
                      <p className="text-xs text-slate-400">Rapid-fire accounting equation calculations!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SNAKE GAME VIEW */}
              {gameMode === 'snake' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">SCORE: {snakeScore}</span>
                    <button
                      onClick={resetSnake}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                    >
                      Reset Game
                    </button>
                  </div>

                  <div className="w-full aspect-square bg-slate-950 rounded-2xl border-2 border-slate-700 grid grid-cols-12 grid-rows-12 p-1 gap-0.5 relative">
                    {Array.from({ length: 144 }).map((_, idx) => {
                      const gx = idx % 12;
                      const gy = Math.floor(idx / 12);
                      const isHead = snake[0]?.x === gx && snake[0]?.y === gy;
                      const isBody = snake.slice(1).some((s) => s.x === gx && s.y === gy);
                      const isFood = food.x === gx && food.y === gy;

                      let cellColor = 'bg-slate-900/60';
                      if (isHead) cellColor = 'bg-emerald-400 rounded-sm';
                      else if (isBody) cellColor = 'bg-emerald-600 rounded-sm';
                      else if (isFood) cellColor = 'bg-rose-500 rounded-full animate-pulse';

                      return <div key={idx} className={cellColor} />;
                    })}

                    {snakeGameOver && (
                      <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center p-4">
                        <div className="text-rose-400 font-bold text-base mb-1">GAME OVER</div>
                        <div className="text-xs text-slate-300 mb-3">Final Score: {snakeScore}</div>
                        <button
                          onClick={resetSnake}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                        >
                          Play Again
                        </button>
                      </div>
                    )}
                  </div>

                  {/* D-Pad Controls */}
                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-1.5 w-36">
                      <div />
                      <button
                        onClick={() => {
                          if (snakeDir.y === 0) setSnakeDir({ x: 0, y: -1 });
                        }}
                        className="w-11 h-11 bg-slate-800 active:bg-emerald-600 rounded-xl font-bold flex items-center justify-center text-sm"
                      >
                        ▲
                      </button>
                      <div />
                      <button
                        onClick={() => {
                          if (snakeDir.x === 0) setSnakeDir({ x: -1, y: 0 });
                        }}
                        className="w-11 h-11 bg-slate-800 active:bg-emerald-600 rounded-xl font-bold flex items-center justify-center text-sm"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => {
                          if (snakeDir.y === 0) setSnakeDir({ x: 0, y: 1 });
                        }}
                        className="w-11 h-11 bg-slate-800 active:bg-emerald-600 rounded-xl font-bold flex items-center justify-center text-sm"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => {
                          if (snakeDir.x === 0) setSnakeDir({ x: 1, y: 0 });
                        }}
                        className="w-11 h-11 bg-slate-800 active:bg-emerald-600 rounded-xl font-bold flex items-center justify-center text-sm"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WORDLE VIEW */}
              {gameMode === 'wordle' && (
                <div className="space-y-3">
                  <div className="text-xs text-center text-slate-400 font-medium">
                    Guess the 5-letter campus word!
                  </div>

                  <div className="space-y-1.5 max-w-[240px] mx-auto">
                    {Array.from({ length: 6 }).map((_, rIdx) => {
                      const guess = wordGuesses[rIdx] || '';
                      return (
                        <div key={rIdx} className="grid grid-cols-5 gap-1.5">
                          {Array.from({ length: 5 }).map((_, cIdx) => {
                            const char = guess[cIdx] || '';
                            let tileColor = 'bg-slate-800 border-slate-700 text-white';
                            if (guess) {
                              if (targetWord[cIdx] === char) {
                                tileColor = 'bg-emerald-600 border-emerald-500 text-white';
                              } else if (targetWord.includes(char)) {
                                tileColor = 'bg-amber-600 border-amber-500 text-white';
                              } else {
                                tileColor = 'bg-slate-700 border-slate-600 text-slate-400';
                              }
                            }
                            return (
                              <div
                                key={cIdx}
                                className={`w-10 h-10 border rounded-lg flex items-center justify-center font-bold text-sm uppercase ${tileColor}`}
                              >
                                {char}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {!isWordleWon && wordGuesses.length < 6 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={5}
                        value={currentWordInput}
                        onChange={(e) => setCurrentWordInput(e.target.value.toUpperCase())}
                        placeholder="ENTER 5 LETTERS"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs uppercase font-mono text-center tracking-widest text-white"
                      />
                      <button
                        onClick={handleWordleSubmit}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl text-white"
                      >
                        Submit
                      </button>
                    </div>
                  )}

                  {(isWordleWon || wordGuesses.length >= 6) && (
                    <div className="text-center p-3 bg-slate-800/80 rounded-xl space-y-1">
                      <div className="font-bold text-sm text-emerald-400">
                        {isWordleWon ? '🎉 Solved!' : `Word was: ${targetWord}`}
                      </div>
                      <button
                        onClick={() => {
                          setTargetWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
                          setWordGuesses([]);
                          setIsWordleWon(false);
                        }}
                        className="px-3 py-1 bg-blue-600 rounded-lg text-xs font-bold text-white"
                      >
                        Next Word
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MATH SPRINT VIEW */}
              {gameMode === 'math' && (
                <div className="space-y-4 text-center">
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    ACCURACY SCORE: {mathScore}
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-base font-bold text-white">
                    {mathQuestion.q}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mathOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          audioService.playClick();
                          if (opt === mathQuestion.a) {
                            setMathScore((s) => s + 1);
                            audioService.playSuccess();
                          }
                          const a1 = Math.floor(100 + Math.random() * 200);
                          const l1 = Math.floor(30 + Math.random() * 80);
                          const correct = a1 - l1;
                          setMathQuestion({ q: `Assets ${a1} - Liabilities ${l1} = ?`, a: correct });
                          setMathOptions(
                            [correct, correct + 10, correct - 10, correct + 20].sort(
                              () => Math.random() - 0.5
                            )
                          );
                        }}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-amber-600 text-white font-mono font-bold text-sm transition-colors border border-slate-700"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 9. MISSIONS APP */}
          {phoneActiveApp === 'missions' && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                UPSA Campus Missions & Quests
              </div>
              {safeMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    mission.claimed
                      ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                      : mission.completed
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm">{mission.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                      {mission.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {mission.description}
                  </p>
                  <div className="text-[11px] text-blue-400 mb-2.5">
                    📍 {mission.locationHint}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <span className="text-xs font-mono text-amber-400">
                      Reward: GH₵ {mission.rewardMoney} · +{mission.rewardGpa} GPA
                    </span>
                    {mission.claimed ? (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => claimMissionReward(mission.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 10. GPS & TRANSIT APP */}
          {phoneActiveApp === 'map' && (
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                UPSA Campus GPS & Transit
              </div>

              {/* Hostel Room Option */}
              <button
                onClick={() => {
                  requestTransportTo('room', 'My Hostel Room');
                  setIsPhoneOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 hover:bg-indigo-900/60 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                  🏠
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white">My Hostel Room</div>
                  <div className="text-xs text-slate-400 truncate">
                    Take a ride or walk back to your hostel room
                  </div>
                </div>
              </button>

              {/* Campus Locations */}
              {CAMPUS_LOCATIONS.map((loc) => {
                const targetViewMap: Record<string, any> = {
                  library: 'library',
                  lbc: 'lbc',
                  student_centre: 'food_court',
                  banking_square: 'banking',
                  astroturf: 'astroturf',
                  auditorium: 'campus',
                  hostel_gate: 'room',
                };
                const view = targetViewMap[loc.id] || 'campus';

                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      requestTransportTo(view, loc.name);
                      setIsPhoneOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-left transition-colors flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: loc.color }}
                    >
                      {(loc.shortName || loc.name).substring(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">{loc.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{loc.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Home Bottom Indicator Bar */}
        <div className="p-2.5 sm:p-3 bg-slate-950 flex justify-center shrink-0">
          <button
            onClick={() => {
              audioService.playClick();
              if (activeChatNpc) {
                setActiveChatNpc(null);
              } else if (phoneActiveApp !== 'home') {
                setPhoneActiveApp('home');
              } else {
                closePhone();
              }
            }}
            className="w-28 sm:w-32 h-1.5 bg-slate-600 hover:bg-slate-400 rounded-full transition-colors active:scale-95"
            title="Home Bar"
          />
        </div>
      </div>
    </div>
  );
};
