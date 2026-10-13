/**
 * UPSA Life - Master Gaming HUD & Top Navigation Bar
 * Ultra-clean, modern industry standard UI (Persona / Sims style).
 * Features:
 * - Top Navigation Bar with View Switchers (Campus 3D, Room 3D, Academics, Hostels, Dashboard)
 * - Compact Floating Needs Status (unobtrusive, collapsible, zero overlap)
 * - MoMo Wallet balance, Gemini AI Tutor shortcut, and Smartphone launcher
 * - Responsive CSS Grid & Flexbox, guaranteed zero clipping.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { GameView } from '../types/game';
import {
  Battery,
  Coffee,
  Heart,
  Droplets,
  Smartphone,
  Home,
  Compass,
  BookOpen,
  Building,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  Coins,
  Bot,
  ChevronDown,
  ChevronUp,
  Target,
  Menu,
  X,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const HUD: React.FC = () => {
  const {
    student,
    needs,
    walletBalance,
    gameTime,
    missions,
    currentView,
    setCurrentView,
    setIsPhoneOpen,
    setPhoneActiveApp,
  } = useGame();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNeedsCollapsed, setIsNeedsCollapsed] = useState(false);

  if (!student) return null;

  const isNight = (gameTime?.hour ?? 9) >= 19 || (gameTime?.hour ?? 9) < 6;
  const safeBalance = typeof walletBalance === 'number' ? walletBalance : 850;
  const activeMission = missions?.find((m) => !m.completed) || missions?.[0];

  const navItems: Array<{ id: GameView; label: string; icon: React.ReactNode }> = [
    { id: 'campus', label: 'Campus 3D', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'room', label: 'Hostel Room', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'academics', label: 'Academics', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'accommodation', label: 'Hostels', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* 1. TOP MAIN NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 px-3 py-2 sm:px-6 sm:py-2.5 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl flex items-center justify-between gap-2 pointer-events-auto">
        {/* LEFT: Student Avatar & Clock */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => {
              audioService.playClick();
              setPhoneActiveApp('profile');
              setIsPhoneOpen(true);
            }}
            className="flex items-center gap-2 group text-left"
            title="Open Student Profile"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 ring-2 ring-white/10 group-hover:ring-blue-400 transition-all"
              style={{ backgroundColor: student.avatarConfig?.shirtColor || '#2563eb' }}
            >
              {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors leading-tight truncate max-w-[150px]">
                {student.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                L{student.level} · {student.programme?.replace('Bachelor of Laws (LLB)', 'LLB')?.replace('BSc ', '')}
              </div>
            </div>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300">
            {isNight ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span>
              {String(gameTime?.hour ?? 9).padStart(2, '0')}:
              {String(gameTime?.minute ?? 30).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* CENTER: Desktop View Switcher Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audioService.playClick();
                  setCurrentView(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Wallet, AI Tutor, Phone, Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* MoMo Balance */}
          <button
            onClick={() => {
              audioService.playClick();
              setPhoneActiveApp('wallet');
              setIsPhoneOpen(true);
            }}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-400 transition-colors shadow-sm"
            title="Open CampusPay / MTN MoMo"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>GH₵{safeBalance.toFixed(0)}</span>
          </button>

          {/* AI Tutor */}
          <button
            onClick={() => {
              audioService.playPhoneChime();
              setPhoneActiveApp('ai_tutor');
              setIsPhoneOpen(true);
            }}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            title="Open UPSA Genius AI Tutor"
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">AI Tutor</span>
          </button>

          {/* Smartphone */}
          <button
            onClick={() => {
              audioService.playPhoneChime();
              setIsPhoneOpen(true);
            }}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            title="Open Phone"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Phone</span>
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-12 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioService.playClick();
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. COMPACT FLOATING NEEDS STATUS PILL (Ultra-sleek, non-overlapping) */}
      <div className="fixed top-14 sm:top-15 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="bg-slate-950/90 hover:bg-slate-950 backdrop-blur-xl border border-slate-800/90 rounded-full px-3.5 py-1 sm:py-1.5 shadow-2xl flex items-center gap-3 sm:gap-4 text-xs font-mono select-none transition-all">
          {/* Energy */}
          <div className="flex items-center gap-1.5 text-blue-400" title={`Energy: ${needs?.energy ?? 100}%`}>
            <Battery className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{needs?.energy ?? 100}%</span>
          </div>

          {/* Food */}
          <div className="flex items-center gap-1.5 text-amber-400" title={`Nutrition: ${needs?.hunger ?? 100}%`}>
            <Coffee className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{needs?.hunger ?? 100}%</span>
          </div>

          {/* Morale */}
          <div className="flex items-center gap-1.5 text-rose-400" title={`Happiness: ${needs?.happiness ?? 100}%`}>
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{needs?.happiness ?? 100}%</span>
          </div>

          {/* Hygiene */}
          <div className="flex items-center gap-1.5 text-teal-400" title={`Cleanliness: ${needs?.cleanliness ?? 100}%`}>
            <Droplets className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{needs?.cleanliness ?? 100}%</span>
          </div>
        </div>
      </div>
    </>
  );
};
