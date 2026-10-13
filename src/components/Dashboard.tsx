/**
 * UPSA Life - Master Student Dashboard / Homepage
 * Industry-standard university portal and life simulation homepage.
 * Features semester KPIs, quick 3D launchers, live OSIS timetable,
 * hostel preview, active quests, and campus announcements.
 */

import React from 'react';
import { useGame } from '../context/GameStateContext';
import {
  GraduationCap,
  Compass,
  Home,
  BookOpen,
  Building,
  Coins,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Bed,
  TrendingUp,
  Award,
  Bell,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const Dashboard: React.FC = () => {
  const {
    student,
    walletBalance,
    needs,
    courses,
    missions,
    gameTime,
    setCurrentView,
    setIsPhoneOpen,
    setPhoneActiveApp,
    requestTransportTo,
  } = useGame();

  if (!student) return null;

  const safeBalance = typeof walletBalance === 'number' ? walletBalance : 850;
  const safeGpa = typeof student.gpa === 'number' ? student.gpa : 3.75;
  const activeMission = missions?.find((m) => !m.completed) || missions?.[0];
  const isNight = (gameTime?.hour ?? 9) >= 19 || (gameTime?.hour ?? 9) < 6;

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 overflow-y-auto pb-24 pt-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HERO WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>University of Professional Studies, Accra (UPSA)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Welcome, {student.name}! 🇬🇭
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {student.programme} · Level {student.level} · Index No: {student.indexNumber}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono font-medium text-amber-400">
                  {isNight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {gameTime?.dayName}, Week {gameTime?.weekNumber} · {String(gameTime?.hour ?? 9).padStart(2, '0')}:{String(gameTime?.minute ?? 30).padStart(2, '0')}
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">Matriculated Student</span>
              </div>
            </div>

            {/* Quick 3D Jump Actions */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <button
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('campus');
                }}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Explore 3D Campus</span>
              </button>
              <button
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('room');
                }}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Home className="w-4 h-4 text-indigo-400" />
                <span>Hostel Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KEY STATS / METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* GPA Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="text-xs text-slate-400 font-semibold mb-1">Cumulative GPA</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
              <span>{safeGpa.toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-normal">/ 4.00</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>First Class Honours</span>
            </div>
          </div>

          {/* MoMo Balance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="text-xs text-slate-400 font-semibold mb-1">CampusPay / MoMo</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              GH₵ {safeBalance.toFixed(0)}
            </div>
            <button
              onClick={() => {
                audioService.playClick();
                setPhoneActiveApp('wallet');
                setIsPhoneOpen(true);
              }}
              className="text-[11px] font-semibold text-amber-300 hover:underline mt-2 flex items-center gap-1"
            >
              <span>Manage Wallet</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Accommodation Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className="text-xs text-slate-400 font-semibold mb-1">Hostel Residence</div>
            <div className="text-base sm:text-lg font-bold text-white truncate">
              {student.hostelName}
            </div>
            <div className="text-[11px] text-indigo-300 mt-2">
              Room {student.roomNumber} · {student.roomType}
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="text-xs text-slate-400 font-semibold mb-1">Academic Load</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {courses?.length || 5} <span className="text-xs text-slate-400 font-normal">Courses</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>15 Credit Hours Registered</span>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN SECTION: Portal Navigation & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Quick Portal Launchpad */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Campus Life Portals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 3D Campus Scene */}
              <div
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('campus');
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-300">
                      UPSA 3D Campus Quad
                    </h3>
                    <p className="text-xs text-slate-400">Walk University Avenue, meet friends & explore landmarks</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-2 border-t border-slate-800">
                  <span>Enter 3D World</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 3D Hostel Room */}
              <div
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('room');
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-300">
                      My 3D Hostel Room
                    </h3>
                    <p className="text-xs text-slate-400">Sleep in bed, study at desk, rest & customize decor</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800">
                  <span>Enter Room</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* OSIS Academics Portal */}
              <div
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('academics');
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-blue-300">
                      OSIS Academic Portal
                    </h3>
                    <p className="text-xs text-slate-400">Timetable, exams, course grades & GPA calculator</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-2 border-t border-slate-800">
                  <span>View Courses</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Accommodation Portal */}
              <div
                onClick={() => {
                  audioService.playClick();
                  setCurrentView('accommodation');
                }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-amber-300">
                      Hostel Accommodation
                    </h3>
                    <p className="text-xs text-slate-400">Access Hall, Mandela Block & 1-4 occupant options</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold pt-2 border-t border-slate-800">
                  <span>Browse Hostels</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* AI Tutor Featured Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>UPSA Genius AI Tutor</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                      Gemini + Search
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mt-0.5">
                    Prepare for mid-sem exams in Accounting, IT, Marketing, or Law with verified real-time explanations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  audioService.playPhoneChime();
                  setPhoneActiveApp('ai_tutor');
                  setIsPhoneOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg shrink-0 transition-colors"
              >
                Chat with Genius AI
              </button>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Active Mission & Timetable Overview */}
          <div className="space-y-4">
            {/* Quest Tracker */}
            {activeMission && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Target className="w-4 h-4" /> Active Quest
                  </span>
                  <span className="font-mono text-amber-400">Reward: GH₵ {activeMission.rewardMoney}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{activeMission.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{activeMission.description}</p>
                <div className="text-[11px] text-blue-400 font-medium">📍 {activeMission.locationHint}</div>
                <button
                  onClick={() => {
                    audioService.playClick();
                    setPhoneActiveApp('missions');
                    setIsPhoneOpen(true);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Quest Log
                </button>
              </div>
            )}

            {/* University Noticeboard */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Campus Announcements</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="font-semibold text-white">LBC Hall 4: Dr. Boateng Tutorial</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Double-entry accounting trial balance review.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="font-semibold text-white">Students Centre: Hot Waakye Ready</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Auntie Mansah’s fresh batch of shito and Sobolo.</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="font-semibold text-white">AstroTurf Varsity Trials</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Department football selections this afternoon.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
